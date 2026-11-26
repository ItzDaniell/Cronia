import { useState } from 'react';
import type { AccentTone, CalendarEvent } from '../../types';
import { toLocalDateKey } from '../../modules/tasks/domain/rules';
import { Icon } from '../ui/Icon';

interface EventModalProps {
  eventToEdit?: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'> & { id?: number }) => void;
}

const EVENT_TYPES: CalendarEvent['type'][] = ['Trabajo', 'Enfoque', 'Entrega', 'Tarea', 'Evento'];
const COLORS: AccentTone[] = ['violet', 'blue', 'cyan', 'green', 'orange', 'red'];

export function EventModal({
  eventToEdit = null,
  defaultDate = toLocalDateKey(),
  onClose,
  onSave,
}: EventModalProps) {
  const isEditing = Boolean(eventToEdit);
  const [title, setTitle] = useState(eventToEdit?.title ?? '');
  const [date, setDate] = useState(eventToEdit?.date || defaultDate);
  const [time, setTime] = useState(eventToEdit?.time ?? '10:00');
  const [type, setType] = useState<CalendarEvent['type']>(eventToEdit?.type ?? 'Trabajo');
  const [color, setColor] = useState<AccentTone>(eventToEdit?.color ?? 'violet');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('El título del evento es obligatorio.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Selecciona una fecha válida.');
      return;
    }
    setError('');
    const day = Number(date.slice(8, 10)) || 1;
    onSave({
      id: eventToEdit?.id,
      title: cleanTitle,
      date,
      day,
      time: time || '09:00',
      type,
      color,
    });
  };

  return (
    <div className="modal-layer">
      <button type="button" className="modal-bg" onClick={onClose} aria-label="Cerrar modal" />
      <form className="modal" onSubmit={handleSubmit} noValidate>
        <header>
          <div>
            <span>{isEditing ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}</span>
            <h2>{isEditing ? 'Actualizar actividad' : 'Programar evento'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <label>
          Título *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Reunión de revisión semanal"
            autoFocus
          />
          {error && <small className="field-error">{error}</small>}
        </label>

        <div className="form-row">
          <label>
            Fecha
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Hora
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>

        <div className="form-row">
          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value as CalendarEvent['type'])}>
              {EVENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Color
            <div className="colors" style={{ paddingTop: 6 }}>
              {COLORS.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  className={tone}
                  onClick={() => setColor(tone)}
                  aria-label={`Color ${tone}`}
                  style={{
                    outline: color === tone ? '2px solid var(--text)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </label>
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {isEditing ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </footer>
      </form>
    </div>
  );
}
