import { isTaskCompleted, isTaskDeleted, toLocalDateKey } from '../modules/tasks/domain/rules.ts';
import type { FocusSession, Project, Task, WeekDayStat } from '../types';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function computeWeeklyStats(
  tasks: Task[],
  sessions: FocusSession[],
  referenceDate: Date = new Date(),
): WeekDayStat[] {
  const activeTasks = tasks.filter((t) => !isTaskDeleted(t));
  const todayKey = toLocalDateKey(referenceDate);

  // Last 7 days ending today (or Mon-Sun of current week)
  const monday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() - ((referenceDate.getDay() + 6) % 7),
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = toLocalDateKey(d);

    const planned = activeTasks.filter((t) => t.dueDate === key).length;
    const completed = activeTasks.filter(
      (t) => isTaskCompleted(t) && (t.completedAt?.slice(0, 10) === key || t.dueDate === key),
    ).length;
    const focusMins = sessions
      .filter((s) => s.date === key)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    let value = 0;
    if (planned > 0) {
      value = Math.min(100, Math.round((completed / planned) * 100));
    } else if (completed > 0 || focusMins > 0) {
      // Activity score when there were completed tasks or focus sessions without due tasks
      value = Math.min(100, completed * 30 + Math.round((focusMins / 120) * 70));
    }

    return {
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
      value,
      today: key === todayKey,
    };
  });
}

export function computePeriodMetrics(
  tasks: Task[],
  sessions: FocusSession[],
  days: 7 | 30 | 90,
  referenceDate: Date = new Date(),
) {
  const cutoff = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() - (days - 1),
  );
  const cutoffKey = toLocalDateKey(cutoff);
  const activeTasks = tasks.filter((t) => !isTaskDeleted(t));

  const periodSessions = sessions.filter((s) => !s.date || s.date >= cutoffKey);
  const totalFocusMins = periodSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const periodTasks = activeTasks.filter((t) => {
    const ref = t.dueDate ?? t.createdAt.slice(0, 10);
    return !ref || ref >= cutoffKey;
  });
  const completedTasks = periodTasks.filter((t) => isTaskCompleted(t)).length;
  const completionRate =
    periodTasks.length > 0 ? Math.round((completedTasks / periodTasks.length) * 100) : 0;

  return {
    totalFocusMins,
    focusHours: Math.floor(totalFocusMins / 60),
    focusMins: totalFocusMins % 60,
    sessionsCount: periodSessions.length,
    totalTasks: periodTasks.length,
    completedTasks,
    completionRate,
  };
}

export function computeProjectProgress(project: Project, tasks: Task[]) {
  const active = tasks.filter((t) => !isTaskDeleted(t));
  const linked = active.filter(
    (t) => t.projectId === project.id || (t.projectId === null && t.project === project.name),
  );
  const total = linked.length;
  const done = linked.filter((t) => isTaskCompleted(t)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}
