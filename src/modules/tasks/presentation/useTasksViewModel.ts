import { useMemo, useState } from 'react';
import { computeTaskSummary, filterAndSortTasks } from '../application/useCases';
import { isTaskDeleted } from '../domain/rules';
import type {
  SortDirection,
  Task,
  TaskDisplayMode,
  TaskFilterCriteria,
  TaskPriority,
  TaskSortField,
  TaskStatus,
  TaskView,
} from '../domain/types';

export function useTasksViewModel(tasks: Task[]) {
  const [view, setView] = useState<TaskView>('Todas');
  const [displayMode, setDisplayMode] = useState<TaskDisplayMode>('Lista');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string | 'All'>('All');
  const [tagFilter, setTagFilter] = useState<string | 'All'>('All');
  const [sortBy, setSortBy] = useState<TaskSortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const criteria: TaskFilterCriteria = useMemo(
    () => ({
      view,
      search,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      tag: tagFilter,
      sortBy,
      sortDirection,
    }),
    [view, search, statusFilter, priorityFilter, categoryFilter, tagFilter, sortBy, sortDirection],
  );

  const filteredTasks = useMemo(() => filterAndSortTasks(tasks, criteria), [tasks, criteria]);

  const summary = useMemo(() => computeTaskSummary(tasks), [tasks]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) {
      if (!isTaskDeleted(task) && task.category) set.add(task.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [tasks]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) {
      if (!isTaskDeleted(task)) {
        for (const tag of task.tags) set.add(tag);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [tasks]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    tagFilter !== 'All';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setTagFilter('All');
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    view,
    setView,
    displayMode,
    setDisplayMode,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    tagFilter,
    setTagFilter,
    sortBy,
    setSortBy,
    sortDirection,
    toggleSortDirection,
    filteredTasks,
    summary,
    availableCategories,
    availableTags,
    hasActiveFilters,
    resetFilters,
  };
}
