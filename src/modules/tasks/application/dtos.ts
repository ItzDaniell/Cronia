import type { AccentTone } from '../../../types';
import type { RecurrenceRule, Subtask, TaskPriority, TaskStatus } from '../domain/types';

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId?: number | null;
  project?: string;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
  tags?: string[];
  subtasks?: Subtask[];
  estimatedMinutes?: number;
  recurrence?: RecurrenceRule;
  color?: AccentTone;
}

export interface UpdateTaskDto extends CreateTaskDto {
  id: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
