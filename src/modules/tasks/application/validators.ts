import { isIsoDateString, TASK_PRIORITIES, TASK_STATUSES } from '../domain/rules.ts';
import type { CreateTaskDto, UpdateTaskDto, ValidationResult } from './dtos';

export function validateCreateTaskDto(dto: CreateTaskDto): ValidationResult {
  const errors: Record<string, string> = {};

  const title = dto.title?.trim() ?? '';
  if (!title) {
    errors.title = 'El título es obligatorio.';
  } else if (title.length > 140) {
    errors.title = 'El título no puede superar los 140 caracteres.';
  }

  if (dto.description && dto.description.length > 2000) {
    errors.description = 'La descripción no puede superar los 2000 caracteres.';
  }

  if (dto.status && !TASK_STATUSES.includes(dto.status)) {
    errors.status = 'Estado de tarea no válido.';
  }

  if (dto.priority && !TASK_PRIORITIES.includes(dto.priority)) {
    errors.priority = 'Prioridad de tarea no válida.';
  }

  if (dto.startDate && !isIsoDateString(dto.startDate)) {
    errors.startDate = 'La fecha de inicio debe tener formato YYYY-MM-DD.';
  }

  if (dto.dueDate && !isIsoDateString(dto.dueDate)) {
    errors.dueDate = 'La fecha de vencimiento debe tener formato YYYY-MM-DD.';
  }

  if (dto.startDate && dto.dueDate && isIsoDateString(dto.startDate) && isIsoDateString(dto.dueDate)) {
    if (dto.dueDate < dto.startDate) {
      errors.dueDate = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.';
    }
  }

  if (dto.estimatedMinutes !== undefined) {
    if (!Number.isFinite(dto.estimatedMinutes) || dto.estimatedMinutes < 0 || dto.estimatedMinutes > 10080) {
      errors.estimatedMinutes = 'El tiempo estimado debe estar entre 0 y 10080 minutos.';
    }
  }

  if (dto.recurrence && dto.recurrence.frequency !== 'none') {
    if (!Number.isInteger(dto.recurrence.interval) || dto.recurrence.interval < 1 || dto.recurrence.interval > 365) {
      errors.recurrence = 'El intervalo de recurrencia debe ser un entero entre 1 y 365.';
    }
    if (dto.recurrence.endDate) {
      if (!isIsoDateString(dto.recurrence.endDate)) {
        errors.recurrence = 'La fecha de fin de recurrencia no es válida.';
      } else if (dto.dueDate && isIsoDateString(dto.dueDate) && dto.recurrence.endDate < dto.dueDate) {
        errors.recurrence = 'La fecha fin de recurrencia no puede ser anterior al vencimiento.';
      }
    }
  }

  if (dto.subtasks) {
    const hasEmptySubtask = dto.subtasks.some((s) => !s.title.trim());
    if (hasEmptySubtask) {
      errors.subtasks = 'Las subtareas no pueden tener título vacío.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUpdateTaskDto(dto: UpdateTaskDto): ValidationResult {
  const base = validateCreateTaskDto(dto);
  if (!Number.isInteger(dto.id) || dto.id <= 0) {
    base.errors.id = 'Identificador de tarea inválido.';
    base.valid = false;
  }
  return base;
}
