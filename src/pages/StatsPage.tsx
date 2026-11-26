import { useMemo, useState } from 'react';
import { Folder, Zap } from 'lucide-react';
import type { AccentTone, FocusSession, Project, Task, WeekDayStat } from '@/types';
import { computePeriodMetrics, computeProjectProgress } from '@/utils/analytics';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';
import { WeeklyBars } from '@/components/ui/WeeklyBars';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatsPageProps {
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  weekDays: WeekDayStat[];
}

const TONE_HEX: Record<AccentTone, string> = {
  violet: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#f43f5e',
};

export function StatsPage({ tasks, projects, sessions, weekDays }: StatsPageProps) {
  const { tr, priorityLabel } = useI18n();
  const [period, setPeriod] = useState<'7 días' | '30 días' | '90 días'>('7 días');
  const days: 7 | 30 | 90 = period === '30 días' ? 30 : period === '90 días' ? 90 : 7;
  const periodLabel = tr(`${days} días`, `${days} days`);

  const metrics = useMemo(() => computePeriodMetrics(tasks, sessions, days), [tasks, sessions, days]);

  const urgentCount = tasks.filter((t) => t.priority === 'Urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const medCount = tasks.filter((t) => t.priority === 'Medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'Low').length;
  const maxPriority = Math.max(1, urgentCount, highCount, medCount, lowCount);

  const activeProjects = projects
    .filter((p) => !p.archived)
    .map((p) => ({ project: p, ...computeProjectProgress(p, tasks) }));
  const totalProjectTasks = activeProjects.reduce((acc, p) => acc + p.total, 0);

  const priorityRows = [
    { label: priorityLabel('Urgent'), count: urgentCount, color: '#f43f5e' },
    { label: priorityLabel('High'), count: highCount, color: '#f59e0b' },
    { label: priorityLabel('Medium'), count: medCount, color: '#3b82f6' },
    { label: priorityLabel('Low'), count: lowCount, color: '#10b981' },
  ];

  return (
    <div className="space-y-5">
      {/* Period filter header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
        <div>
          <p className="m-0 text-sm font-semibold text-[var(--text)]">
            {tr('Panel analítico', 'Analytics overview')}
          </p>
          <p className="m-0 text-xs text-[var(--muted)]">
            {tr(
              `Datos calculados en vivo para los últimos ${periodLabel}.`,
              `Live metrics computed for the last ${periodLabel}.`,
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-[var(--muted)]">{tr('Período', 'Period')}</span>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7 días">{tr('7 días', '7 days')}</SelectItem>
              <SelectItem value="30 días">{tr('30 días', '30 days')}</SelectItem>
              <SelectItem value="90 días">{tr('90 días', '90 days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="timer"
          tone="green"
          label={tr('Tiempo enfocado', 'Focused time')}
          value={`${metrics.focusHours}h ${metrics.focusMins}m`}
          note={tr(`Últimos ${periodLabel}`, `Last ${periodLabel}`)}
        />
        <MetricCard
          icon="check"
          tone="blue"
          label={tr('Tareas finalizadas', 'Completed tasks')}
          value={metrics.completedTasks}
          note={tr(`De ${metrics.totalTasks} registradas`, `Out of ${metrics.totalTasks} total`)}
        />
        <MetricCard
          icon="target"
          tone="violet"
          label={tr('Tasa de finalización', 'Completion rate')}
          value={`${metrics.completionRate}%`}
          note={tr('Completadas vs planificadas', 'Completed vs planned')}
        />
        <MetricCard
          icon="bolt"
          tone="orange"
          label={tr('Sesiones totales', 'Total sessions')}
          value={metrics.sessionsCount}
          note={tr('Ciclos completados', 'Completed cycles')}
        />
      </div>

      {/* Charts Bento */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>{tr('Actividad semanal', 'Weekly activity')}</CardTitle>
              <CardDescription>
                {tr('Porcentaje de progreso y enfoque por día', 'Daily progress and focus rate')}
              </CardDescription>
            </div>
          </CardHeader>
          <WeeklyBars days={weekDays} large />
        </Card>

        {/* Clean Horizontal Project Breakdown */}
        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>{tr('Distribución por proyecto', 'Project breakdown')}</CardTitle>
              <CardDescription>
                {tr('Progreso real de tareas vinculadas', 'Real progress of linked tasks')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Folder className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">
                  {tr('Sin proyectos activos', 'No active projects')}
                </p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  {tr(
                    'Crea un proyecto y vincula tareas para ver su carga aquí.',
                    'Create a project and link tasks to see workload here.',
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.slice(0, 5).map(({ project, done, total, pct }) => {
                  const share = totalProjectTasks > 0 ? Math.round((total / totalProjectTasks) * 100) : 0;
                  return (
                    <div key={project.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-2 truncate font-semibold text-[var(--text)]">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: TONE_HEX[project.color] }}
                          />
                          <span className="truncate">{project.name}</span>
                        </span>
                        <span className="font-mono-num text-[var(--muted)]">
                          {done}/{total} · <strong className="text-[var(--text)]">{share}%</strong>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            background: TONE_HEX[project.color],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{tr('Carga por prioridad', 'Workload by priority')}</CardTitle>
            <CardDescription>
              {tr('Tareas activas agrupadas por nivel de urgencia', 'Active tasks grouped by urgency')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {priorityRows.map((row) => (
            <div key={row.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">{row.label}</span>
                <strong className="font-mono-num text-lg font-bold text-[var(--text)]">{row.count}</strong>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${row.count > 0 ? (row.count / maxPriority) * 100 : 0}%`,
                    background: row.color,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subtle Tip Card */}
      <Card className="flex items-center gap-4 px-5 py-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="m-0 text-sm font-semibold text-[var(--text)]">
            {tr(
              'Bloques cortos y constantes superan a las jornadas largas',
              'Short, consistent focus blocks beat marathon sessions',
            )}
          </p>
          <p className="m-0 text-xs text-[var(--muted)]">
            {tr(
              'Prioriza 2 bloques de enfoque de 25 minutos para tus tareas Urgentes o Altas al inicio del día.',
              'Prioritize 2 focus blocks of 25 minutes for your Urgent or High tasks at the start of the day.',
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
