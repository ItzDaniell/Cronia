import { useMemo, useState } from 'react';
import { Folder, Zap } from 'lucide-react';
import type { AccentTone, FocusSession, Project, Task, WeekDayStat } from '@/types';
import { computePeriodMetrics, computeProjectProgress } from '@/utils/analytics';
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
  const [period, setPeriod] = useState<'7 días' | '30 días' | '90 días'>('7 días');
  const days: 7 | 30 | 90 = period === '30 días' ? 30 : period === '90 días' ? 90 : 7;

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
    { label: 'Urgente', count: urgentCount, color: '#f43f5e' },
    { label: 'Alta', count: highCount, color: '#f59e0b' },
    { label: 'Media', count: medCount, color: '#3b82f6' },
    { label: 'Baja', count: lowCount, color: '#10b981' },
  ];

  return (
    <div className="space-y-5">
      {/* Period filter header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
        <div>
          <p className="m-0 text-sm font-semibold text-[var(--text)]">Panel analítico</p>
          <p className="m-0 text-xs text-[var(--muted)]">
            Datos calculados en vivo desde SQLite para los últimos {period}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-[var(--muted)]">Período</span>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7 días">7 días</SelectItem>
              <SelectItem value="30 días">30 días</SelectItem>
              <SelectItem value="90 días">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="timer"
          tone="green"
          label="Tiempo enfocado"
          value={`${metrics.focusHours}h ${metrics.focusMins}m`}
          note={`Últimos ${period}`}
        />
        <MetricCard
          icon="check"
          tone="blue"
          label="Tareas finalizadas"
          value={metrics.completedTasks}
          note={`De ${metrics.totalTasks} registradas`}
        />
        <MetricCard
          icon="target"
          tone="violet"
          label="Tasa de finalización"
          value={`${metrics.completionRate}%`}
          note="Completadas vs planificadas"
        />
        <MetricCard
          icon="bolt"
          tone="orange"
          label="Sesiones totales"
          value={metrics.sessionsCount}
          note="Ciclos completados"
        />
      </div>

      {/* Charts Bento */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>Actividad semanal</CardTitle>
              <CardDescription>Porcentaje de progreso y enfoque por día</CardDescription>
            </div>
          </CardHeader>
          <WeeklyBars days={weekDays} large />
        </Card>

        {/* Clean Horizontal Project Breakdown (replaces clunky donut) */}
        <Card className="xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Distribución por proyecto</CardTitle>
              <CardDescription>Progreso real de tareas vinculadas</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
                <Folder className="h-6 w-6 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Sin proyectos activos</p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  Crea un proyecto y vincula tareas para ver su carga aquí.
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
            <CardTitle>Carga por prioridad</CardTitle>
            <CardDescription>Tareas activas agrupadas por nivel de urgencia</CardDescription>
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
            Bloques cortos y constantes superan a las jornadas largas
          </p>
          <p className="m-0 text-xs text-[var(--muted)]">
            Prioriza 2 bloques de enfoque de 25 minutos para tus tareas Urgentes o Altas al inicio del día.
          </p>
        </div>
      </Card>
    </div>
  );
}
