import { useState } from 'react';
import type { Task } from '../types';
import { Icon } from '../components/ui/Icon';
import { PanelHeading } from '../components/ui/PanelHeading';
import { TaskRows } from '../components/tasks/TaskRows';
import { KanbanBoard } from '../components/tasks/KanbanBoard';

interface TasksPageProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onOpenNewTask: () => void;
}

const FILTER_TABS = ['Mis tareas', 'Hoy', 'Próximas', 'Completadas', 'Vencidas'] as const;

export function TasksPage({ tasks, onToggleTask, onDeleteTask, onOpenNewTask }: TasksPageProps) {
  const [filter, setFilter] = useState<(typeof FILTER_TABS)[number]>('Mis tareas');
  const [view, setView] = useState<'Lista' | 'Kanban'>('Lista');

  const filtered =
    filter === 'Completadas'
      ? tasks.filter((t) => t.done)
      : filter === 'Vencidas'
        ? tasks.filter((t) => !t.done && t.status === 'Vencida')
        : filter === 'Hoy'
          ? tasks.filter((t) => t.due.includes('Hoy'))
          : filter === 'Próximas'
            ? tasks.filter((t) => !t.done && !t.due.includes('Hoy') && t.status !== 'Vencida')
            : tasks;

  const completed = tasks.filter((t) => t.done).length;
  const overdue = tasks.filter((t) => !t.done && t.status === 'Vencida').length;
  const pending = tasks.length - completed;
  const donePct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const highCount = tasks.filter((t) => t.priority === 'Alta' || t.priority === 'Urgente').length;
  const medCount = tasks.filter((t) => t.priority === 'Media').length;
  const lowCount = tasks.filter((t) => t.priority === 'Baja').length;
  const pct = (count: number) => (tasks.length > 0 ? `${Math.round((count / tasks.length) * 100)}%` : '0%');

  return (
    <div className="module-layout">
      <section className="panel module-main">
        <div className="toolbar task-toolbar">
          <div className="tabs">
            {FILTER_TABS.map((tab) => (
              <button
                type="button"
                className={filter === tab ? 'active' : ''}
                onClick={() => setFilter(tab)}
                key={tab}
              >
                {tab}
                {tab === 'Mis tareas' && <span>{tasks.length}</span>}
              </button>
            ))}
          </div>
          <div className="view-buttons">
            <button type="button" className={view === 'Lista' ? 'active' : ''} onClick={() => setView('Lista')}>
              <Icon name="list" />
              Lista
            </button>
            <button type="button" className={view === 'Kanban' ? 'active' : ''} onClick={() => setView('Kanban')}>
              <Icon name="grid" />
              Kanban
            </button>
          </div>
        </div>

        {view === 'Lista' ? (
          <>
            <div className="list-label">
              <span>TAREAS</span>
              <span>PRIORIDAD</span>
              <span>FECHA</span>
            </div>
            <TaskRows tasks={filtered} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
          </>
        ) : (
          <KanbanBoard tasks={filtered} onAdd={onOpenNewTask} />
        )}

        <button type="button" className="inline-add large" onClick={onOpenNewTask}>
          <Icon name="plus" />
          Añadir una tarea
        </button>
      </section>

      <aside className="module-side">
        <section className="panel mini-panel">
          <PanelHeading title="Resumen" />
          <div className="donut-wrap">
            <div className="donut">
              <span>
                {donePct}%<small>hecho</small>
              </span>
            </div>
            <ul>
              <li>
                <i className="violet" />
                Pendientes <b>{pending}</b>
              </li>
              <li>
                <i className="green" />
                Completadas <b>{completed}</b>
              </li>
              <li>
                <i className="orange" />
                Vencidas <b>{overdue}</b>
              </li>
            </ul>
          </div>
        </section>

        <section className="panel mini-panel">
          <PanelHeading title="Por prioridad" />
          <div className="progress-list">
            <label>
              Alta / Urgente <span>{highCount}</span>
              <i>
                <em style={{ width: pct(highCount) }} />
              </i>
            </label>
            <label>
              Media <span>{medCount}</span>
              <i>
                <em style={{ width: pct(medCount) }} />
              </i>
            </label>
            <label>
              Baja <span>{lowCount}</span>
              <i>
                <em style={{ width: pct(lowCount) }} />
              </i>
            </label>
          </div>
        </section>
      </aside>
    </div>
  );
}
