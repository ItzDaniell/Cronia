import { persistence } from '../../../services/persistence';
import type { Task, TaskStatus } from '../domain/types';
import type { CreateTaskDto, UpdateTaskDto } from './dtos';
import { validateCreateTaskDto, validateUpdateTaskDto } from './validators';
import {
  applyTaskUpdate,
  changeTaskStatus,
  createTaskEntity,
  markTaskRestored,
  markTaskSoftDeleted,
  toggleSubtaskCompletion,
  toggleTaskCompletion,
} from './useCases';

export class TaskValidationError extends Error {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super(Object.values(fieldErrors)[0] ?? 'Datos de tarea inválidos');
    this.name = 'TaskValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export const taskService = {
  async create(dto: CreateTaskDto): Promise<Task> {
    const validation = validateCreateTaskDto(dto);
    if (!validation.valid) throw new TaskValidationError(validation.errors);

    const nowIso = new Date().toISOString();
    const task = createTaskEntity(dto, Date.now(), nowIso);
    await persistence.upsertTask(task);
    return task;
  },

  async update(existing: Task, dto: UpdateTaskDto): Promise<Task> {
    const validation = validateUpdateTaskDto(dto);
    if (!validation.valid) throw new TaskValidationError(validation.errors);

    const updated = applyTaskUpdate(existing, dto, new Date().toISOString());
    await persistence.upsertTask(updated);
    return updated;
  },

  async changeStatus(
    existing: Task,
    status: TaskStatus,
  ): Promise<{ updated: Task; spawned: Task | null }> {
    const nowIso = new Date().toISOString();
    const result = changeTaskStatus(existing, status, nowIso, Date.now() + 1);
    await persistence.upsertTask(result.updated);
    if (result.spawned) {
      await persistence.upsertTask(result.spawned);
    }
    return result;
  },

  async toggleComplete(existing: Task): Promise<{ updated: Task; spawned: Task | null }> {
    const nowIso = new Date().toISOString();
    const result = toggleTaskCompletion(existing, nowIso, Date.now() + 1);
    await persistence.upsertTask(result.updated);
    if (result.spawned) {
      await persistence.upsertTask(result.spawned);
    }
    return result;
  },

  async toggleSubtask(existing: Task, subtaskId: string): Promise<Task> {
    const updated = toggleSubtaskCompletion(existing, subtaskId, new Date().toISOString());
    await persistence.upsertTask(updated);
    return updated;
  },

  async softDelete(existing: Task): Promise<Task> {
    const nowIso = new Date().toISOString();
    const trashed = markTaskSoftDeleted(existing, nowIso);
    await persistence.softDeleteTask(existing.id, nowIso);
    return trashed;
  },

  async restore(existing: Task): Promise<Task> {
    const nowIso = new Date().toISOString();
    const restored = markTaskRestored(existing, nowIso);
    await persistence.restoreTask(existing.id, nowIso);
    return restored;
  },

  async permanentDelete(id: number): Promise<void> {
    await persistence.deleteTask(id);
  },
};
