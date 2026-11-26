import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Archive,
  ArrowLeft,
  Calendar,
  Folder,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
} from 'lucide-react';
import type { FocusSession, Project, Task, TaskStatus } from '@/types';
import {
  isTaskCompleted,
  isTaskDeleted,
  isTaskOverdue,
} from '@/modules/tasks/domain/rules';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/button';
import { TaskRows } from '@/components/tasks/TaskRows';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  sessions: FocusSession[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onToggleArchive: (id: number) => void;
  onDeleteProject: (id: number) => void;
  onNewTaskInProject: (projectName: string, initialStatus?: TaskStatus) => void;
  onToggleTask: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onToggleSubtask: (taskId: number, subtaskId: string) => void;
}

export function ProjectDetailView({
  project,
  tasks,
  sessions,
  onBack,
  onEditProject,
  onToggleArchive,
  onDeleteProject,
  onNewTaskInProject,
  onToggleTask,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
}: ProjectDetailViewProps) {
  const { tr } = useI18n();
  const [displayMode, setDisplayMode] = useState<'Lista' | 'Kanban'>('Lista');

  const projectTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !isTaskDeleted(t) &&
          (t.projectId === project.id || (t.projectId === null && t.project === project.name)),
      ),
    [tasks, project.id, project.name],
  );

  const projectSessions = useMemo(() => {
    const taskIds = new Set(projectTasks.map((t) => t.id));
    const taskTitles = new Set(projectTasks.map((t) => t.title));
    return sessions.filter(
      (s) => (s.taskId !== null && taskIds.has(s.taskId)) || taskTitles.has(s.taskTitle),
    );
  }, [projectTasks, sessions]);

  const completed = projectTasks.filter((t) => isTaskCompleted(t)).length;
  const activeCount = projectTasks.filter(
    (t) => t.status === 'Pending' || t.status === 'InProgress',
  ).length;
  const overdue = projectTasks.filter((t) => isTaskOverdue(t)).length;
  const pct = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;

  const focusMinsTotal = projectSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusLabel =
    focusMinsTotal >= 60
      ? `${Math.floor(focusMinsTotal / 60)}h ${focusMinsTotal % 60}m`
      : `${focusMinsTotal}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >
      {/* Back navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          {tr('Volver a proyectos', 'Back to projects')}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onEditProject(project)}>
            <Pencil className="h-3.5 w-3.5" />
            {tr('Editar', 'Edit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleArchive(project.id)}
          >
            {project.archived ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                {tr('Restaurar', 'Restore')}
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                {tr('Archivar', 'Archive')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onDeleteProject(project.id);
              onBack();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {tr('Eliminar', 'Delete')}
          </Button>
        </div>
      </div>

      {/* Project Header Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white ${project.color}`}
            >
              <Folder className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display m-0 text-xl font-extrabold tracking-tight text-[var(--text)]">
                  {project.name}
                </h2>
                {project.archived && (
                  <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                    {tr('Archivado', 'Archived')}
                  </span>
                )}
              </div>
              <p className="m-0 mt-1 text-sm text-[var(--muted)]">{project.desc}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {tr('Objetivo:', 'Target:')} <strong className="text-[var(--text)]">{project.date}</strong>
                </span>
                <span className="font-mono-num">
                  {tr('Avance:', 'Progress:')} <strong className="text-[var(--text)]">{pct}%</strong> ({completed}/
                  {projectTasks.length})
                </span>
              </div>
            </div>
          </div>

          <Button type="button" onClick={() => onNewTaskInProject(project.name, 'Pending')}>
            <Plus className="h-4 w-4" />
            {tr('Nueva tarea', 'New task')}
          </Button>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </Card>

      {/* Project KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="list"
          tone="green"
          label={tr('Tareas activas', 'Active tasks')}
          value={activeCount}
          note={tr(`De ${projectTasks.length} en este proyecto`, `Out of ${projectTasks.length} in project`)}
        />
        <MetricCard
          icon="check"
          tone="blue"
          label={tr('Completadas', 'Completed')}
          value={completed}
          note={tr(`${pct}% completado`, `${pct}% completed`)}
        />
        <MetricCard
          icon="flag"
          tone="orange"
          label={tr('Vencidas', 'Overdue')}
          value={overdue}
          note={
            overdue > 0
              ? tr('Requieren atención', 'Need attention')
              : tr('Todo al día', 'All caught up')
          }
        />
        <MetricCard
          icon="timer"
          tone="violet"
          label={tr('Tiempo enfocado', 'Focused time')}
          value={focusLabel}
          note={tr(`${projectSessions.length} sesiones registradas`, `${projectSessions.length} sessions logged`)}
        />
      </div>

      {/* Project Tasks Workspace */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>{tr(`Tareas del proyecto (${projectTasks.length})`, `Project tasks (${projectTasks.length})`)}</CardTitle>
            <CardDescription>
              {tr(`Solo actividades vinculadas a ${project.name}`, `Only tasks linked to ${project.name}`)}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-[var(--surface-2)] p-1">
              <button
                type="button"
                onClick={() => setDisplayMode('Lista')}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all ${
                  displayMode === 'Lista'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                {tr('Lista', 'List')}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('Kanban')}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all ${
                  displayMode === 'Kanban'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </button>
            </div>
          </div>
        </CardHeader>

        {displayMode === 'Lista' ? (
          <TaskRows
            tasks={projectTasks}
            onToggleTask={onToggleTask}
            onChangeStatus={onChangeStatus}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onToggleSubtask={onToggleSubtask}
          />
        ) : (
          <KanbanBoard
            tasks={projectTasks}
            onAdd={(status) => onNewTaskInProject(project.name, status)}
            onChangeStatus={onChangeStatus}
            onEditTask={onEditTask}
          />
        )}
      </Card>

      {/* Project Focus History */}
      {projectSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{tr('Sesiones de enfoque del proyecto', 'Project focus sessions')}</CardTitle>
              <CardDescription>
                {tr(`${projectSessions.length} bloques registrados`, `${projectSessions.length} blocks logged`)}
              </CardDescription>
            </div>
            <Timer className="h-4 w-4 text-[var(--muted)]" />
          </CardHeader>
          <CardContent className="divide-y divide-[var(--line)] py-2">
            {projectSessions.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <span className={`h-6 w-1 rounded-full ${s.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">{s.taskTitle}</p>
                  <p className="font-mono-num m-0 text-xs text-[var(--muted)]">
                    {s.date} · {s.completedAt} · {s.durationMinutes} min
                  </p>
                </div>
                <span className="font-mono-num text-xs font-bold text-[var(--accent)]">
                  {s.completionRate}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
