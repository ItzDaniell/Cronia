import { useState } from 'react';
import type { Reminder } from '../../types';
import { Icon } from '../ui/Icon';

interface ReminderModalProps {
  reminder: Reminder;
  isNew: boolean;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
}

export function ReminderModal({ reminder, isNew, onClose, onSave }: ReminderModalProps) {
  const [draft, setDraft] = useState<Reminder>(reminder);

  return (
    <div className="modal-layer">
      <button type="button" className="modal-bg" onClick={onClose} aria-label="Cerrar modal" />
      <form
        className="modal reminder-editor"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <header>
          <div>
            <span>{isNew ? 'NUEVO RECORDATORIO' : 'EDITAR RECORDATORIO'}</span>
            <h2>{isNew ? 'Programar alerta' : 'Actualizar alerta'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <label>
          Título
          <input
            value={draft.title}
            required
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            autoFocus
          />
        </label>

        <div className="form-row">
          <label>
            Fecha
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
          <label>
            Hora
            <input
              type="time"
              value={draft.time}
              onChange={(event) => setDraft({ ...draft, time: event.target.value })}
            />
          </label>
        </div>

        <label>
          Anticipación
          <select
            value={draft.before}
            onChange={(event) => setDraft({ ...draft, before: event.target.value })}
          >
            <option>A la hora</option>
            <option>5 minutos antes</option>
            <option>15 minutos antes</option>
            <option>30 minutos antes</option>
            <option>1 hora antes</option>
            <option>1 día antes</option>
          </select>
        </label>

        <label className="editor-toggle">
          <span>
            <strong>Recordatorio activo</strong>
            Permitir que Windows muestre esta alerta
          </span>
          <button
            type="button"
            className={`switch ${draft.enabled ? 'on' : ''}`}
            onClick={() => setDraft({ ...draft, enabled: !draft.enabled })}
          >
            <i />
          </button>
        </label>

        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {isNew ? 'Programar' : 'Guardar cambios'}
          </button>
        </footer>
      </form>
    </div>
  );
}
