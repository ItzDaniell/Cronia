import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ListChecks, Pencil, Repeat, RotateCcw, Trash2 } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import {
  formatDueDateLabel,
  formatEstimatedMinutes,
  getSubtaskProgress,
  isTaskCompleted,
  isTaskDeleted,
  isTaskOverdue,
  TASK_STATUSES,
} from '@/modules/tasks/domain/rules';
import { useI18n } from '@/i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const { tr, priorityLabel, statusLabel, recurrenceLabel } = useI18n();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const shown = compact ? tasks.slice(0, 5) : tasks;

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="m-0 text-sm font-semibold text-[var(--text)]">
          {tr('No hay tareas en esta vista', 'No tasks in this view')}
        </p>
        <p className="m-0 text-xs text-[var(--muted)]">
          {tr(
            'Ajusta los filtros o crea una nueva actividad para comenzar.',
            'Adjust your filters or create a new activity to get started.',
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--line)]">
      {shown.map((task, idx) => {
        const completed = isTaskCompleted(task);
        const deleted = isTaskDeleted(task);
        const overdue = isTaskOverdue(task);
        const subtaskProgress = getSubtaskProgress(task);
        const expanded = expandedId === task.id;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, delay: Math.min(idx * 0.02, 0.15) }}
          >
            <div
              className={`flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-2)]/50 sm:flex-nowrap sm:px-5 ${
                task.status === 'Cancelled' ? 'opacity-60' : ''
              }`}
            >
              {!deleted ? (
                <Checkbox
                  checked={completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  aria-label={`Marcar ${task.title}`}
                />
              ) : (
                <span className="grid h-5 w-5 place-items-center text-[var(--muted)]" title="En papelera">
                  <Trash2 className="h-4 w-4" />
                </span>
              )}

              <span className={`h-8 w-1 shrink-0 rounded-full ${task.color}`} />

              <div
                className={`min-w-0 flex-1 ${!compact ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!compact && task.subtasks.length > 0) {
                    setExpandedId(expanded ? null : task.id);
                  } else if (onEditTask && !deleted) {
                    onEditTask(task);
                  }
                }}
              >
                <p
                  className={`m-0 truncate text-[14px] font-semibold ${
                    completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'
                  }`}
                >
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span>{task.project}</span>
                  <span>· {task.category}</span>
                  {!compact && task.estimatedMinutes > 0 && (
                    <span>· {formatEstimatedMinutes(task.estimatedMinutes)}</span>
                  )}
                  {!compact && subtaskProgress.total > 0 && (
                    <Badge variant="secondary" className="gap-1 py-0 text-[11px]">
                      <ListChecks className="h-3 w-3" />
                      {subtaskProgress.label}
                    </Badge>
                  )}
                  {!compact && task.recurrence.frequency !== 'none' && (
                    <Badge variant="default" className="gap-1 py-0 text-[11px]">
                      <Repeat className="h-3 w-3" />
                      {recurrenceLabel(task.recurrence.frequency)}
                    </Badge>
                  )}
                  {!compact &&
                    task.tags.slice(0, 3).map((tag) => (
                      <Badge variant="secondary" key={tag} className="py-0 text-[11px]">
                        #{tag}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                {!compact && !deleted && onChangeStatus && (
                  <Select
                    value={task.status}
                    onValueChange={(v) => onChangeStatus(task.id, v as TaskStatus)}
                  >
                    <SelectTrigger
                      className="h-8 w-[134px] text-xs"
                      aria-label={tr(`Estado de ${task.title}`, `Status of ${task.title}`)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {statusLabel(st)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <span className={`priority p-${task.priority.toLowerCase()}`}>
                  {priorityLabel(task.priority)}
                </span>

                <span
                  className={`inline-flex min-w-[88px] items-center gap-1.5 text-xs ${
                    overdue ? 'font-bold text-rose-500' : 'text-[var(--muted)]'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {formatDueDateLabel(task.dueDate)}
                </span>

                {!compact && !deleted && (
                  <div className="flex items-center gap-1">
                    {onEditTask && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditTask(task)}
                        aria-label={tr(`Editar ${task.title}`, `Edit ${task.title}`)}
                        title={tr('Editar tarea', 'Edit task')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDeleteTask && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-rose-500"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label={tr(`Mover ${task.title} a la papelera`, `Move ${task.title} to trash`)}
                        title={tr('Mover a la papelera', 'Move to trash')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}

                {!compact && deleted && (
                  <div className="flex items-center gap-1.5">
                    {onRestoreTask && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRestoreTask(task.id)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {tr('Restaurar', 'Restore')}
                      </Button>
                    )}
                    {onPermanentDeleteTask && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPermanentDeleteTask(task.id)}
                        title={tr('Eliminar permanentemente', 'Delete permanently')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!compact && expanded && task.subtasks.length > 0 && (
              <div className="space-y-2 border-t border-[var(--line)] bg-[var(--surface-2)]/50 px-5 py-3 pl-14">
                {task.description && (
                  <p className="m-0 text-xs leading-relaxed text-[var(--muted)]">{task.description}</p>
                )}
                {task.subtasks.map((st) => (
                  <div className="flex items-center gap-2.5 text-[13px]" key={st.id}>
                    <Checkbox
                      checked={st.completed}
                      onCheckedChange={() => onToggleSubtask?.(task.id, st.id)}
                      disabled={deleted}
                    />
                    <span className={st.completed ? 'line-through text-[var(--muted)]' : ''}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
