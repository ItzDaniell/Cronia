import type { Task, TaskStatus } from '../../types';
import { Icon } from '../ui/Icon';

interface KanbanBoardProps {
  tasks: Task[];
  onAdd: () => void;
}

const COLUMNS: TaskStatus[] = ['Pendiente', 'En progreso', 'Completada'];

export function KanbanBoard({ tasks, onAdd }: KanbanBoardProps) {
  return (
    <div className="kanban">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => (t.done ? 'Completada' : t.status) === column);
        return (
          <section key={column}>
            <header>
              <span>{column}</span>
              <b>{columnTasks.length}</b>
              <button type="button" onClick={onAdd} aria-label={`Añadir en ${column}`}>
                <Icon name="plus" size={14} />
              </button>
            </header>
            {columnTasks.map((task) => (
              <article key={task.id}>
                <div>
                  <i className={task.color} />
                  <span>{task.category}</span>
                  <b className={`priority p-${task.priority.toLowerCase()}`}>{task.priority}</b>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <footer>
                  <span>
                    <Icon name="list" size={12} />
                    {task.subtasks}
                  </span>
                  <span>
                    <Icon name="clock" size={12} />
                    {task.estimate}
                  </span>
                </footer>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
