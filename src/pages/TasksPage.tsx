import type { Task, TaskPriority, TaskSortField, TaskStatus, TaskView } from '../types';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../modules/tasks/domain/rules';
import { useTasksViewModel } from '../modules/tasks/presentation/useTasksViewModel';
import { Icon } from '../components/ui/Icon';
import { PanelHeading } from '../components/ui/PanelHeading';
import { TaskRows } from '../components/tasks/TaskRows';
import { KanbanBoard } from '../components/tasks/KanbanBoard';

interface TasksPageProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onRestoreTask: (id: number) => void;
  onPermanentDeleteTask: (id: number) => void;
  onToggleSubtask: (taskId: number, subtaskId: string) => void;
  onOpenNewTask: (initialStatus?: TaskStatus) => void;
}

const VIEW_TABS: TaskView[] = ['Todas', 'Hoy', 'Próximas', 'Vencidas', 'Completadas', 'Papelera'];

export function TasksPage({
  tasks,
  onToggleTask,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
  onRestoreTask,
  onPermanentDeleteTask,
  onToggleSubtask,
  onOpenNewTask,
}: TasksPageProps) {
  const vm = useTasksViewModel(tasks);
  const { summary } = vm;

  const pct = (count: number) =>
    summary.totalActive > 0 ? `${Math.round((count / summary.totalActive) * 100)}%` : '0%';

  const tabCount = (tab: TaskView): number | null => {
    if (tab === 'Todas') return summary.totalActive;
    if (tab === 'Hoy') return summary.dueToday;
    if (tab === 'Vencidas') return summary.overdue;
    if (tab === 'Completadas') return summary.completed;
    if (tab === 'Papelera') return summary.trashed;
    return null;
  };

  return (
    <div className="module-layout">
      <section className="panel module-main">
        <div className="toolbar task-toolbar">
          <div className="tabs">
            {VIEW_TABS.map((tab) => {
              const count = tabCount(tab);
              return (
                <button
                  type="button"
                  className={vm.view === tab ? 'active' : ''}
                  onClick={() => vm.setView(tab)}
                  key={tab}
                >
                  {tab}
                  {count !== null && <span>{count}</span>}
                </button>
              );
            })}
          </div>
          <div className="view-buttons">
            <button
              type="button"
              className={vm.displayMode === 'Lista' ? 'active' : ''}
              onClick={() => vm.setDisplayMode('Lista')}
            >
              <Icon name="list" />
              Lista
            </button>
            <button
              type="button"
              className={vm.displayMode === 'Kanban' ? 'active' : ''}
              onClick={() => vm.setDisplayMode('Kanban')}
              disabled={vm.view === 'Papelera'}
            >
              <Icon name="grid" />
              Kanban
            </button>
          </div>
        </div>

        <div className="task-filters-bar">
          <div className="inline-search">
            <Icon name="search" size={14} />
            <input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Buscar tareas, etiquetas o subtareas..."
            />
          </div>

          <select
            value={vm.priorityFilter}
            onChange={(e) => vm.setPriorityFilter(e.target.value as TaskPriority | 'All')}
            aria-label="Filtrar por prioridad"
          >
            <option value="All">Prioridad: Todas</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          <select
            value={vm.statusFilter}
            onChange={(e) => vm.setStatusFilter(e.target.value as TaskStatus | 'All')}
            aria-label="Filtrar por estado"
          >
            <option value="All">Estado: Todos</option>
            {TASK_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>

          <select
            value={vm.categoryFilter}
            onChange={(e) => vm.setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="All">Categoría: Todas</option>
            {vm.availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {vm.availableTags.length > 0 && (
            <select
              value={vm.tagFilter}
              onChange={(e) => vm.setTagFilter(e.target.value)}
              aria-label="Filtrar por etiqueta"
            >
              <option value="All">Etiqueta: Todas</option>
              {vm.availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          <select
            value={vm.sortBy}
            onChange={(e) => vm.setSortBy(e.target.value as TaskSortField)}
            aria-label="Ordenar por"
          >
            <option value="dueDate">Orden: Vencimiento</option>
            <option value="priority">Orden: Prioridad</option>
            <option value="title">Orden: Título</option>
            <option value="estimatedMinutes">Orden: Tiempo</option>
            <option value="createdAt">Orden: Creación</option>
          </select>

          <button
            type="button"
            className="setting-action"
            onClick={vm.toggleSortDirection}
            title="Cambiar dirección de orden"
          >
            {vm.sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>

          {vm.hasActiveFilters && (
            <button type="button" className="setting-action" onClick={vm.resetFilters}>
              Limpiar
            </button>
          )}
        </div>

        {vm.displayMode === 'Lista' || vm.view === 'Papelera' ? (
          <>
            <div className="list-label task-list-label">
              <span>TAREAS ({vm.filteredTasks.length})</span>
              <span>ESTADO</span>
              <span>PRIORIDAD</span>
              <span>FECHA</span>
            </div>
            <TaskRows
              tasks={vm.filteredTasks}
              onToggleTask={onToggleTask}
              onChangeStatus={onChangeStatus}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onRestoreTask={onRestoreTask}
              onPermanentDeleteTask={onPermanentDeleteTask}
              onToggleSubtask={onToggleSubtask}
            />
          </>
        ) : (
          <KanbanBoard
            tasks={vm.filteredTasks}
            onAdd={(status) => onOpenNewTask(status)}
            onChangeStatus={onChangeStatus}
            onEditTask={onEditTask}
          />
        )}

        {vm.view !== 'Papelera' && (
          <button type="button" className="inline-add large" onClick={() => onOpenNewTask('Pending')}>
            <Icon name="plus" />
            Añadir una tarea
          </button>
        )}
      </section>

      <aside className="module-side">
        <section className="panel mini-panel">
          <PanelHeading title="Resumen" />
          <div className="donut-wrap">
            <div className="donut">
              <span>
                {summary.completionPct}%<small>hecho</small>
              </span>
            </div>
            <ul>
              <li>
                <i className="violet" />
                Pendientes <b>{summary.pending}</b>
              </li>
              <li>
                <i className="blue" />
                En progreso <b>{summary.inProgress}</b>
              </li>
              <li>
                <i className="green" />
                Completadas <b>{summary.completed}</b>
              </li>
              <li>
                <i className="orange" />
                Vencidas <b>{summary.overdue}</b>
              </li>
            </ul>
          </div>
        </section>

        <section className="panel mini-panel">
          <PanelHeading title="Por prioridad" />
          <div className="progress-list">
            <label>
              Urgente <span>{summary.byPriority.Urgent}</span>
              <i>
                <em style={{ width: pct(summary.byPriority.Urgent) }} />
              </i>
            </label>
            <label>
              Alta <span>{summary.byPriority.High}</span>
              <i>
                <em style={{ width: pct(summary.byPriority.High) }} />
              </i>
            </label>
            <label>
              Media <span>{summary.byPriority.Medium}</span>
              <i>
                <em style={{ width: pct(summary.byPriority.Medium) }} />
              </i>
            </label>
            <label>
              Baja <span>{summary.byPriority.Low}</span>
              <i>
                <em style={{ width: pct(summary.byPriority.Low) }} />
              </i>
            </label>
          </div>
        </section>
      </aside>
    </div>
  );
}
