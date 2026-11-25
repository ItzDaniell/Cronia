import type { Task } from '../../types';
import { Icon } from '../ui/Icon';

interface TaskRowsProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask?: (id: number) => void;
  compact?: boolean;
}

export function TaskRows({ tasks, onToggleTask, onDeleteTask, compact = false }: TaskRowsProps) {
  const shown = compact ? tasks.slice(0, 4) : tasks;

  return (
    <div className="task-rows">
      {shown.map((task) => (
        <div className={`task-row ${task.done ? 'done' : ''}`} key={task.id}>
          <button
            type="button"
            className={`task-check ${task.done ? 'checked' : ''}`}
            onClick={() => onToggleTask(task.id)}
            aria-label={`Marcar ${task.title}`}
          >
            {task.done && <Icon name="check" size={13} />}
          </button>
          <i className={task.color} />
          <div className="task-name">
            <strong>{task.title}</strong>
            <span>{task.project}</span>
          </div>
          <span className={`priority p-${task.priority.toLowerCase()}`}>{task.priority}</span>
          <time>
            <Icon name="clock" size={13} />
            {task.due}
          </time>
          {onDeleteTask && (
            <button
              type="button"
              className="ghost"
              onClick={() => onDeleteTask(task.id)}
              aria-label={`Eliminar ${task.title}`}
            >
              <Icon name="trash" size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
