import type {
  AppData,
  ModuleName,
  ModuleNavItem,
  UserSettings,
} from '../types';

export const MODULE_ITEMS: ModuleNavItem[] = [
  { name: 'Dashboard', icon: 'grid', group: 'ORGANIZACIÓN' },
  { name: 'Tareas', icon: 'check' },
  { name: 'Proyectos', icon: 'folder' },
  { name: 'Calendario', icon: 'calendar' },
  { name: 'Recordatorios', icon: 'bell' },
  { name: 'Enfoque', icon: 'timer', group: 'PRODUCTIVIDAD' },
  { name: 'Estadísticas', icon: 'chart' },
  { name: 'Configuración', icon: 'settings', group: 'SISTEMA' },
];

export const PAGE_DESCRIPTIONS: Record<ModuleName, string> = {
  Dashboard: 'Tu centro de control para hoy.',
  Tareas: 'Organiza, prioriza y completa tus actividades.',
  Proyectos: 'Agrupa el trabajo y alcanza tus objetivos.',
  Calendario: 'Planifica tu tiempo sin perder ningún detalle.',
  Recordatorios: 'Programa alertas y notificaciones de Windows.',
  Enfoque: 'Concentra tu atención y registra cada sesión.',
  Estadísticas: 'Analiza tus hábitos y mejora tu productividad.',
  Configuración: 'Personaliza Cronia a tu manera.',
};

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Usuario',
  dark: true,
  accent: 'green',
  launchOnStartup: true,
  minimizeToTray: true,
  nativeNotifications: true,
  soundEnabled: true,
  autoBackup: true,
  diagnostics: false,
  firstDayOfWeek: 'Lunes',
  language: 'Español',
};

export const EMPTY_APP_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  tasks: [],
  projects: [],
  events: [],
  reminders: [],
  sessions: [],
};
