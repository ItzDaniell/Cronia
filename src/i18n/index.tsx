import { createContext, useContext, type ReactNode } from 'react';
import type {
  ModuleName,
  RecurrenceFrequency,
  TaskPriority,
  TaskStatus,
  TaskView,
  UserSettings,
} from '@/types';

export type AppLanguage = UserSettings['language'];

const MODULE_LABELS: Record<AppLanguage, Record<ModuleName, string>> = {
  Español: {
    Dashboard: 'Dashboard',
    Tareas: 'Tareas',
    Proyectos: 'Proyectos',
    Calendario: 'Calendario',
    Recordatorios: 'Recordatorios',
    Enfoque: 'Enfoque',
    Estadísticas: 'Estadísticas',
    Configuración: 'Configuración',
  },
  English: {
    Dashboard: 'Dashboard',
    Tareas: 'Tasks',
    Proyectos: 'Projects',
    Calendario: 'Calendar',
    Recordatorios: 'Reminders',
    Enfoque: 'Focus',
    Estadísticas: 'Analytics',
    Configuración: 'Settings',
  },
};

const PAGE_DESCRIPTIONS_I18N: Record<AppLanguage, Record<ModuleName, string>> = {
  Español: {
    Dashboard: 'Tu centro de control para hoy.',
    Tareas: 'Organiza, prioriza y completa tus actividades.',
    Proyectos: 'Agrupa el trabajo y alcanza tus objetivos.',
    Calendario: 'Planifica tu tiempo sin perder ningún detalle.',
    Recordatorios: 'Programa alertas y notificaciones de Windows.',
    Enfoque: 'Concentra tu atención y registra cada sesión.',
    Estadísticas: 'Analiza tus hábitos y mejora tu productividad.',
    Configuración: 'Personaliza Cronia a tu manera.',
  },
  English: {
    Dashboard: 'Your command center for today.',
    Tareas: 'Organize, prioritize, and complete your activities.',
    Proyectos: 'Group related work and reach your goals.',
    Calendario: 'Plan your schedule without missing a beat.',
    Recordatorios: 'Schedule alerts and native Windows notifications.',
    Enfoque: 'Stay focused and log every deep-work session.',
    Estadísticas: 'Analyze your habits and improve your productivity.',
    Configuración: 'Customize Cronia to match your workflow.',
  },
};

const GROUP_LABELS: Record<AppLanguage, Record<string, string>> = {
  Español: {
    ORGANIZACIÓN: 'ORGANIZACIÓN',
    PRODUCTIVIDAD: 'PRODUCTIVIDAD',
    SISTEMA: 'SISTEMA',
  },
  English: {
    ORGANIZACIÓN: 'ORGANIZATION',
    PRODUCTIVIDAD: 'PRODUCTIVITY',
    SISTEMA: 'SYSTEM',
  },
};

const STATUS_I18N: Record<AppLanguage, Record<TaskStatus, string>> = {
  Español: {
    Pending: 'Pendiente',
    InProgress: 'En progreso',
    Completed: 'Completada',
    Cancelled: 'Cancelada',
  },
  English: {
    Pending: 'Pending',
    InProgress: 'In progress',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  },
};

const PRIORITY_I18N: Record<AppLanguage, Record<TaskPriority, string>> = {
  Español: {
    Low: 'Baja',
    Medium: 'Media',
    High: 'Alta',
    Urgent: 'Urgente',
  },
  English: {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
    Urgent: 'Urgent',
  },
};

const RECURRENCE_I18N: Record<AppLanguage, Record<RecurrenceFrequency, string>> = {
  Español: {
    none: 'Sin recurrencia',
    daily: 'Diaria',
    weekly: 'Semanal',
    monthly: 'Mensual',
  },
  English: {
    none: 'No repeat',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  },
};

const TASK_VIEW_I18N: Record<AppLanguage, Record<TaskView, string>> = {
  Español: {
    Todas: 'Todas',
    Hoy: 'Hoy',
    Próximas: 'Próximas',
    Vencidas: 'Vencidas',
    Completadas: 'Completadas',
    Papelera: 'Papelera',
  },
  English: {
    Todas: 'All',
    Hoy: 'Today',
    Próximas: 'Upcoming',
    Vencidas: 'Overdue',
    Completadas: 'Completed',
    Papelera: 'Trash',
  },
};

interface I18nContextValue {
  language: AppLanguage;
  isEn: boolean;
  locale: string;
  tr: (es: string, en: string) => string;
  moduleLabel: (name: ModuleName) => string;
  pageDescription: (name: ModuleName) => string;
  groupLabel: (group: string) => string;
  statusLabel: (status: TaskStatus) => string;
  priorityLabel: (priority: TaskPriority) => string;
  recurrenceLabel: (freq: RecurrenceFrequency) => string;
  taskViewLabel: (view: TaskView) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'Español',
  isEn: false,
  locale: 'es-ES',
  tr: (es) => es,
  moduleLabel: (name) => name,
  pageDescription: (name) => PAGE_DESCRIPTIONS_I18N.Español[name],
  groupLabel: (g) => g,
  statusLabel: (s) => STATUS_I18N.Español[s],
  priorityLabel: (p) => PRIORITY_I18N.Español[p],
  recurrenceLabel: (f) => RECURRENCE_I18N.Español[f],
  taskViewLabel: (v) => TASK_VIEW_I18N.Español[v],
});

export function I18nProvider({
  language,
  children,
}: {
  language: AppLanguage;
  children: ReactNode;
}) {
  const isEn = language === 'English';
  const value: I18nContextValue = {
    language,
    isEn,
    locale: isEn ? 'en-US' : 'es-ES',
    tr: (es, en) => (isEn ? en : es),
    moduleLabel: (name) => MODULE_LABELS[language][name],
    pageDescription: (name) => PAGE_DESCRIPTIONS_I18N[language][name],
    groupLabel: (group) => GROUP_LABELS[language][group] ?? group,
    statusLabel: (status) => STATUS_I18N[language][status],
    priorityLabel: (priority) => PRIORITY_I18N[language][priority],
    recurrenceLabel: (freq) => RECURRENCE_I18N[language][freq],
    taskViewLabel: (view) => TASK_VIEW_I18N[language][view],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
