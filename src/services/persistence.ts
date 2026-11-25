import { invoke, isTauri } from '@tauri-apps/api/core';
import type {
  AppData,
  BackupInfo,
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

  async softDeleteTask(id: number, deletedAt: string): Promise<void> {
    if (isTauri()) {
      await invoke('soft_delete_task', { id, deletedAt });
      return;
    }
    const list = readLocal<Task[]>(STORAGE_KEYS.tasks, []);
    writeLocal(
      STORAGE_KEYS.tasks,
      list.map((item) => (item.id === id ? { ...item, deletedAt, updatedAt: deletedAt } : item)),
    );
  },

  async restoreTask(id: number, updatedAt: string): Promise<void> {
    if (isTauri()) {
      await invoke('restore_task', { id, updatedAt });
      return;
    }
    const list = readLocal<Task[]>(STORAGE_KEYS.tasks, []);
    writeLocal(
      STORAGE_KEYS.tasks,
      list.map((item) => (item.id === id ? { ...item, deletedAt: null, updatedAt } : item)),
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

  async deleteProject(id: number): Promise<void> {
    if (isTauri()) {
      await invoke('delete_project', { id });
      return;
    }
    const projects = readLocal<Project[]>(STORAGE_KEYS.projects, []);
    writeLocal(
      STORAGE_KEYS.projects,
      projects.filter((item) => item.id !== id),
    );
    const tasks = readLocal<Task[]>(STORAGE_KEYS.tasks, []);
    writeLocal(
      STORAGE_KEYS.tasks,
      tasks.map((t) => (t.projectId === id ? { ...t, projectId: null, project: 'Sin proyecto' } : t)),
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

  async createBackup(): Promise<BackupInfo> {
    if (isTauri()) {
      return invoke<BackupInfo>('create_backup');
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const fileName = `cronia-backup-${nowSec}.json`;
    const snapshot = JSON.stringify({
      settings: readLocal(STORAGE_KEYS.settings, null),
      tasks: readLocal(STORAGE_KEYS.tasks, []),
      projects: readLocal(STORAGE_KEYS.projects, []),
      events: readLocal(STORAGE_KEYS.events, []),
      reminders: readLocal(STORAGE_KEYS.reminders, []),
      sessions: readLocal(STORAGE_KEYS.sessions, []),
    });
    const backups = readLocal<Record<string, string>>('cronia.backups', {});
    backups[fileName] = snapshot;
    writeLocal('cronia.backups', backups);
    return {
      fileName,
      path: `localStorage://${fileName}`,
      sizeBytes: snapshot.length,
      createdAt: String(nowSec),
    };
  },

  async listBackups(): Promise<BackupInfo[]> {
    if (isTauri()) {
      return invoke<BackupInfo[]>('list_backups');
    }
    const backups = readLocal<Record<string, string>>('cronia.backups', {});
    return Object.entries(backups)
      .map(([fileName, raw]) => ({
        fileName,
        path: `localStorage://${fileName}`,
        sizeBytes: raw.length,
        createdAt: fileName.replace(/\D/g, '') || '0',
      }))
      .sort((a, b) => b.fileName.localeCompare(a.fileName));
  },

  async restoreBackup(fileName: string, fallbackSettings: UserSettings): Promise<AppData> {
    if (isTauri()) {
      return invoke<AppData>('restore_backup', { fileName, fallbackSettings });
    }
    const backups = readLocal<Record<string, string>>('cronia.backups', {});
    const raw = backups[fileName];
    if (!raw) throw new Error('Copia de seguridad no encontrada');
    const parsed = JSON.parse(raw) as AppData;
    const restored: AppData = {
      ...parsed,
      settings: parsed.settings ?? fallbackSettings,
    };
    writeLocalAppData(restored);
    return restored;
  },
};
