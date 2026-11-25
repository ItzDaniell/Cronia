import type { AccentTone } from '../../../types';
import type { RecurrenceFrequency, RecurrenceRule, Task, TaskPriority, TaskStatus } from './types';

export const TASK_STATUSES: TaskStatus[] = ['Pending', 'InProgress', 'Completed', 'Cancelled'];

export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Urgent: 'Urgente',
};

export const PRIORITY_COLORS: Record<TaskPriority, AccentTone> = {
  Urgent: 'red',
  High: 'violet',
  Medium: 'blue',
  Low: 'green',
};

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  none: 'Sin recurrencia',
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export const DEFAULT_RECURRENCE: RecurrenceRule = {
  frequency: 'none',
  interval: 1,
  endDate: null,
};

export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

export function isTaskDeleted(task: Task): boolean {
  return task.deletedAt !== null;
}

export function isTaskCompleted(task: Task): boolean {
  return task.status === 'Completed';
}

export function isTaskOverdue(task: Task, todayKey: string = toLocalDateKey()): boolean {
  if (isTaskDeleted(task)) return false;
  if (task.status === 'Completed' || task.status === 'Cancelled') return false;
  if (!task.dueDate) return false;
  return task.dueDate < todayKey;
}

export function isTaskDueToday(task: Task, todayKey: string = toLocalDateKey()): boolean {
  if (isTaskDeleted(task)) return false;
  return task.dueDate === todayKey;
}

export function isTaskUpcoming(task: Task, todayKey: string = toLocalDateKey()): boolean {
  if (isTaskDeleted(task)) return false;
  if (task.status === 'Completed' || task.status === 'Cancelled') return false;
  if (!task.dueDate) return false;
  return task.dueDate > todayKey;
}

export function getSubtaskProgress(task: Task): { done: number; total: number; label: string } {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.completed).length;
  return { done, total, label: `${done}/${total}` };
}

export function formatEstimatedMinutes(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h}h ${m}m`;
}

export function formatDueDateLabel(dueDate: string | null, todayKey: string = toLocalDateKey()): string {
  if (!dueDate) return 'Sin fecha';
  if (dueDate === todayKey) return 'Hoy';

  const [ty, tm, td] = todayKey.split('-').map(Number);
  const tomorrow = new Date(ty, tm - 1, td + 1);
  if (dueDate === toLocalDateKey(tomorrow)) return 'Mañana';

  const yesterday = new Date(ty, tm - 1, td - 1);
  if (dueDate === toLocalDateKey(yesterday)) return 'Ayer';

  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return dueDate;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d));
}

export function addRecurrenceToDate(baseDate: string, rule: RecurrenceRule): string | null {
  if (rule.frequency === 'none') return null;
  if (!isIsoDateString(baseDate)) return null;

  const [y, m, d] = baseDate.split('-').map(Number);
  const interval = Math.max(1, Math.floor(rule.interval || 1));
  const next = new Date(y, m - 1, d);

  if (rule.frequency === 'daily') {
    next.setDate(next.getDate() + interval);
  } else if (rule.frequency === 'weekly') {
    next.setDate(next.getDate() + interval * 7);
  } else if (rule.frequency === 'monthly') {
    next.setMonth(next.getMonth() + interval);
  }

  const nextKey = toLocalDateKey(next);
  if (rule.endDate && nextKey > rule.endDate) return null;
  return nextKey;
}

export function createNextRecurringInstance(task: Task, nowIso: string, nextId: number): Task | null {
  if (task.recurrence.frequency === 'none') return null;
  const baseDue = task.dueDate ?? toLocalDateKey(new Date(nowIso));
  const nextDue = addRecurrenceToDate(baseDue, task.recurrence);
  if (!nextDue) return null;

  const nextStart = task.startDate
    ? addRecurrenceToDate(task.startDate, task.recurrence)
    : nextDue;

  return {
    ...task,
    id: nextId,
    status: 'Pending',
    startDate: nextStart,
    dueDate: nextDue,
    subtasks: task.subtasks.map((st, idx) => ({
      id: `${nextId}-${idx + 1}`,
      title: st.title,
      completed: false,
    })),
    createdAt: nowIso,
    updatedAt: nowIso,
    completedAt: null,
    deletedAt: null,
  };
}
