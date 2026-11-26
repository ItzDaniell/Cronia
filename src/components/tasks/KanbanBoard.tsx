import { useState } from 'react';
import { Clock, ListChecks, Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import {
  formatDueDateLabel,
  formatEstimatedMinutes,
  getSubtaskProgress,
  TASK_STATUSES,
} from '@/modules/tasks/domain/rules';
import { useI18n } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export function KanbanBoard({ tasks, onAdd, onChangeStatus, onEditTask }: KanbanBoardProps) {
  const { tr, statusLabel, priorityLabel } = useI18n();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 bg-[var(--surface-2)]/40 p-4 md:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column);
        return (
          <section
            key={column}
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
            className={`flex min-h-[260px] flex-col rounded-xl border bg-[var(--surface)]/70 p-3 transition-all ${
              overColumn === column
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)]'
                : 'border-[var(--line)]'
            }`}
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className="text-[13px] font-bold text-[var(--text)]">{statusLabel(column)}</span>
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                {columnTasks.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7"
                onClick={() => onAdd(column)}
                aria-label={tr(`Añadir en ${statusLabel(column)}`, `Add to ${statusLabel(column)}`)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </header>

            <div className="flex flex-1 flex-col gap-2.5">
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
                    className="cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-xs transition-all hover:border-[var(--accent)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${task.color}`} />
                      <span className="flex-1 truncate text-xs font-medium text-[var(--muted)]">
                        {task.category}
                      </span>
                      <span className={`priority p-${task.priority.toLowerCase()} text-[11px]`}>
                        {priorityLabel(task.priority)}
                      </span>
                    </div>
                    <h4 className="mb-1 mt-2.5 text-sm font-bold text-[var(--text)]">{task.title}</h4>
                    <p className="m-0 line-clamp-2 text-xs text-[var(--muted)]">
                      {task.description || tr('Sin descripción', 'No description')}
                    </p>
                    {task.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <Badge variant="secondary" key={tag} className="py-0 text-[10.5px]">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <footer className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[11px] text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3.5 w-3.5" />
                        {subtasks.label}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatEstimatedMinutes(task.estimatedMinutes)}
                      </span>
                      <span>{formatDueDateLabel(task.dueDate)}</span>
                    </footer>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
