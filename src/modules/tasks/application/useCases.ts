import {
  createNextRecurringInstance,
  DEFAULT_RECURRENCE,
  isTaskCompleted,
  isTaskDeleted,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
  PRIORITY_COLORS,
  PRIORITY_WEIGHT,
  toLocalDateKey,
} from '../domain/rules.ts';
import type {
  Task,
  TaskFilterCriteria,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from '../domain/types';
import type { CreateTaskDto, UpdateTaskDto } from './dtos';

function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const clean = raw.trim().toLowerCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }
  return result;
}

export function createTaskEntity(dto: CreateTaskDto, id: number, nowIso: string): Task {
  const priority: TaskPriority = dto.priority ?? 'Medium';
  const status: TaskStatus = dto.status ?? 'Pending';

  return {
    id,
    title: dto.title.trim(),
    description: dto.description?.trim() ?? '',
    projectId: dto.projectId ?? null,
    project: dto.project?.trim() || 'Sin proyecto',
    startDate: dto.startDate || null,
    dueDate: dto.dueDate || null,
    priority,
    status,
    category: dto.category?.trim() || 'General',
    tags: normalizeTags(dto.tags),
    subtasks: (dto.subtasks ?? []).map((st) => ({
      id: st.id,
      title: st.title.trim(),
      completed: Boolean(st.completed),
    })),
    estimatedMinutes: Math.max(0, Math.round(dto.estimatedMinutes ?? 30)),
    recurrence: dto.recurrence
      ? {
          frequency: dto.recurrence.frequency,
          interval: Math.max(1, Math.floor(dto.recurrence.interval || 1)),
          endDate: dto.recurrence.endDate || null,
        }
      : { ...DEFAULT_RECURRENCE },
    color: dto.color ?? PRIORITY_COLORS[priority],
    createdAt: nowIso,
    updatedAt: nowIso,
    completedAt: status === 'Completed' ? nowIso : null,
    deletedAt: null,
  };
}

export function applyTaskUpdate(existing: Task, dto: UpdateTaskDto, nowIso: string): Task {
  const priority: TaskPriority = dto.priority ?? existing.priority;
  const status: TaskStatus = dto.status ?? existing.status;
  const completedAt =
    status === 'Completed' ? existing.completedAt ?? nowIso : null;

  return {
    ...existing,
    title: dto.title.trim(),
    description: dto.description !== undefined ? dto.description.trim() : existing.description,
    projectId: dto.projectId !== undefined ? dto.projectId : existing.projectId,
    project: dto.project !== undefined ? dto.project.trim() || 'Sin proyecto' : existing.project,
    startDate: dto.startDate !== undefined ? dto.startDate || null : existing.startDate,
    dueDate: dto.dueDate !== undefined ? dto.dueDate || null : existing.dueDate,
    priority,
    status,
    category: dto.category !== undefined ? dto.category.trim() || 'General' : existing.category,
    tags: dto.tags !== undefined ? normalizeTags(dto.tags) : existing.tags,
    subtasks:
      dto.subtasks !== undefined
        ? dto.subtasks.map((st) => ({
            id: st.id,
            title: st.title.trim(),
            completed: Boolean(st.completed),
          }))
        : existing.subtasks,
    estimatedMinutes:
      dto.estimatedMinutes !== undefined
        ? Math.max(0, Math.round(dto.estimatedMinutes))
        : existing.estimatedMinutes,
    recurrence:
      dto.recurrence !== undefined
        ? {
            frequency: dto.recurrence.frequency,
            interval: Math.max(1, Math.floor(dto.recurrence.interval || 1)),
            endDate: dto.recurrence.endDate || null,
          }
        : existing.recurrence,
    color: dto.color ?? PRIORITY_COLORS[priority],
    updatedAt: nowIso,
    completedAt,
  };
}

export function changeTaskStatus(
  existing: Task,
  nextStatus: TaskStatus,
  nowIso: string,
  nextRecurrenceId: number,
): { updated: Task; spawned: Task | null } {
  const wasCompleted = existing.status === 'Completed';
  const isNowCompleted = nextStatus === 'Completed';

  const spawned =
    !wasCompleted && isNowCompleted
      ? createNextRecurringInstance(existing, nowIso, nextRecurrenceId)
      : null;

  // Si se generó la siguiente ocurrencia recurrente, el registro completado pasa a ser histórico
  // (sin recurrencia) para evitar que desmarcar y volver a marcar genere clones duplicados.
  const updated: Task = {
    ...existing,
    status: nextStatus,
    recurrence: spawned ? { ...DEFAULT_RECURRENCE } : existing.recurrence,
    updatedAt: nowIso,
    completedAt: isNowCompleted ? nowIso : null,
  };

  return { updated, spawned };
}

export function toggleTaskCompletion(
  existing: Task,
  nowIso: string,
  nextRecurrenceId: number,
): { updated: Task; spawned: Task | null } {
  const nextStatus: TaskStatus = existing.status === 'Completed' ? 'Pending' : 'Completed';
  return changeTaskStatus(existing, nextStatus, nowIso, nextRecurrenceId);
}

export function toggleSubtaskCompletion(existing: Task, subtaskId: string, nowIso: string): Task {
  return {
    ...existing,
    subtasks: existing.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st,
    ),
    updatedAt: nowIso,
  };
}

export function markTaskSoftDeleted(existing: Task, nowIso: string): Task {
  return {
    ...existing,
    deletedAt: nowIso,
    updatedAt: nowIso,
  };
}

export function markTaskRestored(existing: Task, nowIso: string): Task {
  return {
    ...existing,
    deletedAt: null,
    updatedAt: nowIso,
  };
}

export function filterAndSortTasks(
  tasks: Task[],
  criteria: TaskFilterCriteria,
  todayKey: string = toLocalDateKey(),
): Task[] {
  const q = criteria.search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    // 1. View filter
    if (criteria.view === 'Papelera') {
      if (!isTaskDeleted(task)) return false;
    } else {
      if (isTaskDeleted(task)) return false;
      if (criteria.view === 'Hoy' && !isTaskDueToday(task, todayKey)) return false;
      if (criteria.view === 'Próximas' && !isTaskUpcoming(task, todayKey)) return false;
      if (criteria.view === 'Vencidas' && !isTaskOverdue(task, todayKey)) return false;
      if (criteria.view === 'Completadas' && !isTaskCompleted(task)) return false;
    }

    // 2. Attribute filters
    if (criteria.status !== 'All' && task.status !== criteria.status) return false;
    if (criteria.priority !== 'All' && task.priority !== criteria.priority) return false;
    if (criteria.category !== 'All' && task.category !== criteria.category) return false;
    if (criteria.tag !== 'All' && !task.tags.includes(criteria.tag)) return false;

    // 3. Search filter
    if (q) {
      const haystack = [
        task.title,
        task.description,
        task.project,
        task.category,
        ...task.tags,
        ...task.subtasks.map((s) => s.title),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const dir = criteria.sortDirection === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (criteria.sortBy) {
      case 'priority':
        cmp = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        break;
      case 'dueDate': {
        const da = a.dueDate ?? '9999-12-31';
        const db = b.dueDate ?? '9999-12-31';
        cmp = da.localeCompare(db);
        break;
      }
      case 'title':
        cmp = a.title.localeCompare(b.title, 'es');
        break;
      case 'estimatedMinutes':
        cmp = a.estimatedMinutes - b.estimatedMinutes;
        break;
      case 'createdAt':
      default:
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
    }
    return cmp !== 0 ? cmp * dir : (a.id - b.id) * dir;
  });
}

export function computeTaskSummary(tasks: Task[], todayKey: string = toLocalDateKey()): TaskSummary {
  const active = tasks.filter((t) => !isTaskDeleted(t));
  const trashed = tasks.length - active.length;
  const pending = active.filter((t) => t.status === 'Pending').length;
  const inProgress = active.filter((t) => t.status === 'InProgress').length;
  const completed = active.filter((t) => t.status === 'Completed').length;
  const cancelled = active.filter((t) => t.status === 'Cancelled').length;
  const overdue = active.filter((t) => isTaskOverdue(t, todayKey)).length;
  const dueToday = active.filter((t) => isTaskDueToday(t, todayKey)).length;

  return {
    totalActive: active.length,
    pending,
    inProgress,
    completed,
    cancelled,
    overdue,
    dueToday,
    trashed,
    completionPct: active.length > 0 ? Math.round((completed / active.length) * 100) : 0,
    byPriority: {
      Urgent: active.filter((t) => t.priority === 'Urgent').length,
      High: active.filter((t) => t.priority === 'High').length,
      Medium: active.filter((t) => t.priority === 'Medium').length,
      Low: active.filter((t) => t.priority === 'Low').length,
    },
  };
}
