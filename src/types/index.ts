export type IconName =
  | 'grid' | 'check' | 'folder' | 'calendar' | 'bell' | 'timer' | 'chart'
  | 'settings' | 'search' | 'sun' | 'moon' | 'plus' | 'more' | 'clock'
  | 'menu' | 'close' | 'arrow' | 'play' | 'pause' | 'trash' | 'repeat'
  | 'target' | 'list' | 'flag' | 'bolt' | 'monitor' | 'palette' | 'info';

export type ModuleName =
  | 'Dashboard'
  | 'Tareas'
  | 'Proyectos'
  | 'Calendario'
  | 'Recordatorios'
  | 'Enfoque'
  | 'Estadísticas'
  | 'Configuración';

export type AccentTone = 'violet' | 'blue' | 'cyan' | 'green' | 'orange' | 'red';

export type Priority = 'Urgente' | 'Alta' | 'Media' | 'Baja';

export type TaskStatus = 'Pendiente' | 'En progreso' | 'Completada' | 'Vencida';

export interface ModuleNavItem {
  name: ModuleName;
  icon: IconName;
  group?: string;
  badge?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  due: string;
  start: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  estimate: string;
  subtasks: string;
  done: boolean;
  color: AccentTone;
}

export interface Project {
  id: number;
  name: string;
  desc: string;
  color: AccentTone;
  done: number;
  total: number;
  date: string;
  archived: boolean;
}

export interface CalendarEvent {
  id: number;
  day: number;
  title: string;
  type: 'Trabajo' | 'Enfoque' | 'Entrega' | 'Tarea' | 'Evento';
  color: AccentTone;
  time: string;
}

export interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
  before: string;
  color: AccentTone;
  enabled: boolean;
}

export interface FocusSession {
  id: number;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
  completionRate: number;
  color: AccentTone;
}

export interface WeekDayStat {
  day: string;
  date: number;
  value: number;
  today?: boolean;
}

export interface UserSettings {
  userName: string;
  dark: boolean;
  accent: AccentTone;
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  nativeNotifications: boolean;
  soundEnabled: boolean;
  autoBackup: boolean;
  diagnostics: boolean;
  firstDayOfWeek: 'Lunes' | 'Domingo';
  language: 'Español' | 'English';
}

export interface AppData {
  settings: UserSettings;
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  reminders: Reminder[];
  sessions: FocusSession[];
}
