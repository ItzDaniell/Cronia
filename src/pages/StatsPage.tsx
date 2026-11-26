import { useMemo, useState } from 'react';
import type { FocusSession, Project, Task, WeekDayStat } from '../types';
import { computePeriodMetrics, computeProjectProgress } from '../utils/analytics';
import { Icon } from '../components/ui/Icon';
import { MetricCard } from '../components/ui/MetricCard';
import { PanelHeading } from '../components/ui/PanelHeading';
import { WeeklyBars } from '../components/ui/WeeklyBars';

interface StatsPageProps {
  tasks: Task[];
  projects: Project[];
  sessions: FocusSession[];
  weekDays: WeekDayStat[];
}

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
  const totalProjectTasks = activeProjects.reduce((acc, p) => acc + p.total, 0) || 1;

  return (
    <div className="stats-wrap">
      <div className="stats-intro">
        <div>
          <strong>Cómo leer este informe</strong>
          <span>
            Los datos se calculan en tiempo real a partir de tus tareas, proyectos y sesiones de enfoque guardadas en SQLite.
          </span>
        </div>
        <label>
          Período
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
            <option value="7 días">7 días</option>
            <option value="30 días">30 días</option>
            <option value="90 días">90 días</option>
          </select>
        </label>
      </div>

      <div className="stats-layout">
        <section className="metric-row">
          <MetricCard
            icon="timer"
            tone="violet"
            label="Tiempo registrado"
            value={`${metrics.focusHours}h ${metrics.focusMins}m`}
            note={`Período: ${period}`}
          />
          <MetricCard
            icon="check"
            tone="green"
            label="Tareas finalizadas"
            value={metrics.completedTasks}
            note={`De ${metrics.totalTasks} registradas`}
          />
          <MetricCard
            icon="target"
            tone="blue"
            label="Tasa de finalización"
            value={`${metrics.completionRate}%`}
            note="Completadas frente a planificadas"
          />
          <MetricCard
            icon="bolt"
            tone="orange"
            label="Sesiones totales"
            value={metrics.sessionsCount}
            note="Ciclos de enfoque completados"
          />
        </section>

        <section className="panel stats-chart">
          <PanelHeading
            title="Evolución de productividad"
            subtitle="Porcentaje de tareas planificadas completadas cada día de la semana"
          />
          <WeeklyBars days={weekDays} large />
        </section>

        <section className="panel distribution">
          <PanelHeading title="Distribución por proyecto" subtitle="Carga de trabajo real vinculada" />
          <div className="distribution-body">
            <div className="big-donut">
              <span>
                {metrics.focusHours}h<small>enfoque</small>
              </span>
            </div>
            <ul>
              {activeProjects.slice(0, 4).map(({ project, done, total }) => (
                <li key={project.id}>
                  <i className={project.color} />
                  <span>
                    {project.name}
                    <small>
                      {done}/{total} tareas
                    </small>
                  </span>
                  <b>{Math.round((total / totalProjectTasks) * 100)}%</b>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="panel priority-stats">
          <PanelHeading title="Carga por prioridad" subtitle="Cantidad de tareas activas por nivel" />
          <div>
            <span>
              <i className="red" style={{ width: `${(urgentCount / maxPriority) * 100}%` }} />
              Urgente <b>{urgentCount}</b>
            </span>
            <span>
              <i className="orange" style={{ width: `${(highCount / maxPriority) * 100}%` }} />
              Alta <b>{highCount}</b>
            </span>
            <span>
              <i className="blue" style={{ width: `${(medCount / maxPriority) * 100}%` }} />
              Media <b>{medCount}</b>
            </span>
            <span>
              <i className="green" style={{ width: `${(lowCount / maxPriority) * 100}%` }} />
              Baja <b>{lowCount}</b>
            </span>
          </div>
        </section>

        <section className="panel insight">
          <Icon name="bolt" />
          <div>
            <span>RECOMENDACIÓN BASADA EN TU HISTORIAL</span>
            <h2>Tu mejor momento es por la mañana</h2>
            <p>
              Reserva bloques de 25 o 50 minutos al inicio del día para tus tareas de prioridad Urgente o Alta.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
