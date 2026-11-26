import { useState } from 'react';
import type { Reminder } from '../types';
import { downloadJson } from '../utils/exportData';
import { Icon } from '../components/ui/Icon';
import { PanelHeading } from '../components/ui/PanelHeading';
import { ReminderModal } from '../components/modals/ReminderModal';

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
    <div className="module-layout reminders-layout">
      <section className="panel module-main">
        <PanelHeading
          title="Recordatorios programados"
          subtitle={`${reminders.filter((item) => item.enabled).length} alertas activas`}
        />
        <div className="reminder-list">
          {reminders.length === 0 ? (
            <div className="empty-state">
              <Icon name="bell" size={22} />
              <strong>No hay recordatorios programados</strong>
              <span>Crea uno para recibir alertas de tus actividades.</span>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div className="reminder" key={reminder.id}>
                <div className={`reminder-icon ${reminder.color}`}>
                  <Icon name="bell" />
                </div>
                <div>
                  <strong>{reminder.title}</strong>
                  <span>
                    <Icon name="calendar" size={12} />
                    {reminder.date} · {reminder.time} · {reminder.before}
                  </span>
                </div>
                <button
                  type="button"
                  className={`switch ${reminder.enabled ? 'on' : ''}`}
                  onClick={() => onToggleReminder(reminder.id)}
                  aria-label="Activar recordatorio"
                >
                  <i />
                </button>
                <button
                  type="button"
                  className="reminder-action"
                  onClick={() => setEditing(reminder.id)}
                  aria-label={`Editar ${reminder.title}`}
                >
                  <Icon name="settings" size={15} />
                  Editar
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onDeleteReminder(reminder.id)}
                  aria-label={`Eliminar ${reminder.title}`}
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))
          )}
        </div>
        <button type="button" className="inline-add large" onClick={() => setEditing('new')}>
          <Icon name="plus" />
          Programar recordatorio
        </button>
      </section>

      <aside className="module-side">
        <section className="panel mini-panel">
          <PanelHeading title="Preferencias rápidas" />
          <div className="quick-settings">
            {['Sonido', 'Mostrar en pantalla', 'Posponer 10 min'].map((item, index) => (
              <label key={item}>
                {item}
                <button
                  type="button"
                  className={`switch ${prefs[index] ? 'on' : ''}`}
                  onClick={() => setPrefs(prefs.map((value, itemIndex) => (itemIndex === index ? !value : value)))}
                >
                  <i />
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="panel mini-panel notification-log">
          <PanelHeading
            title="Historial de envíos"
            action="Exportar"
            onAction={() => {
              downloadJson(`cronia-recordatorios-${new Date().toISOString().slice(0, 10)}.json`, reminders);
              onNotify('Recordatorios exportados (JSON)');
            }}
          />
          <div>
            {reminders.slice(0, 2).map((r) => (
              <p key={r.id}>
                <i className={r.enabled ? 'green' : 'orange'} />
                <span>
                  <strong>{r.title}</strong>
                  {r.enabled ? `Programada · ${r.time}` : 'Pausada'}
                </span>
              </p>
            ))}
          </div>
        </section>
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
