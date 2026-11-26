import { ArrowUpRight, Calendar, Pause, Play, Plus, Timer } from 'lucide-react';
import type { CalendarEvent, ModuleName, Project, Task, WeekDayStat } from '@/types';
import { isTaskCompleted, isTaskDueToday, isTaskOverdue, toLocalDateKey } from '@/modules/tasks/domain/rules';
import { computeProjectProgress } from '@/utils/analytics';
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
  onToggleTimer,
  onOpenNewTask,
}: DashboardPageProps) {
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat('es-ES', {
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
              Hola, {userName}
            </h2>
            <p className="m-0 mt-1 text-sm text-[var(--muted)]">
              {pending > 0
                ? `Tienes ${pending} tareas activas (${dueTodayCount} para hoy).`
                : 'Tu espacio está despejado. Planifica tu próxima sesión.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-right">
              <span className="font-mono-num block text-xl font-bold leading-none text-[var(--text)]">
                {timeLabel}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Hora local
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
              {timerRunning ? 'Ver enfoque' : 'Enfoque 25m'}
            </Button>

            <Button type="button" onClick={onOpenNewTask}>
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="list" tone="green" label="Activas" value={pending} note={`${dueTodayCount} para hoy`} />
        <MetricCard icon="check" tone="blue" label="Completadas" value={completed} note={`De ${tasks.length} totales`} />
        <MetricCard
          icon="flag"
          tone="orange"
          label="Vencidas"
          value={overdue}
          note={overdue > 0 ? 'Requiere atención' : 'Todo al día'}
        />
        <MetricCard icon="target" tone="violet" label="Progreso" value={`${progress}%`} note="Meta diaria: 100%" />
      </div>

      {/* Bento Row 1 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Prioridades de hoy</CardTitle>
              <CardDescription>{pending} actividades pendientes</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Tareas')}>
              Abrir Tareas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <TaskRows tasks={tasks} onToggleTask={onToggleTask} compact />
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Agenda</CardTitle>
              <CardDescription className="capitalize">{dateLabel}</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Calendario')}>
              Calendario
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Calendar className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Sin eventos hoy</p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  Programa bloques de tiempo desde el Calendario.
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
              <CardTitle>Ritmo semanal</CardTitle>
              <CardDescription>Actividad completada por día</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Estadísticas')}>
              Analíticas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <WeeklyBars days={weekDays} />
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Proyectos activos</CardTitle>
              <CardDescription>{activeProjects.length} en curso</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onNavigate('Proyectos')}>
              Ver todos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Timer className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Sin proyectos todavía</p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  Agrupa tareas relacionadas creando tu primer proyecto.
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
                      onClick={() => onNavigate('Proyectos')}
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
                        {done} de {total} tareas completadas
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
