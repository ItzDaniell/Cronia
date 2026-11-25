import type { CalendarEvent, ModuleName, Project, Task, WeekDayStat } from '../types';
import { isTaskCompleted, isTaskDueToday, isTaskOverdue } from '../modules/tasks/domain/rules';
import { Icon } from '../components/ui/Icon';
import { MetricCard } from '../components/ui/MetricCard';
import { PanelHeading } from '../components/ui/PanelHeading';
import { WeeklyBars } from '../components/ui/WeeklyBars';
import { TaskRows } from '../components/tasks/TaskRows';

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
  const date = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  const time = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  const completed = tasks.filter((t) => isTaskCompleted(t)).length;
  const pending = tasks.filter((t) => t.status === 'Pending' || t.status === 'InProgress').length;
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
  const dueTodayCount = tasks.filter((t) => !isTaskCompleted(t) && isTaskDueToday(t)).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const activeProjects = projects.filter((p) => !p.archived);
  const todayEvents = events.slice(0, 3);

  return (
    <div className="dash-grid">
      <section className="greeting">
        <div>
          <span>BUENOS DÍAS</span>
          <h2>Hola, {userName}</h2>
          <p>Estas son tus prioridades para hoy.</p>
        </div>
        <div className="live-date">
          <Icon name="calendar" />
          <span>
            <strong>{date}</strong>
            {time} h
          </span>
        </div>
        <button type="button" className="primary" onClick={onOpenNewTask}>
          <Icon name="plus" />
          Crear tarea
        </button>
      </section>

      <section className="metric-row dashboard-metrics">
        <MetricCard icon="list" tone="violet" label="Pendientes" value={pending} note={`${dueTodayCount} para hoy`} />
        <MetricCard icon="check" tone="green" label="Completadas" value={completed} note={`De ${tasks.length} totales`} />
        <MetricCard icon="flag" tone="orange" label="Vencidas" value={overdue} note={overdue > 0 ? 'Requiere atención' : 'Todo al día'} />
        <MetricCard icon="target" tone="blue" label="Progreso diario" value={`${progress}%`} note="Meta: 100%" />
      </section>

      <section className="panel agenda">
        <PanelHeading
          title="Prioridades de hoy"
          subtitle={`${pending} tareas pendientes`}
          action="Ver tareas"
          onAction={() => onNavigate('Tareas')}
        />
        <TaskRows tasks={tasks} onToggleTask={onToggleTask} compact />
        <button type="button" className="inline-add" onClick={onOpenNewTask}>
          <Icon name="plus" size={16} />
          Añadir tarea rápida
        </button>
      </section>

      <section className="panel today">
        <PanelHeading
          title="Agenda de hoy"
          subtitle={date}
          action="Calendario"
          onAction={() => onNavigate('Calendario')}
        />
        <div className="timeline">
          {todayEvents.map((ev) => (
            <div key={ev.id}>
              <time>{ev.time}</time>
              <i className={ev.color} />
              <article>
                <small>{ev.type.toUpperCase()}</small>
                <strong>{ev.title}</strong>
                <span>Día {ev.day}</span>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="panel week-card">
        <PanelHeading
          title="Rendimiento semanal"
          subtitle="Productividad diaria"
          action="Detalles"
          onAction={() => onNavigate('Estadísticas')}
        />
        <WeeklyBars days={weekDays} />
      </section>

      <section className="project-summary panel">
        <PanelHeading
          title="Proyectos activos"
          subtitle={`${activeProjects.length} proyectos en curso`}
          action="Ver proyectos"
          onAction={() => onNavigate('Proyectos')}
        />
        <div className="project-chips">
          {activeProjects.slice(0, 2).map((proj) => {
            const pct = proj.total > 0 ? Math.round((proj.done / proj.total) * 100) : 0;
            return (
              <button type="button" key={proj.id} onClick={() => onNavigate('Proyectos')}>
                <i className={proj.color} />
                <span>
                  <strong>{proj.name}</strong>
                  {proj.done}/{proj.total} tareas
                </span>
                <b>{pct}%</b>
              </button>
            );
          })}
        </div>
      </section>

      <section className="focus-banner">
        <div className="focus-icon">
          <Icon name="timer" size={24} />
        </div>
        <div>
          <span>MODO ENFOQUE</span>
          <h2>¿Listo para concentrarte?</h2>
          <p>Inicia una sesión Pomodoro de 25 minutos.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onToggleTimer();
            onNavigate('Enfoque');
          }}
        >
          <Icon name={timerRunning ? 'pause' : 'play'} size={16} />
          {timerRunning ? 'Ver sesión' : 'Comenzar'}
        </button>
      </section>
    </div>
  );
}
