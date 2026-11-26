import { ArrowUpRight, Calendar, Pause, Play, Plus, Timer } from 'lucide-react';
import type { CalendarEvent, ModuleName, Project, Task, WeekDayStat } from '@/types';
import { isTaskCompleted, isTaskDueToday, isTaskOverdue, toLocalDateKey } from '@/modules/tasks/domain/rules';
import { computeProjectProgress } from '@/utils/analytics';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';
import { WeeklyBars } from '@/components/ui/WeeklyBars';
import { TaskRows } from '@/components/tasks/TaskRows';
import { Button } from '@/components/ui/button';

interface DashboardPageProps {
  userName: string;
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  weekDays: WeekDayStat[];
  now: Date;
  timerRunning: boolean;
  onToggleTask: (id: number) => void;
  onNavigate: (module: ModuleName) => void;
  onOpenProject: (projectId: number) => void;
  onToggleTimer: () => void;
  onOpenNewTask: () => void;
}

export function DashboardPage({
  userName,
  tasks,
  projects,
  events,
  weekDays,
  now,
  timerRunning,
  onToggleTask,
  onNavigate,
  onOpenProject,
  onToggleTimer,
  onOpenNewTask,
}: DashboardPageProps) {
  const { tr, locale } = useI18n();
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  const completed = tasks.filter((t) => isTaskCompleted(t)).length;
  const pending = tasks.filter((t) => t.status === 'Pending' || t.status === 'InProgress').length;
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
  const dueTodayCount = tasks.filter((t) => !isTaskCompleted(t) && isTaskDueToday(t)).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const activeProjects = projects.filter((p) => !p.archived);
  const todayKey = toLocalDateKey(now);
  const matchingToday = events.filter((e) => e.date === todayKey);
  const todayEvents = (matchingToday.length > 0 ? matchingToday : events).slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Editorial Studio Hero */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="m-0 text-xs font-medium capitalize text-[var(--muted)]">{dateLabel}</p>
            <h2 className="font-display m-0 mt-1 text-2xl font-extrabold tracking-tight text-[var(--text)]">
              {tr(`Hola, ${userName}`, `Hi, ${userName}`)}
            </h2>
            <p className="m-0 mt-1 text-sm text-[var(--muted)]">
              {pending > 0
                ? tr(
                    `Tienes ${pending} tareas activas (${dueTodayCount} para hoy).`,
                    `You have ${pending} active tasks (${dueTodayCount} for today).`,
                  )
                : tr(
                    'Tu espacio está despejado. Planifica tu próxima sesión.',
                    'Your workspace is clear. Plan your next session.',
                  )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[96px] flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-center">
              <span className="font-mono-num text-xl font-bold leading-none text-[var(--text)]">
                {timeLabel}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {tr('Hora local', 'Local time')}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onToggleTimer();
                onNavigate('Enfoque');
              }}
            >
              {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {timerRunning ? tr('Ver enfoque', 'View focus') : tr('Enfoque 25m', 'Focus 25m')}
            </Button>

            <Button type="button" onClick={onOpenNewTask}>
              <Plus className="h-4 w-4" />
              {tr('Nueva tarea', 'New task')}
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="list"
          tone="green"
          label={tr('Activas', 'Active')}
          value={pending}
          note={tr(`${dueTodayCount} para hoy`, `${dueTodayCount} due today`)}
        />
        <MetricCard
          icon="check"
          tone="blue"
          label={tr('Completadas', 'Completed')}
          value={completed}
          note={tr(`De ${tasks.length} totales`, `Out of ${tasks.length} total`)}
        />
        <MetricCard
          icon="flag"
          tone="orange"
          label={tr('Vencidas', 'Overdue')}
          value={overdue}
          note={
            overdue > 0
              ? tr('Requiere atención', 'Needs attention')
              : tr('Todo al día', 'All caught up')
          }
        />
        <MetricCard
          icon="target"
          tone="violet"
          label={tr('Progreso', 'Progress')}
          value={`${progress}%`}
          note={tr('Meta diaria: 100%', 'Daily goal: 100%')}
        />
      </div>

      {/* Bento Row 1 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>{tr('Prioridades de hoy', "Today's priorities")}</CardTitle>
              <CardDescription>
                {tr(`${pending} actividades pendientes`, `${pending} pending activities`)}
              </CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Tareas')}>
              {tr('Abrir Tareas', 'Open Tasks')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <TaskRows tasks={tasks} onToggleTask={onToggleTask} compact />
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>{tr('Agenda', 'Schedule')}</CardTitle>
              <CardDescription className="capitalize">{dateLabel}</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Calendario')}>
              {tr('Calendario', 'Calendar')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Calendar className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">
                  {tr('Sin eventos hoy', 'No events today')}
                </p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  {tr(
                    'Programa bloques de tiempo desde el Calendario.',
                    'Schedule time blocks from the Calendar.',
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 px-3.5 py-2.5"
                  >
                    <span className="font-mono-num text-xs font-bold text-[var(--muted)]">{ev.time}</span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${ev.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">{ev.title}</p>
                      <p className="m-0 text-xs text-[var(--muted)]">{ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bento Row 2 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>{tr('Ritmo semanal', 'Weekly rhythm')}</CardTitle>
              <CardDescription>
                {tr('Actividad completada por día', 'Completed activity per day')}
              </CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Estadísticas')}>
              {tr('Analíticas', 'Analytics')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <WeeklyBars days={weekDays} />
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>{tr('Proyectos activos', 'Active projects')}</CardTitle>
              <CardDescription>
                {tr(`${activeProjects.length} en curso`, `${activeProjects.length} active`)}
              </CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Proyectos')}>
              {tr('Ver todos', 'View all')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Timer className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">
                  {tr('Sin proyectos todavía', 'No projects yet')}
                </p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  {tr(
                    'Agrupa tareas relacionadas creando tu primer proyecto.',
                    'Group related tasks by creating your first project.',
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.slice(0, 4).map((proj) => {
                  const { done, total, pct } = computeProjectProgress(proj, tasks);
                  return (
                    <button
                      type="button"
                      key={proj.id}
                      onClick={() => onOpenProject(proj.id)}
                      className="block w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/50 p-3 text-left transition-colors hover:border-[var(--accent)]/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 truncate text-sm font-semibold text-[var(--text)]">
                          <span className={`h-2 w-2 rounded-full ${proj.color}`} />
                          <span className="truncate">{proj.name}</span>
                        </span>
                        <span className="font-mono-num text-xs font-bold text-[var(--text)]">{pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="m-0 mt-1.5 text-[11px] text-[var(--muted)]">
                        {tr(`${done} de ${total} tareas completadas`, `${done} of ${total} tasks completed`)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
