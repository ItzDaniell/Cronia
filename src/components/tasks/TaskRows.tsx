import { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import {
  formatDueDateLabel,
  formatEstimatedMinutes,
  getSubtaskProgress,
  isTaskCompleted,
  isTaskDeleted,
  isTaskOverdue,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
} from '../../modules/tasks/domain/rules';
import { Icon } from '../ui/Icon';

interface TaskRowsProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onChangeStatus?: (id: number, status: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: number) => void;
  onRestoreTask?: (id: number) => void;
  onPermanentDeleteTask?: (id: number) => void;
  onToggleSubtask?: (taskId: number, subtaskId: string) => void;
  compact?: boolean;
}

export function TaskRows({
  tasks,
  onToggleTask,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
  onRestoreTask,
  onPermanentDeleteTask,
  onToggleSubtask,
  compact = false,
}: TaskRowsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const shown = compact ? tasks.slice(0, 4) : tasks;

  if (shown.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="check" size={22} />
        <strong>No hay tareas en esta vista</strong>
        <span>Prueba cambiando los filtros o crea una nueva actividad.</span>
      </div>
    );
  }

  return (
    <div className="task-rows">
      {shown.map((task) => {
        const completed = isTaskCompleted(task);
        const deleted = isTaskDeleted(task);
        const overdue = isTaskOverdue(task);
        const subtaskProgress = getSubtaskProgress(task);
        const expanded = expandedId === task.id;

        return (
          <div className="task-row-wrap" key={task.id}>
            <div className={`task-row ${completed ? 'done' : ''} ${task.status === 'Cancelled' ? 'cancelled' : ''}`}>
              {!deleted ? (
                <button
                  type="button"
                  className={`task-check ${completed ? 'checked' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Marcar ${task.title}`}
                >
                  {completed && <Icon name="check" size={13} />}
                </button>
              ) : (
                <span className="trash-dot" title="En papelera">
                  <Icon name="trash" size={12} />
                </span>
              )}

              <i className={task.color} />

              <div
                className="task-name"
                onClick={() => {
                  if (!compact && task.subtasks.length > 0) {
                    setExpandedId(expanded ? null : task.id);
                  } else if (onEditTask && !deleted) {
                    onEditTask(task);
                  }
                }}
                style={{ cursor: !compact ? 'pointer' : 'default' }}
              >
                <strong>{task.title}</strong>
                <div className="task-meta-line">
                  <span>{task.project}</span>
                  <span>· {task.category}</span>
                  {!compact && task.estimatedMinutes > 0 && (
                    <span>· {formatEstimatedMinutes(task.estimatedMinutes)}</span>
                  )}
                  {!compact && subtaskProgress.total > 0 && (
                    <span className="subtask-pill">
                      <Icon name="list" size={10} />
                      {subtaskProgress.label}
                    </span>
                  )}
                  {!compact && task.recurrence.frequency !== 'none' && (
                    <span className="recurrence-pill" title="Tarea recurrente">
                      <Icon name="repeat" size={10} />
                      {RECURRENCE_LABELS[task.recurrence.frequency]}
                    </span>
                  )}
                  {!compact &&
                    task.tags.slice(0, 3).map((tag) => (
                      <span className="mini-tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                </div>
              </div>

              {!compact && !deleted && onChangeStatus && (
                <select
                  className={`status-select s-${task.status.toLowerCase()}`}
                  value={task.status}
                  onChange={(e) => onChangeStatus(task.id, e.target.value as TaskStatus)}
                  aria-label={`Estado de ${task.title}`}
                >
                  {TASK_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              )}

              <span className={`priority p-${task.priority.toLowerCase()}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>

              <time className={overdue ? 'overdue-time' : ''}>
                <Icon name="clock" size={13} />
                {formatDueDateLabel(task.dueDate)}
              </time>

              {!compact && !deleted && (
                <div className="row-actions">
                  {onEditTask && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => onEditTask(task)}
                      aria-label={`Editar ${task.title}`}
                      title="Editar tarea"
                    >
                      <Icon name="more" size={15} />
                    </button>
                  )}
                  {onDeleteTask && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Mover ${task.title} a la papelera`}
                      title="Mover a la papelera"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  )}
                </div>
              )}

              {!compact && deleted && (
                <div className="row-actions">
                  {onRestoreTask && (
                    <button
                      type="button"
                      className="setting-action"
                      onClick={() => onRestoreTask(task.id)}
                    >
                      Restaurar
                    </button>
                  )}
                  {onPermanentDeleteTask && (
                    <button
                      type="button"
                      className="delete-action"
                      onClick={() => onPermanentDeleteTask(task.id)}
                      title="Eliminar permanentemente"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {!compact && expanded && task.subtasks.length > 0 && (
              <div className="task-subtasks-drawer">
                {task.description && <p className="drawer-desc">{task.description}</p>}
                {task.subtasks.map((st) => (
                  <label className="drawer-subtask" key={st.id}>
                    <button
                      type="button"
                      className={`task-check ${st.completed ? 'checked' : ''}`}
                      onClick={() => onToggleSubtask?.(task.id, st.id)}
                      disabled={deleted}
                    >
                      {st.completed && <Icon name="check" size={11} />}
                    </button>
                    <span className={st.completed ? 'done' : ''}>{st.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
