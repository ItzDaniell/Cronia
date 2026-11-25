import type { AccentTone } from '../../../types';

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number | null;
  project: string;
  startDate: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  estimatedMinutes: number;
  recurrence: RecurrenceRule;
  color: AccentTone;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

export type TaskView = 'Todas' | 'Hoy' | 'Próximas' | 'Vencidas' | 'Completadas' | 'Papelera';

export type TaskDisplayMode = 'Lista' | 'Kanban';

export type TaskSortField = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'estimatedMinutes';

export type SortDirection = 'asc' | 'desc';

export interface TaskFilterCriteria {
  view: TaskView;
  search: string;
  status: TaskStatus | 'All';
  priority: TaskPriority | 'All';
  category: string | 'All';
  tag: string | 'All';
  sortBy: TaskSortField;
  sortDirection: SortDirection;
}

export interface TaskSummary {
  totalActive: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  trashed: number;
  completionPct: number;
  byPriority: Record<TaskPriority, number>;
}
