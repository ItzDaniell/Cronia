import { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import {
  formatDueDateLabel,
  formatEstimatedMinutes,
  getSubtaskProgress,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
} from '../../modules/tasks/domain/rules';
import { Icon } from '../ui/Icon';

interface KanbanBoardProps {
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export function KanbanBoard({ tasks, onAdd, onChangeStatus, onEditTask }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  return (
    <div className="kanban kanban-four">
      {TASK_STATUSES.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column);
        return (
          <section
            key={column}
            className={overColumn === column ? 'kanban-drop-target' : ''}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(column);
            }}
            onDragLeave={() => setOverColumn((prev) => (prev === column ? null : prev))}
            onDrop={(e) => {
              e.preventDefault();
              setOverColumn(null);
              const rawId = draggedId ?? Number(e.dataTransfer.getData('text/plain'));
              if (rawId) onChangeStatus(rawId, column);
              setDraggedId(null);
            }}
          >
            <header>
              <span>{STATUS_LABELS[column]}</span>
              <b>{columnTasks.length}</b>
              <button
                type="button"
                onClick={() => onAdd(column)}
                aria-label={`Añadir en ${STATUS_LABELS[column]}`}
              >
                <Icon name="plus" size={14} />
              </button>
            </header>
            {columnTasks.map((task) => {
              const subtasks = getSubtaskProgress(task);
              return (
                <article
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedId(task.id);
                    e.dataTransfer.setData('text/plain', String(task.id));
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setOverColumn(null);
                  }}
                  onClick={() => onEditTask(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <i className={task.color} />
                    <span>{task.category}</span>
                    <b className={`priority p-${task.priority.toLowerCase()}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </b>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.description || 'Sin descripción'}</p>
                  {task.tags.length > 0 && (
                    <div className="kanban-tags">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span className="mini-tag" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <footer>
                    <span>
                      <Icon name="list" size={12} />
                      {subtasks.label}
                    </span>
                    <span>
                      <Icon name="clock" size={12} />
                      {formatEstimatedMinutes(task.estimatedMinutes)}
                    </span>
                    <span>{formatDueDateLabel(task.dueDate)}</span>
                  </footer>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
