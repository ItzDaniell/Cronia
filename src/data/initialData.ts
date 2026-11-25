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
import { toLocalDateKey } from '../modules/tasks/domain/rules';

const todayDate = new Date();
const TODAY_KEY = toLocalDateKey(todayDate);
const YESTERDAY_KEY = toLocalDateKey(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1));
const TOMORROW_KEY = toLocalDateKey(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1));
const NEXT_WEEK_KEY = toLocalDateKey(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 5));
const NOW_ISO = todayDate.toISOString();

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
    description: 'Definir entidades, índices y migraciones SQLite en Rust',
    projectId: 1,
    project: 'Cronia Desktop',
    startDate: YESTERDAY_KEY,
    dueDate: TODAY_KEY,
    priority: 'High',
    status: 'Completed',
    category: 'Desarrollo',
    tags: ['sqlite', 'arquitectura'],
    subtasks: [
      { id: '1-1', title: 'Definir tabla tasks', completed: true },
      { id: '1-2', title: 'Añadir soporte de papelera', completed: true },
      { id: '1-3', title: 'Escribir pruebas unitarias', completed: true },
    ],
    estimatedMinutes: 45,
    recurrence: { frequency: 'none', interval: 1, endDate: null },
    color: 'violet',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: NOW_ISO,
    deletedAt: null,
  },
  {
    id: 2,
    title: 'Organizar arquitectura de componentes',
    description: 'Separar dominio, casos de uso, validaciones y vistas del módulo de tareas',
    projectId: 1,
    project: 'Cronia Desktop',
    startDate: TODAY_KEY,
    dueDate: TODAY_KEY,
    priority: 'Urgent',
    status: 'InProgress',
    category: 'Desarrollo',
    tags: ['frontend', 'react', 'refactor'],
    subtasks: [
      { id: '2-1', title: 'Crear entidades y reglas de dominio', completed: true },
      { id: '2-2', title: 'Implementar ViewModel y filtros', completed: true },
      { id: '2-3', title: 'Conectar tablero Kanban interactivo', completed: false },
    ],
    estimatedMinutes: 60,
    recurrence: { frequency: 'none', interval: 1, endDate: null },
    color: 'red',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: null,
    deletedAt: null,
  },
  {
    id: 3,
    title: 'Revisión diaria de objetivos',
    description: 'Revisar pendientes críticos y planificar bloques de enfoque',
    projectId: 4,
    project: 'Trabajo',
    startDate: TODAY_KEY,
    dueDate: TODAY_KEY,
    priority: 'Medium',
    status: 'Pending',
    category: 'Trabajo',
    tags: ['rutina', 'sprint'],
    subtasks: [
      { id: '3-1', title: 'Revisar tareas vencidas', completed: false },
      { id: '3-2', title: 'Definir 3 prioridades del día', completed: false },
    ],
    estimatedMinutes: 30,
    recurrence: { frequency: 'daily', interval: 1, endDate: null },
    color: 'blue',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: null,
    deletedAt: null,
  },
  {
    id: 4,
    title: 'Comprar material de oficina',
    description: 'Cuaderno, marcadores y archivadores',
    projectId: 3,
    project: 'Organización personal',
    startDate: TODAY_KEY,
    dueDate: TOMORROW_KEY,
    priority: 'Low',
    status: 'Pending',
    category: 'Personal',
    tags: ['compras', 'hogar'],
    subtasks: [
      { id: '4-1', title: 'Revisar lista de papelería', completed: false },
    ],
    estimatedMinutes: 20,
    recurrence: { frequency: 'none', interval: 1, endDate: null },
    color: 'green',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: null,
    deletedAt: null,
  },
  {
    id: 5,
    title: 'Configurar notificaciones de escritorio',
    description: 'Integrar alertas nativas de Windows para recordatorios',
    projectId: 1,
    project: 'Cronia Desktop',
    startDate: YESTERDAY_KEY,
    dueDate: YESTERDAY_KEY,
    priority: 'High',
    status: 'Pending',
    category: 'Desarrollo',
    tags: ['windows', 'tauri'],
    subtasks: [
      { id: '5-1', title: 'Configurar permisos Tauri', completed: true },
      { id: '5-2', title: 'Probar notificación toast', completed: false },
    ],
    estimatedMinutes: 120,
    recurrence: { frequency: 'weekly', interval: 1, endDate: null },
    color: 'violet',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: null,
    deletedAt: null,
  },
  {
    id: 6,
    title: 'Preparar entrega de documentación técnica',
    description: 'Consolidar arquitectura, diagrama de módulos y guía de pruebas',
    projectId: 4,
    project: 'Trabajo',
    startDate: TOMORROW_KEY,
    dueDate: NEXT_WEEK_KEY,
    priority: 'Medium',
    status: 'Pending',
    category: 'Trabajo',
    tags: ['docs', 'entrega'],
    subtasks: [],
    estimatedMinutes: 90,
    recurrence: { frequency: 'none', interval: 1, endDate: null },
    color: 'blue',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    completedAt: null,
    deletedAt: null,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 1, name: 'Cronia Desktop', desc: 'Aplicación de productividad personal', color: 'violet', done: 18, total: 24, date: '24 mayo', archived: false },
  { id: 2, name: 'Portafolio personal', desc: 'Diseño y desarrollo web', color: 'blue', done: 7, total: 12, date: '2 junio', archived: false },
  { id: 3, name: 'Organización personal', desc: 'Rutinas y objetivos mensuales', color: 'orange', done: 9, total: 15, date: '31 mayo', archived: false },
  { id: 4, name: 'Trabajo', desc: 'Entregables y seguimiento diario', color: 'green', done: 11, total: 20, date: 'Sin fecha', archived: false },
];

const ymPrefix = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}`;

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 1, day: 6, date: `${ymPrefix}-06`, title: 'Planificar sprint', type: 'Trabajo', color: 'violet', time: '09:00' },
  { id: 2, day: 15, date: `${ymPrefix}-15`, title: 'Sesión de enfoque', type: 'Enfoque', color: 'blue', time: '11:30' },
  { id: 3, day: 15, date: `${ymPrefix}-15`, title: 'Entrega documentación', type: 'Entrega', color: 'orange', time: '16:00' },
  { id: 4, day: 18, date: `${ymPrefix}-18`, title: 'Fecha límite', type: 'Tarea', color: 'red', time: '18:00' },
  { id: 5, day: 22, date: `${ymPrefix}-22`, title: 'Revisión mensual', type: 'Evento', color: 'green', time: '10:00' },
];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 1, title: 'Reunión de planificación', date: '2026-11-24', time: '08:45', before: '15 minutos antes', color: 'violet', enabled: true },
  { id: 2, title: 'Entregar documentación', date: '2026-11-24', time: '15:30', before: '30 minutos antes', color: 'orange', enabled: true },
  { id: 3, title: 'Revisión semanal', date: '2026-11-27', time: '18:00', before: 'A la hora', color: 'blue', enabled: false },
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  { id: 1, taskId: 2, taskTitle: 'Organizar arquitectura de componentes', durationMinutes: 50, date: TODAY_KEY, completedAt: '10:30', completionRate: 100, color: 'violet' },
  { id: 2, taskId: 1, taskTitle: 'Diseñar esquema de base de datos local', durationMinutes: 25, date: TODAY_KEY, completedAt: '09:15', completionRate: 100, color: 'blue' },
  { id: 3, taskId: 3, taskTitle: 'Revisión diaria de objetivos', durationMinutes: 10, date: TODAY_KEY, completedAt: '08:40', completionRate: 40, color: 'orange' },
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
