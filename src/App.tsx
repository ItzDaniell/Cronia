import { useEffect, useMemo, useRef, useState } from 'react';
import type {
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
  INITIAL_EVENTS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_PROJECTS,
  INITIAL_REMINDERS,
  INITIAL_TASKS,
  MODULE_ITEMS,
  PAGE_DESCRIPTIONS,
  WEEK_DAYS_DEFAULT,
} from './data/initialData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Icon } from './components/ui/Icon';
import { Toast } from './components/ui/Toast';
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
  const [settings, setSettings] = useLocalStorage<UserSettings>('cronia.settings', DEFAULT_SETTINGS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('cronia.tasks', INITIAL_TASKS);
  const [projects, setProjects] = useLocalStorage<Project[]>('cronia.projects', INITIAL_PROJECTS);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('cronia.events', INITIAL_EVENTS);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('cronia.reminders', INITIAL_REMINDERS);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('cronia.sessions', INITIAL_FOCUS_SESSIONS);

  const [active, setActive] = useState<ModuleName>('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.dark);
  }, [settings.dark]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 25 * 60)), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

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

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const openModule = (name: ModuleName) => {
    setActive(name);
    setMenuOpen(false);
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, done: !task.done, status: !task.done ? 'Completada' : 'Pendiente' }
          : task,
      ),
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    notify('Tarea eliminada');
  };

  const handleCreateTask = (draft: Omit<Task, 'id'>) => {
    setTasks((prev) => [{ id: Date.now(), ...draft }, ...prev]);
    setModalOpen(false);
    notify('La tarea se creó correctamente');
  };

  const handleCreateProject = (name: string, desc: string) => {
    setProjects((prev) => [
      ...prev,
      { id: Date.now(), name, desc, color: 'violet', done: 0, total: 1, date: 'Sin fecha', archived: false },
    ]);
    notify('Nuevo proyecto creado');
  };

  const handleToggleArchiveProject = (id: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        notify(p.archived ? 'Proyecto restaurado' : 'Proyecto archivado');
        return { ...p, archived: !p.archived };
      }),
    );
  };

  const handleSaveReminder = (reminder: Reminder, isNew: boolean) => {
    setReminders((prev) =>
      isNew ? [...prev, reminder] : prev.map((item) => (item.id === reminder.id ? reminder : item)),
    );
    notify(isNew ? 'Recordatorio programado' : 'Recordatorio actualizado');
  };

  const handleToggleReminder = (id: number) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleDeleteReminder = (id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    notify('Recordatorio cancelado');
  };

  const handleCompleteSession = (taskTitle: string, durationMinutes: number) => {
    const completedAt = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    setSessions((prev) => [
      { id: Date.now(), taskTitle, durationMinutes, completedAt, completionRate: 100, color: 'violet' },
      ...prev,
    ]);
    notify('Sesión registrada en el historial');
  };

  const handleResetAllData = () => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    setEvents(INITIAL_EVENTS);
    setReminders(INITIAL_REMINDERS);
    setSessions(INITIAL_FOCUS_SESSIONS);
    setSettings(DEFAULT_SETTINGS);
    notify('Datos locales restablecidos');
  };

  const completedCount = tasks.filter((t) => t.done).length;
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
            tasks={tasks}
            projects={projects}
            events={events}
            weekDays={WEEK_DAYS_DEFAULT}
            now={now}
            timerRunning={timerRunning}
            onToggleTask={handleToggleTask}
            onNavigate={openModule}
            onToggleTimer={() => setTimerRunning((prev) => !prev)}
            onOpenNewTask={() => setModalOpen(true)}
          />
        );
      case 'Tareas':
        return (
          <TasksPage
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => setModalOpen(true)}
          />
        );
      case 'Proyectos':
        return (
          <ProjectsPage
            projects={projects}
            userInitials={userInitials}
            onCreateProject={handleCreateProject}
            onToggleArchive={handleToggleArchiveProject}
            onNavigate={openModule}
          />
        );
      case 'Calendario':
        return (
          <CalendarPage
            events={events}
            onAddEvent={(ev) => {
              setEvents((prev) => [...prev, { id: Date.now(), ...ev }]);
              notify('Evento añadido al calendario');
            }}
            onUpdateEvent={(updated) => {
              setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
              notify('Cambios del evento guardados');
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((ev) => ev.id !== id));
              notify('Evento eliminado del calendario');
            }}
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
            tasks={tasks}
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
            tasks={tasks}
            projects={projects}
            sessions={sessions}
            weekDays={WEEK_DAYS_DEFAULT}
          />
        );
      case 'Configuración':
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={updateSettings}
            onResetAllData={handleResetAllData}
            onNotify={notify}
          />
        );
    }
  }, [active, events, now, projects, reminders, seconds, sessions, settings, tasks, timerRunning, userInitials]);

  return (
    <div className="app">
      <Sidebar
        modules={MODULE_ITEMS}
        active={active}
        menuOpen={menuOpen}
        onSelect={openModule}
        onCloseMenu={() => setMenuOpen(false)}
        completedCount={completedCount}
        totalCount={tasks.length}
        activeRemindersCount={activeRemindersCount}
        userName={settings.userName}
      />

      <main>
        <Header
          query={query}
          onQueryChange={setQuery}
          searchRef={searchRef}
          modules={MODULE_ITEMS}
          tasks={tasks}
          projects={projects}
          dark={settings.dark}
          onToggleTheme={() => updateSettings({ dark: !settings.dark })}
          onOpenModule={openModule}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenNewTask={() => setModalOpen(true)}
        />

        <div className="page" key={active}>
          <div className="page-title">
            <div>
              <span>CRONIA / {active.toUpperCase()}</span>
              <h1>{active}</h1>
              <p>{PAGE_DESCRIPTIONS[active]}</p>
            </div>
            {active !== 'Configuración' && (
              <button type="button" className="primary mobile-new" onClick={() => setModalOpen(true)}>
                <Icon name="plus" />
                Crear
              </button>
            )}
          </div>
          {page}
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          projects={projects}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateTask}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
