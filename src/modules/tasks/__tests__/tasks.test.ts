import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyTaskUpdate,
  changeTaskStatus,
  computeTaskSummary,
  createTaskEntity,
  filterAndSortTasks,
  markTaskRestored,
  markTaskSoftDeleted,
  toggleSubtaskCompletion,
  toggleTaskCompletion,
} from '../application/useCases.ts';
import { validateCreateTaskDto, validateUpdateTaskDto } from '../application/validators.ts';
import {
  addRecurrenceToDate,
  formatEstimatedMinutes,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
} from '../domain/rules.ts';
import type { TaskFilterCriteria } from '../domain/types.ts';

const NOW = '2026-11-24T12:00:00.000Z';
const TODAY = '2026-11-24';

test('validateCreateTaskDto valida campos obligatorios y reglas de fechas', () => {
  const emptyTitle = validateCreateTaskDto({ title: '   ' });
  assert.equal(emptyTitle.valid, false);
  assert.ok(emptyTitle.errors.title);

  const badDates = validateCreateTaskDto({
    title: 'Tarea válida',
    startDate: '2026-11-26',
    dueDate: '2026-11-24',
  });
  assert.equal(badDates.valid, false);
  assert.ok(badDates.errors.dueDate);

  const badRecurrence = validateCreateTaskDto({
    title: 'Recurrente',
    dueDate: '2026-11-24',
    recurrence: { frequency: 'daily', interval: 0, endDate: null },
  });
  assert.equal(badRecurrence.valid, false);
  assert.ok(badRecurrence.errors.recurrence);

  const ok = validateCreateTaskDto({
    title: 'Implementar pruebas',
    startDate: '2026-11-24',
    dueDate: '2026-11-25',
    priority: 'Urgent',
    status: 'InProgress',
    estimatedMinutes: 60,
    tags: ['QA', 'tests'],
    subtasks: [{ id: '1', title: 'Escribir assertions', completed: false }],
    recurrence: { frequency: 'weekly', interval: 1, endDate: '2026-12-31' },
  });
  assert.equal(ok.valid, true);
  assert.deepEqual(ok.errors, {});
});

test('validateUpdateTaskDto rechaza IDs inválidos', () => {
  const res = validateUpdateTaskDto({ id: 0, title: 'Editar' });
  assert.equal(res.valid, false);
  assert.ok(res.errors.id);
});

test('crear, editar, subtareas, papelera y restauración funcionan correctamente', () => {
  const created = createTaskEntity(
    {
      title: '  Diseñar módulo de tareas  ',
      description: 'Arquitectura limpia',
      priority: 'High',
      status: 'Pending',
      tags: ['Backend', ' backend ', 'SQLite'],
      subtasks: [{ id: 's1', title: 'Crear dominio', completed: false }],
      estimatedMinutes: 90,
      startDate: TODAY,
      dueDate: TODAY,
    },
    101,
    NOW,
  );

  assert.equal(created.title, 'Diseñar módulo de tareas');
  assert.deepEqual(created.tags, ['backend', 'sqlite']);
  assert.equal(formatEstimatedMinutes(created.estimatedMinutes), '1h 30m');

  const withSubtaskDone = toggleSubtaskCompletion(created, 's1', NOW);
  assert.equal(withSubtaskDone.subtasks[0].completed, true);

  const updated = applyTaskUpdate(
    withSubtaskDone,
    { id: 101, title: 'Módulo de tareas v2', status: 'InProgress', priority: 'Urgent' },
    '2026-11-24T13:00:00.000Z',
  );
  assert.equal(updated.title, 'Módulo de tareas v2');
  assert.equal(updated.status, 'InProgress');
  assert.equal(updated.priority, 'Urgent');

  const trashed = markTaskSoftDeleted(updated, '2026-11-24T14:00:00.000Z');
  assert.equal(trashed.deletedAt, '2026-11-24T14:00:00.000Z');

  const restored = markTaskRestored(trashed, '2026-11-24T14:05:00.000Z');
  assert.equal(restored.deletedAt, null);
});

test('completar una tarea recurrente genera automáticamente la siguiente instancia', () => {
  const dailyTask = createTaskEntity(
    {
      title: 'Standup diario',
      startDate: '2026-11-24',
      dueDate: '2026-11-24',
      recurrence: { frequency: 'daily', interval: 2, endDate: '2026-11-30' },
      subtasks: [{ id: 'a', title: 'Revisar tablero', completed: true }],
    },
    200,
    NOW,
  );

  const { updated, spawned } = toggleTaskCompletion(dailyTask, NOW, 201);
  assert.equal(updated.status, 'Completed');
  assert.ok(updated.completedAt);
  assert.ok(spawned);
  assert.equal(spawned.id, 201);
  assert.equal(spawned.status, 'Pending');
  assert.equal(spawned.dueDate, '2026-11-26');
  assert.equal(spawned.subtasks[0].completed, false);

  // Respects endDate limit
  const pastLimit = addRecurrenceToDate('2026-11-29', {
    frequency: 'daily',
    interval: 2,
    endDate: '2026-11-30',
  });
  assert.equal(pastLimit, null);
});

test('vistas, filtros, búsqueda, ordenamiento y resumen funcionan correctamente', () => {
  const overdueTask = createTaskEntity(
    { title: 'Atrasada', dueDate: '2026-11-22', priority: 'Urgent', category: 'Trabajo', tags: ['critico'] },
    1,
    NOW,
  );
  const todayTask = createTaskEntity(
    { title: 'Para hoy', dueDate: TODAY, priority: 'High', category: 'Desarrollo', tags: ['react'] },
    2,
    NOW,
  );
  const upcomingTask = createTaskEntity(
    { title: 'Futura', dueDate: '2026-11-28', priority: 'Low', category: 'Personal', tags: ['hogar'] },
    3,
    NOW,
  );
  const completedTask = changeTaskStatus(
    createTaskEntity({ title: 'Hecha', dueDate: TODAY, priority: 'Medium', category: 'Desarrollo' }, 4, NOW),
    'Completed',
    NOW,
    99,
  ).updated;
  const trashedTask = markTaskSoftDeleted(
    createTaskEntity({ title: 'En papelera', dueDate: TODAY, priority: 'Low' }, 5, NOW),
    NOW,
  );

  const all = [overdueTask, todayTask, upcomingTask, completedTask, trashedTask];

  assert.equal(isTaskOverdue(overdueTask, TODAY), true);
  assert.equal(isTaskDueToday(todayTask, TODAY), true);
  assert.equal(isTaskUpcoming(upcomingTask, TODAY), true);

  const baseCriteria: TaskFilterCriteria = {
    view: 'Todas',
    search: '',
    status: 'All',
    priority: 'All',
    category: 'All',
    tag: 'All',
    sortBy: 'priority',
    sortDirection: 'desc',
  };

  const todas = filterAndSortTasks(all, baseCriteria, TODAY);
  assert.equal(todas.length, 4);
  assert.equal(todas[0].id, 1); // Urgent first

  assert.equal(filterAndSortTasks(all, { ...baseCriteria, view: 'Hoy' }, TODAY).length, 2);
  assert.equal(filterAndSortTasks(all, { ...baseCriteria, view: 'Próximas' }, TODAY).length, 1);
  assert.equal(filterAndSortTasks(all, { ...baseCriteria, view: 'Vencidas' }, TODAY).length, 1);
  assert.equal(filterAndSortTasks(all, { ...baseCriteria, view: 'Completadas' }, TODAY).length, 1);
  assert.equal(filterAndSortTasks(all, { ...baseCriteria, view: 'Papelera' }, TODAY).length, 1);

  const byTag = filterAndSortTasks(all, { ...baseCriteria, tag: 'react' }, TODAY);
  assert.deepEqual(
    byTag.map((t) => t.id),
    [2],
  );

  const bySearch = filterAndSortTasks(all, { ...baseCriteria, search: 'critico' }, TODAY);
  assert.deepEqual(
    bySearch.map((t) => t.id),
    [1],
  );

  const summary = computeTaskSummary(all, TODAY);
  assert.equal(summary.totalActive, 4);
  assert.equal(summary.completed, 1);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.trashed, 1);
  assert.equal(summary.byPriority.Urgent, 1);
});
