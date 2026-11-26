import { useState } from 'react';
import { Bell, Calendar, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Reminder } from '@/types';
import { downloadJson } from '@/utils/exportData';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReminderModal } from '@/components/modals/ReminderModal';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface RemindersPageProps {
  reminders: Reminder[];
  onSaveReminder: (reminder: Reminder, isNew: boolean) => void;
  onToggleReminder: (id: number) => void;
  onDeleteReminder: (id: number) => void;
  onNotify: (message: string) => void;
}

export function RemindersPage({
  reminders,
  onSaveReminder,
  onToggleReminder,
  onDeleteReminder,
  onNotify,
}: RemindersPageProps) {
  const { tr } = useI18n();
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [prefs, setPrefs] = useState([true, true, false]);

  const current: Reminder | null =
    editing === 'new'
      ? {
          id: Date.now(),
          title: '',
          date: new Date().toISOString().slice(0, 10),
          time: '09:00',
          before: '15 minutos antes',
          color: 'green',
          enabled: true,
        }
      : typeof editing === 'number'
        ? reminders.find((r) => r.id === editing) ?? null
        : null;

  const handleSave = (reminder: Reminder) => {
    onSaveReminder(reminder, editing === 'new');
    setEditing(null);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <Card className="overflow-hidden xl:col-span-8">
        <CardHeader>
          <div>
            <CardTitle>{tr('Recordatorios programados', 'Scheduled reminders')}</CardTitle>
            <CardDescription>
              {tr(
                `${reminders.filter((item) => item.enabled).length} alertas activas`,
                `${reminders.filter((item) => item.enabled).length} active alerts`,
              )}
            </CardDescription>
          </div>
          <Button type="button" size="sm" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" />
            {tr('Programar', 'Schedule')}
          </Button>
        </CardHeader>

        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
              <Bell className="h-6 w-6" />
            </div>
            <p className="m-0 text-sm font-semibold text-[var(--text)]">
              {tr('No hay recordatorios programados', 'No scheduled reminders')}
            </p>
            <p className="m-0 text-xs text-[var(--muted)]">
              {tr(
                'Crea uno para recibir alertas de tus actividades importantes.',
                'Create one to receive alerts for your important activities.',
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex flex-wrap items-center gap-3.5 px-5 py-4 transition-colors hover:bg-[var(--surface-2)]/40"
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${reminder.color}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">{reminder.title}</p>
                  <p className="m-0 mt-0.5 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Calendar className="h-3.5 w-3.5" />
                    {reminder.date} · {reminder.time} · {reminder.before}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => onToggleReminder(reminder.id)}
                    aria-label={tr('Activar recordatorio', 'Toggle reminder')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(reminder.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {tr('Editar', 'Edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-rose-500"
                    onClick={() => onDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <aside className="flex flex-col gap-5 xl:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>{tr('Preferencias rápidas', 'Quick preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-[var(--line)] py-2">
            {[
              tr('Sonido', 'Sound'),
              tr('Mostrar en pantalla', 'Show on screen'),
              tr('Posponer 10 min', 'Snooze 10 min'),
            ].map((item, index) => (
              <div key={item} className="flex items-center justify-between py-3">
                <span className="text-[13px] font-medium text-[var(--text)]">{item}</span>
                <Switch
                  checked={prefs[index]}
                  onCheckedChange={() =>
                    setPrefs(prefs.map((value, itemIndex) => (itemIndex === index ? !value : value)))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr('Historial de envíos', 'Delivery history')}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                downloadJson(`cronia-recordatorios-${new Date().toISOString().slice(0, 10)}.json`, reminders);
                onNotify(tr('Recordatorios exportados (JSON)', 'Reminders exported (JSON)'));
              }}
            >
              <Download className="h-3.5 w-3.5" />
              {tr('Exportar', 'Export')}
            </Button>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="m-0 py-4 text-center text-xs text-[var(--muted)]">
                {tr('Sin alertas registradas todavía.', 'No alerts logged yet.')}
              </p>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {reminders.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className={`h-2 w-2 rounded-full ${r.enabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[13px] font-semibold">{r.title}</p>
                      <p className="m-0 text-xs text-[var(--muted)]">
                        {r.enabled
                          ? tr(`Programada · ${r.time}`, `Scheduled · ${r.time}`)
                          : tr('Pausada', 'Paused')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {current && (
        <ReminderModal
          reminder={current}
          isNew={editing === 'new'}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
