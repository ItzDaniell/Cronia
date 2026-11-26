import { ArrowUpDown, LayoutGrid, List, Plus, Search } from 'lucide-react';
import type { Task, TaskPriority, TaskSortField, TaskStatus, TaskView } from '@/types';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/modules/tasks/domain/rules';
import { useTasksViewModel } from '@/modules/tasks/presentation/useTasksViewModel';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';
import { TaskRows } from '@/components/tasks/TaskRows';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TasksPageProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onRestoreTask: (id: number) => void;
  onPermanentDeleteTask: (id: number) => void;
  onToggleSubtask: (taskId: number, subtaskId: string) => void;
  onOpenNewTask: (initialStatus?: TaskStatus) => void;
}

const VIEW_TABS: TaskView[] = ['Todas', 'Hoy', 'Próximas', 'Vencidas', 'Completadas', 'Papelera'];

export function TasksPage({
  tasks,
  onToggleTask,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
  onRestoreTask,
  onPermanentDeleteTask,
  onToggleSubtask,
  onOpenNewTask,
}: TasksPageProps) {
  const { tr, priorityLabel, statusLabel, taskViewLabel } = useI18n();
  const vm = useTasksViewModel(tasks);
  const { summary } = vm;

  const tabCount = (tab: TaskView): number | null => {
    if (tab === 'Todas') return summary.totalActive;
    if (tab === 'Hoy') return summary.dueToday;
    if (tab === 'Vencidas') return summary.overdue;
    if (tab === 'Completadas') return summary.completed;
    if (tab === 'Papelera') return summary.trashed;
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Top KPI strip — frees 100% width for the task table & Kanban */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="list"
          tone="violet"
          label={tr('Pendientes', 'Pending')}
          value={summary.pending + summary.inProgress}
          note={tr(`${summary.inProgress} en progreso`, `${summary.inProgress} in progress`)}
        />
        <MetricCard
          icon="check"
          tone="green"
          label={tr('Completadas', 'Completed')}
          value={summary.completed}
          note={tr(`${summary.completionPct}% del total`, `${summary.completionPct}% of total`)}
        />
        <MetricCard
          icon="flag"
          tone="orange"
          label={tr('Vencidas', 'Overdue')}
          value={summary.overdue}
          note={
            summary.overdue > 0
              ? tr('Requieren atención', 'Need attention')
              : tr('Todo al día', 'All caught up')
          }
        />
        <MetricCard
          icon="target"
          tone="blue"
          label={tr('Para hoy', 'Due today')}
          value={summary.dueToday}
          note={tr(`${summary.byPriority.Urgent} urgentes`, `${summary.byPriority.Urgent} urgent`)}
        />
      </div>

      {/* Full-width workspace card */}
      <Card className="overflow-hidden">
        {/* View tabs + List/Kanban switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-1">
            {VIEW_TABS.map((tab) => {
              const count = tabCount(tab);
              const active = vm.view === tab;
              return (
                <button
                  type="button"
                  key={tab}
                  onClick={() => vm.setView(tab)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  }`}
                >
                  {taskViewLabel(tab)}
                  {count !== null && (
                    <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-[var(--surface-2)] p-1">
              <button
                type="button"
                onClick={() => vm.setDisplayMode('Lista')}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all ${
                  vm.displayMode === 'Lista'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                {tr('Lista', 'List')}
              </button>
              <button
                type="button"
                disabled={vm.view === 'Papelera'}
                onClick={() => vm.setDisplayMode('Kanban')}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all disabled:opacity-40 ${
                  vm.displayMode === 'Kanban'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </button>
            </div>

            {vm.view !== 'Papelera' && (
              <Button type="button" size="sm" onClick={() => onOpenNewTask('Pending')}>
                <Plus className="h-4 w-4" />
                {tr('Añadir', 'Add')}
              </Button>
            )}
          </div>
        </div>

        {/* Spacious filter bar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-[var(--line)] bg-[var(--surface-2)]/60 px-4 py-3 sm:px-5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder={tr(
                'Buscar tareas, etiquetas o subtareas...',
                'Search tasks, tags, or subtasks...',
              )}
              className="bg-[var(--surface)] pl-9"
            />
          </div>

          <Select
            value={vm.priorityFilter}
            onValueChange={(v) => vm.setPriorityFilter(v as TaskPriority | 'All')}
          >
            <SelectTrigger className="w-auto min-w-[155px] bg-[var(--surface)]">
              <SelectValue placeholder={tr('Prioridad', 'Priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{tr('Prioridad: Todas', 'Priority: All')}</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {priorityLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={vm.statusFilter}
            onValueChange={(v) => vm.setStatusFilter(v as TaskStatus | 'All')}
          >
            <SelectTrigger className="w-auto min-w-[148px] bg-[var(--surface)]">
              <SelectValue placeholder={tr('Estado', 'Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{tr('Estado: Todos', 'Status: All')}</SelectItem>
              {TASK_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>
                  {statusLabel(st)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={vm.categoryFilter} onValueChange={vm.setCategoryFilter}>
            <SelectTrigger className="w-auto min-w-[160px] bg-[var(--surface)]">
              <SelectValue placeholder={tr('Categoría', 'Category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{tr('Categoría: Todas', 'Category: All')}</SelectItem>
              {vm.availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {vm.availableTags.length > 0 && (
            <Select value={vm.tagFilter} onValueChange={vm.setTagFilter}>
              <SelectTrigger className="w-auto min-w-[150px] bg-[var(--surface)]">
                <SelectValue placeholder={tr('Etiqueta', 'Tag')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{tr('Etiqueta: Todas', 'Tag: All')}</SelectItem>
                {vm.availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={vm.sortBy} onValueChange={(v) => vm.setSortBy(v as TaskSortField)}>
            <SelectTrigger className="w-auto min-w-[172px] bg-[var(--surface)]">
              <SelectValue placeholder={tr('Ordenar por', 'Sort by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">{tr('Orden: Vencimiento', 'Sort: Due date')}</SelectItem>
              <SelectItem value="priority">{tr('Orden: Prioridad', 'Sort: Priority')}</SelectItem>
              <SelectItem value="title">{tr('Orden: Título', 'Sort: Title')}</SelectItem>
              <SelectItem value="estimatedMinutes">{tr('Orden: Tiempo', 'Sort: Time')}</SelectItem>
              <SelectItem value="createdAt">{tr('Orden: Creación', 'Sort: Created')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 bg-[var(--surface)]"
            onClick={vm.toggleSortDirection}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {vm.sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </Button>

          {vm.hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" className="h-9" onClick={vm.resetFilters}>
              {tr('Limpiar', 'Clear')}
            </Button>
          )}
        </div>

        {vm.displayMode === 'Lista' || vm.view === 'Papelera' ? (
          <TaskRows
            tasks={vm.filteredTasks}
            onToggleTask={onToggleTask}
            onChangeStatus={onChangeStatus}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onRestoreTask={onRestoreTask}
            onPermanentDeleteTask={onPermanentDeleteTask}
            onToggleSubtask={onToggleSubtask}
          />
        ) : (
          <KanbanBoard
            tasks={vm.filteredTasks}
            onAdd={(status) => onOpenNewTask(status)}
            onChangeStatus={onChangeStatus}
            onEditTask={onEditTask}
          />
        )}
      </Card>
    </div>
  );
}
