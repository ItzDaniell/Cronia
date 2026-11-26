import { invoke, isTauri } from '@tauri-apps/api/core';
import type { BackupInfo, Reminder } from '@/types';

const BEFORE_OFFSET_MINUTES: Record<string, number> = {
  'A la hora': 0,
  '5 minutos antes': 5,
  '15 minutos antes': 15,
  '30 minutos antes': 30,
  '1 hora antes': 60,
  '1 día antes': 24 * 60,
};

export function getReminderTriggerDate(reminder: Reminder): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reminder.date)) return null;
  const [y, m, d] = reminder.date.split('-').map(Number);
  const [hh, mm] = (reminder.time || '09:00').split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  const target = new Date(y, m - 1, d, hh, mm, 0, 0);
  const offsetMins = BEFORE_OFFSET_MINUTES[reminder.before] ?? 0;
  target.setMinutes(target.getMinutes() - offsetMins);
  return target;
}

export const native = {
  async sendNotification(title: string, body: string): Promise<void> {
    if (isTauri()) {
      await invoke('send_native_notification', { title, body });
      return;
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') new Notification(title, { body });
      }
    }
  },

  async setAutostart(enabled: boolean): Promise<void> {
    if (!isTauri()) return;
    await invoke('set_autostart', { enabled });
  },

  async runAutoBackupIfNeeded(): Promise<BackupInfo | null> {
    if (!isTauri()) return null;
    return invoke<BackupInfo | null>('run_auto_backup_if_needed');
  },
};
