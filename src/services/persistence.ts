import { invoke, isTauri } from '@tauri-apps/api/core';
import type {
  AppData,
  CalendarEvent,
  FocusSession,
  Project,
  Reminder,
  Task,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  settings: 'cronia.settings',
  tasks: 'cronia.tasks',
  projects: 'cronia.projects',
  events: 'cronia.events',
  reminders: 'cronia.reminders',
  sessions: 'cronia.sessions',
} as const;

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore browser storage quota errors
  }
}

function writeLocalAppData(data: AppData): void {
  writeLocal(STORAGE_KEYS.settings, data.settings);
  writeLocal(STORAGE_KEYS.tasks, data.tasks);
  writeLocal(STORAGE_KEYS.projects, data.projects);
  writeLocal(STORAGE_KEYS.events, data.events);
  writeLocal(STORAGE_KEYS.reminders, data.reminders);
  writeLocal(STORAGE_KEYS.sessions, data.sessions);
}

export const persistence = {
  async loadAppData(defaults: AppData): Promise<AppData> {
    if (isTauri()) {
      return invoke<AppData>('load_app_data', { defaults });
    }
    return {
      settings: readLocal(STORAGE_KEYS.settings, defaults.settings),
      tasks: readLocal(STORAGE_KEYS.tasks, defaults.tasks),
      projects: readLocal(STORAGE_KEYS.projects, defaults.projects),
      events: readLocal(STORAGE_KEYS.events, defaults.events),
      reminders: readLocal(STORAGE_KEYS.reminders, defaults.reminders),
      sessions: readLocal(STORAGE_KEYS.sessions, defaults.sessions),
    };
  },

  async resetAllData(defaults: AppData): Promise<AppData> {
    if (isTauri()) {
      return invoke<AppData>('reset_all_data', { defaults });
    }
    writeLocalAppData(defaults);
    return defaults;
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    if (isTauri()) {
      await invoke('save_settings', { settings });
      return;
    }
    writeLocal(STORAGE_KEYS.settings, settings);
  },

  async upsertTask(task: Task): Promise<void> {
    if (isTauri()) {
      await invoke('upsert_task', { task });
      return;
    }
    const list = readLocal<Task[]>(STORAGE_KEYS.tasks, []);
    const exists = list.some((item) => item.id === task.id);
    writeLocal(
      STORAGE_KEYS.tasks,
      exists ? list.map((item) => (item.id === task.id ? task : item)) : [task, ...list],
    );
  },

  async deleteTask(id: number): Promise<void> {
    if (isTauri()) {
      await invoke('delete_task', { id });
      return;
    }
    const list = readLocal<Task[]>(STORAGE_KEYS.tasks, []);
    writeLocal(
      STORAGE_KEYS.tasks,
      list.filter((item) => item.id !== id),
    );
  },

  async upsertProject(project: Project): Promise<void> {
    if (isTauri()) {
      await invoke('upsert_project', { project });
      return;
    }
    const list = readLocal<Project[]>(STORAGE_KEYS.projects, []);
    const exists = list.some((item) => item.id === project.id);
    writeLocal(
      STORAGE_KEYS.projects,
      exists ? list.map((item) => (item.id === project.id ? project : item)) : [...list, project],
    );
  },

  async upsertEvent(event: CalendarEvent): Promise<void> {
    if (isTauri()) {
      await invoke('upsert_event', { event });
      return;
    }
    const list = readLocal<CalendarEvent[]>(STORAGE_KEYS.events, []);
    const exists = list.some((item) => item.id === event.id);
    writeLocal(
      STORAGE_KEYS.events,
      exists ? list.map((item) => (item.id === event.id ? event : item)) : [...list, event],
    );
  },

  async deleteEvent(id: number): Promise<void> {
    if (isTauri()) {
      await invoke('delete_event', { id });
      return;
    }
    const list = readLocal<CalendarEvent[]>(STORAGE_KEYS.events, []);
    writeLocal(
      STORAGE_KEYS.events,
      list.filter((item) => item.id !== id),
    );
  },

  async upsertReminder(reminder: Reminder): Promise<void> {
    if (isTauri()) {
      await invoke('upsert_reminder', { reminder });
      return;
    }
    const list = readLocal<Reminder[]>(STORAGE_KEYS.reminders, []);
    const exists = list.some((item) => item.id === reminder.id);
    writeLocal(
      STORAGE_KEYS.reminders,
      exists ? list.map((item) => (item.id === reminder.id ? reminder : item)) : [...list, reminder],
    );
  },

  async deleteReminder(id: number): Promise<void> {
    if (isTauri()) {
      await invoke('delete_reminder', { id });
      return;
    }
    const list = readLocal<Reminder[]>(STORAGE_KEYS.reminders, []);
    writeLocal(
      STORAGE_KEYS.reminders,
      list.filter((item) => item.id !== id),
    );
  },

  async upsertFocusSession(session: FocusSession): Promise<void> {
    if (isTauri()) {
      await invoke('upsert_focus_session', { session });
      return;
    }
    const list = readLocal<FocusSession[]>(STORAGE_KEYS.sessions, []);
    writeLocal(STORAGE_KEYS.sessions, [session, ...list]);
  },
};
