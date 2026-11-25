import type {
  CalendarEvent,
  FocusSession,
  ModuleName,
  ModuleNavItem,
  Project,
  Reminder,
  Task,
  UserSettings,
  WeekDayStat,
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

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Diseñar esquema de base de datos local',
    description: 'Definir entidades y relaciones principales',
    project: 'Cronia Desktop',
    due: 'Hoy, 10:30',
    start: 'Hoy',
    priority: 'Alta',
    status: 'Completada',
    category: 'Desarrollo',
    estimate: '45 min',
    subtasks: '3/3',
    done: true,
    color: 'violet',
  },
  {
    id: 2,
    title: 'Organizar arquitectura de componentes',
    description: 'Separar módulos, tipos y lógica de estado',
    project: 'Cronia Desktop',
    due: 'Hoy, 14:00',
    start: 'Hoy',
    priority: 'Urgente',
    status: 'En progreso',
    category: 'Desarrollo',
    estimate: '1 h',
    subtasks: '2/5',
    done: false,
    color: 'violet',
  },
  {
    id: 3,
    title: 'Preparar documentación del sprint',
    description: 'Resumen técnico y próximos pasos',
    project: 'Trabajo',
    due: 'Hoy, 17:30',
    start: 'Hoy',
    priority: 'Media',
    status: 'Pendiente',
    category: 'Trabajo',
    estimate: '30 min',
    subtasks: '0/2',
    done: false,
    color: 'cyan',
  },
  {
    id: 4,
    title: 'Comprar material de oficina',
    description: 'Cuaderno, marcadores y archivadores',
    project: 'Personal',
    due: 'Mañana',
    start: 'Mañana',
    priority: 'Baja',
    status: 'Pendiente',
    category: 'Personal',
    estimate: '20 min',
    subtasks: '0/3',
    done: false,
    color: 'orange',
  },
  {
    id: 5,
    title: 'Configurar notificaciones de escritorio',
    description: 'Integrar alertas nativas de Windows',
    project: 'Cronia Desktop',
    due: 'Próxima semana',
    start: 'Hoy',
    priority: 'Alta',
    status: 'Pendiente',
    category: 'Desarrollo',
    estimate: '2 h',
    subtasks: '1/4',
    done: false,
    color: 'violet',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 1, name: 'Cronia Desktop', desc: 'Aplicación de productividad personal', color: 'violet', done: 18, total: 24, date: '24 mayo', archived: false },
  { id: 2, name: 'Portafolio personal', desc: 'Diseño y desarrollo web', color: 'blue', done: 7, total: 12, date: '2 junio', archived: false },
  { id: 3, name: 'Organización personal', desc: 'Rutinas y objetivos mensuales', color: 'orange', done: 9, total: 15, date: '31 mayo', archived: false },
  { id: 4, name: 'Trabajo', desc: 'Entregables y seguimiento diario', color: 'green', done: 11, total: 20, date: 'Sin fecha', archived: false },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 1, day: 6, title: 'Planificar sprint', type: 'Trabajo', color: 'violet', time: '09:00' },
  { id: 2, day: 15, title: 'Sesión de enfoque', type: 'Enfoque', color: 'blue', time: '11:30' },
  { id: 3, day: 15, title: 'Entrega documentación', type: 'Entrega', color: 'orange', time: '16:00' },
  { id: 4, day: 18, title: 'Fecha límite', type: 'Tarea', color: 'red', time: '18:00' },
  { id: 5, day: 22, title: 'Revisión mensual', type: 'Evento', color: 'green', time: '10:00' },
];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 1, title: 'Reunión de planificación', date: '2026-11-24', time: '08:45', before: '15 minutos antes', color: 'violet', enabled: true },
  { id: 2, title: 'Entregar documentación', date: '2026-11-24', time: '15:30', before: '30 minutos antes', color: 'orange', enabled: true },
  { id: 3, title: 'Revisión semanal', date: '2026-11-27', time: '18:00', before: 'A la hora', color: 'blue', enabled: false },
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  { id: 1, taskTitle: 'Organizar arquitectura de componentes', durationMinutes: 50, completedAt: '10:30', completionRate: 100, color: 'violet' },
  { id: 2, taskTitle: 'Diseñar esquema de base de datos local', durationMinutes: 25, completedAt: '09:15', completionRate: 100, color: 'blue' },
  { id: 3, taskTitle: 'Preparar documentación del sprint', durationMinutes: 10, completedAt: '08:40', completionRate: 40, color: 'orange' },
];

export const WEEK_DAYS_DEFAULT: WeekDayStat[] = [
  { day: 'Lun', date: 13, value: 76 },
  { day: 'Mar', date: 14, value: 92 },
  { day: 'Mié', date: 15, value: 64, today: true },
  { day: 'Jue', date: 16, value: 82 },
  { day: 'Vie', date: 17, value: 55 },
  { day: 'Sáb', date: 18, value: 38 },
  { day: 'Dom', date: 19, value: 22 },
];

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Usuario',
  dark: true,
  accent: 'violet',
  launchOnStartup: true,
  minimizeToTray: true,
  nativeNotifications: true,
  soundEnabled: true,
  autoBackup: true,
  diagnostics: false,
  firstDayOfWeek: 'Lunes',
  language: 'Español',
};
