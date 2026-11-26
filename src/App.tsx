import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import type {
  AccentTone,
  AppData,
  BackupInfo,
  CalendarEvent,
  FocusSession,
  ModuleName,
  Project,
  Reminder,
  Task,
  UserSettings,
} from './types';
import {
  DEFAULT_SETTINGS,
  EMPTY_APP_DATA,
  MODULE_ITEMS,
  PAGE_DESCRIPTIONS,
} from './data/initialData';
import { persistence } from './services/persistence';
import { taskService, TaskValidationError } from './modules/tasks/application/taskService';
import type { CreateTaskDto, UpdateTaskDto } from './modules/tasks/application/dtos';
import { isTaskCompleted, isTaskDeleted, toLocalDateKey } from './modules/tasks/domain/rules';
import { computeWeeklyStats } from './utils/analytics';
import { playCompletionChime } from './utils/sound';
import type { TaskStatus } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/ui/Toast';
import { Button } from './components/ui/button';
import { TaskModal } from './components/modals/TaskModal';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CalendarPage } from './pages/CalendarPage';
import { RemindersPage } from './pages/RemindersPage';
import { FocusPage } from './pages/FocusPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);

  const [active, setActive] = useState<ModuleName>('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus>('Pending');
  const [toast, setToast] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const persistAsync = (op: Promise<unknown>) => {
    op.catch((err) => {
      console.error('Error de persistencia:', err);
      notify('No se pudo guardar en la base de datos local');
    });
  };

  useEffect(() => {
    let cancelled = false;
    persistence
      .loadAppData(EMPTY_APP_DATA)
      .then((data) => {
        if (cancelled) return;
        setSettings(data.settings);
        setTasks(data.tasks);
        setProjects(data.projects);
        setEvents(data.events);
        setReminders(data.reminders);
        setSessions(data.sessions);
      })
      .catch((err) => {
        console.error('Error al cargar datos locales:', err);
        if (!cancelled) notify('No se pudieron cargar los datos locales');
      });
    persistence
      .listBackups()
      .then((items) => {
        if (!cancelled) setBackups(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.dark);
    document.documentElement.dataset.accent = settings.accent;
  }, [settings.dark, settings.accent]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s > 1) return s - 1;
        setTimerRunning(false);
        if (settings.soundEnabled) playCompletionChime();
        notify('¡Sesión de enfoque completada!');
        return 25 * 60;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, settings.soundEnabled]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  const openModule = (name: ModuleName) => {
    setActive(name);
    setMenuOpen(false);
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    persistAsync(persistence.saveSettings(next));
  };

  const openNewTaskModal = (initialStatus: TaskStatus = 'Pending') => {
    setEditingTask(null);
    setModalInitialStatus(initialStatus);
    setModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setModalInitialStatus(task.status);
    setModalOpen(true);
  };

  const handleToggleTask = (id: number) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    taskService
      .toggleComplete(current)
      .then(({ updated, spawned }) => {
        setTasks((prev) => {
          const mapped = prev.map((t) => (t.id === id ? updated : t));
          return spawned ? [spawned, ...mapped] : mapped;
        });
        if (spawned) {
          notify('Tarea completada y siguiente ocurrencia programada');
        }
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo actualizar la tarea');
      });
  };

  const handleChangeTaskStatus = (id: number, status: TaskStatus) => {
    const current = tasks.find((task) => task.id === id);
    if (!current || current.status === status) return;
    taskService
      .changeStatus(current, status)
      .then(({ updated, spawned }) => {
        setTasks((prev) => {
          const mapped = prev.map((t) => (t.id === id ? updated : t));
          return spawned ? [spawned, ...mapped] : mapped;
        });
        if (spawned) {
          notify('Tarea completada y siguiente ocurrencia programada');
        }
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo cambiar el estado de la tarea');
      });
  };

  const handleSoftDeleteTask = (id: number) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    taskService
      .softDelete(current)
      .then((trashed) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? trashed : t)));
        notify('Tarea movida a la papelera');
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo mover la tarea a la papelera');
      });
  };

  const handleRestoreTask = (id: number) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    taskService
      .restore(current)
      .then((restored) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? restored : t)));
        notify('Tarea restaurada desde la papelera');
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo restaurar la tarea');
      });
  };

  const handlePermanentDeleteTask = (id: number) => {
    taskService
      .permanentDelete(id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        notify('Tarea eliminada permanentemente');
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo eliminar la tarea');
      });
  };

  const handleToggleSubtask = (taskId: number, subtaskId: string) => {
    const current = tasks.find((task) => task.id === taskId);
    if (!current) return;
    taskService
      .toggleSubtask(current, subtaskId)
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo actualizar la subtarea');
      });
  };

  const handleCreateTask = (dto: CreateTaskDto) => {
    taskService
      .create(dto)
      .then((created) => {
        setTasks((prev) => [created, ...prev]);
        setModalOpen(false);
        setEditingTask(null);
        notify('La tarea se creó correctamente');
      })
      .catch((err) => {
        if (err instanceof TaskValidationError) {
          notify(err.message);
        } else {
          console.error(err);
          notify('No se pudo crear la tarea');
        }
      });
  };

  const handleUpdateTask = (dto: UpdateTaskDto) => {
    const current = tasks.find((task) => task.id === dto.id);
    if (!current) return;
    taskService
      .update(current, dto)
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === dto.id ? updated : t)));
        setModalOpen(false);
        setEditingTask(null);
        notify('Tarea actualizada correctamente');
      })
      .catch((err) => {
        if (err instanceof TaskValidationError) {
          notify(err.message);
        } else {
          console.error(err);
          notify('No se pudo actualizar la tarea');
        }
      });
  };

  const handleSaveProject = (draft: {
    id?: number;
    name: string;
    desc: string;
    color: AccentTone;
    date: string;
  }) => {
    if (draft.id) {
      const existing = projects.find((p) => p.id === draft.id);
      if (!existing) return;
      const updated: Project = {
        ...existing,
        name: draft.name,
        desc: draft.desc,
        color: draft.color,
        date: draft.date,
      };
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      persistAsync(persistence.upsertProject(updated));
      notify('Proyecto actualizado');
      return;
    }

    const created: Project = {
      id: Date.now(),
      name: draft.name,
      desc: draft.desc,
      color: draft.color,
      done: 0,
      total: 0,
      date: draft.date,
      archived: false,
    };
    setProjects((prev) => [...prev, created]);
    persistAsync(persistence.upsertProject(created));
    notify('Nuevo proyecto creado');
  };

  const handleDeleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.projectId === id ? { ...t, projectId: null, project: 'Sin proyecto' } : t)),
    );
    persistAsync(persistence.deleteProject(id));
    notify('Proyecto eliminado');
  };

  const handleToggleArchiveProject = (id: number) => {
    const current = projects.find((p) => p.id === id);
    if (!current) return;
    const updated: Project = { ...current, archived: !current.archived };
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    persistAsync(persistence.upsertProject(updated));
    notify(current.archived ? 'Proyecto restaurado' : 'Proyecto archivado');
  };

  const handleSaveReminder = (reminder: Reminder, isNew: boolean) => {
    setReminders((prev) =>
      isNew ? [...prev, reminder] : prev.map((item) => (item.id === reminder.id ? reminder : item)),
    );
    persistAsync(persistence.upsertReminder(reminder));
    notify(isNew ? 'Recordatorio programado' : 'Recordatorio actualizado');
  };

  const handleToggleReminder = (id: number) => {
    const current = reminders.find((r) => r.id === id);
    if (!current) return;
    const updated: Reminder = { ...current, enabled: !current.enabled };
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    persistAsync(persistence.upsertReminder(updated));
  };

  const handleDeleteReminder = (id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    persistAsync(persistence.deleteReminder(id));
    notify('Recordatorio cancelado');
  };

  const handleCompleteSession = (taskTitle: string, durationMinutes: number) => {
    const completedAt = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const matchedTask = tasks.find((t) => t.title === taskTitle);
    const created: FocusSession = {
      id: Date.now(),
      taskId: matchedTask?.id ?? null,
      taskTitle,
      durationMinutes,
      date: toLocalDateKey(),
      completedAt,
      completionRate: 100,
      color: 'violet',
    };
    setSessions((prev) => [created, ...prev]);
    persistAsync(persistence.upsertFocusSession(created));
    notify('Sesión registrada en el historial');
  };

  const handleCreateBackup = () => {
    persistence
      .createBackup()
      .then((info) => {
        setBackups((prev) => [info, ...prev.filter((b) => b.fileName !== info.fileName)]);
        notify(`Copia creada: ${info.fileName}`);
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo crear la copia de seguridad');
      });
  };

  const handleRestoreBackup = (fileName: string) => {
    persistence
      .restoreBackup(fileName, DEFAULT_SETTINGS)
      .then((data) => {
        setSettings(data.settings);
        setTasks(data.tasks);
        setProjects(data.projects);
        setEvents(data.events);
        setReminders(data.reminders);
        setSessions(data.sessions);
        notify('Copia de seguridad restaurada correctamente');
      })
      .catch((err) => {
        console.error(err);
        notify('No se pudo restaurar la copia de seguridad');
      });
  };

  const handleResetAllData = () => {
    setTasks([]);
    setProjects([]);
    setEvents([]);
    setReminders([]);
    setSessions([]);
    setSettings(DEFAULT_SETTINGS);
    persistAsync(persistence.resetAllData(EMPTY_APP_DATA));
    notify('Datos locales restablecidos');
  };

  const activeTasks = useMemo(() => tasks.filter((t) => !isTaskDeleted(t)), [tasks]);
  const weekDays = useMemo(() => computeWeeklyStats(activeTasks, sessions, now), [activeTasks, sessions, now]);
  const completedCount = activeTasks.filter((t) => isTaskCompleted(t)).length;
  const activeRemindersCount = reminders.filter((r) => r.enabled).length;
  const userInitials =
    settings.userName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CR';

  const page = useMemo(() => {
    switch (active) {
      case 'Dashboard':
        return (
          <DashboardPage
            userName={settings.userName}
            tasks={activeTasks}
            projects={projects}
            events={events}
            weekDays={weekDays}
            now={now}
            timerRunning={timerRunning}
            onToggleTask={handleToggleTask}
            onNavigate={openModule}
            onToggleTimer={() => setTimerRunning((prev) => !prev)}
            onOpenNewTask={() => openNewTaskModal('Pending')}
          />
        );
      case 'Tareas':
        return (
          <TasksPage
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onChangeStatus={handleChangeTaskStatus}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleSoftDeleteTask}
            onRestoreTask={handleRestoreTask}
            onPermanentDeleteTask={handlePermanentDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onOpenNewTask={openNewTaskModal}
          />
        );
      case 'Proyectos':
        return (
          <ProjectsPage
            projects={projects}
            tasks={activeTasks}
            userInitials={userInitials}
            onSaveProject={handleSaveProject}
            onToggleArchive={handleToggleArchiveProject}
            onDeleteProject={handleDeleteProject}
            onNavigate={openModule}
          />
        );
      case 'Calendario':
        return (
          <CalendarPage
            events={events}
            tasks={activeTasks}
            onAddEvent={(ev) => {
              const created: CalendarEvent = { id: Date.now(), ...ev };
              setEvents((prev) => [...prev, created]);
              persistAsync(persistence.upsertEvent(created));
              notify('Evento añadido al calendario');
            }}
            onUpdateEvent={(updated) => {
              setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
              persistAsync(persistence.upsertEvent(updated));
              notify('Cambios del evento guardados');
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((ev) => ev.id !== id));
              persistAsync(persistence.deleteEvent(id));
              notify('Evento eliminado del calendario');
            }}
            onEditTask={openEditTaskModal}
          />
        );
      case 'Recordatorios':
        return (
          <RemindersPage
            reminders={reminders}
            onSaveReminder={handleSaveReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onNotify={notify}
          />
        );
      case 'Enfoque':
        return (
          <FocusPage
            tasks={activeTasks}
            sessions={sessions}
            seconds={seconds}
            running={timerRunning}
            onSetSeconds={setSeconds}
            onSetRunning={setTimerRunning}
            onCompleteSession={handleCompleteSession}
            onNotify={notify}
          />
        );
      case 'Estadísticas':
        return (
          <StatsPage
            tasks={activeTasks}
            projects={projects}
            sessions={sessions}
            weekDays={weekDays}
          />
        );
      case 'Configuración':
        return (
          <SettingsPage
            settings={settings}
            backups={backups}
            onUpdateSettings={updateSettings}
            onCreateBackup={handleCreateBackup}
            onRestoreBackup={handleRestoreBackup}
            onResetAllData={handleResetAllData}
            onNotify={notify}
          />
        );
    }
  }, [active, activeTasks, backups, events, now, projects, reminders, seconds, sessions, settings, tasks, timerRunning, userInitials, weekDays]);

  const timerLabel = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar
        modules={MODULE_ITEMS}
        active={active}
        menuOpen={menuOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onSelect={openModule}
        onCloseMenu={() => setMenuOpen(false)}
        completedCount={completedCount}
        totalCount={activeTasks.length}
        activeRemindersCount={activeRemindersCount}
        userName={settings.userName}
        timerRunning={timerRunning}
        timerLabel={timerLabel}
      />

      <main
        className={`flex min-w-0 flex-1 flex-col overflow-x-clip transition-all duration-250 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}
      >
        <Header
          active={active}
          query={query}
          onQueryChange={setQuery}
          searchRef={searchRef}
          modules={MODULE_ITEMS}
          tasks={activeTasks}
          projects={projects}
          dark={settings.dark}
          onToggleTheme={() => updateSettings({ dark: !settings.dark })}
          onOpenModule={openModule}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenNewTask={() => openNewTaskModal('Pending')}
        />

        <div className="w-full flex-1 px-5 py-6 lg:px-8 lg:py-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display m-0 text-2xl font-extrabold tracking-tight sm:text-[26px]">
                {active}
              </h1>
              <p className="m-0 mt-1 text-[13.5px] text-[var(--muted)]">{PAGE_DESCRIPTIONS[active]}</p>
            </div>
            {active !== 'Configuración' && (
              <Button
                type="button"
                size="sm"
                onClick={() => openNewTaskModal('Pending')}
                className="sm:hidden"
              >
                <Plus className="h-4 w-4" />
                Crear
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {page}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          projects={projects}
          taskToEdit={editingTask}
          initialStatus={modalInitialStatus}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onCreate={handleCreateTask}
          onUpdate={handleUpdateTask}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
