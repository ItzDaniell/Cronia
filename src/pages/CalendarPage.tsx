import { useState } from 'react';
import type { CalendarEvent } from '../types';
import { Icon } from '../components/ui/Icon';

interface CalendarPageProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: number) => void;
}

export function CalendarPage({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarPageProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState<'Mes' | 'Semana' | 'Día'>('Mes');
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [draftTime, setDraftTime] = useState('');

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(cursor);
  const firstDay = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => index - firstDay + 1);
  const shownEvents = events.filter((event) => filter === 'Todos' || event.type === filter);
  const move = (amount: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1));

  const isCurrentMonth =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  const handleSelect = (event: CalendarEvent) => {
    setSelected(event);
    setDraftTime(event.time);
  };

  return (
    <div className="calendar-layout">
      <section className="panel calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <button type="button" onClick={() => move(-1)} aria-label="Mes anterior">
              <Icon name="arrow" />
            </button>
            <h2>{monthName}</h2>
            <button type="button" className="right" onClick={() => move(1)} aria-label="Mes siguiente">
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="today-btn"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            >
              Hoy
            </button>
          </div>
          <div className="view-switch">
            {(['Mes', 'Semana', 'Día'] as const).map((item) => (
              <button type="button" className={view === item ? 'active' : ''} onClick={() => setView(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="calendar-filters">
          <span>Mostrar:</span>
          {['Todos', 'Trabajo', 'Enfoque', 'Entrega', 'Tarea'].map((item) => (
            <button type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>
              {item}
            </button>
          ))}
          <button
            type="button"
            className="calendar-add"
            onClick={() => {
              const targetDay = isCurrentMonth ? today.getDate() : 1;
              const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
              onAddEvent({
                day: targetDay,
                date: dateKey,
                title: 'Nueva actividad',
                type: 'Trabajo',
                color: 'violet',
                time: '10:00',
              });
            }}
          >
            <Icon name="plus" />
            Evento
          </button>
        </div>

        {view === 'Mes' ? (
          <>
            <div className="calendar-days">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {cells.map((day, index) => (
                <div
                  className={`${isCurrentMonth && day === today.getDate() ? 'current' : ''} ${day < 1 || day > daysInMonth ? 'outside' : ''}`}
                  key={index}
                >
                  <b>
                    {day < 1
                      ? new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate() + day
                      : day > daysInMonth
                        ? day - daysInMonth
                        : day}
                  </b>
                  {day > 0 &&
                    day <= daysInMonth &&
                    shownEvents
                      .filter((event) => {
                        const cellDate = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        return event.date ? event.date === cellDate : event.day === day;
                      })
                      .map((event) => (
                        <button
                          type="button"
                          className={`cal-event ${event.color}`}
                          onClick={() => handleSelect(event)}
                          key={event.id}
                        >
                          {event.time} · {event.title}
                        </button>
                      ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={`calendar-agenda ${view.toLowerCase()}`}>
            <div className="agenda-hours">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00'].map((hour) => (
                <div key={hour}>
                  <time>{hour}</time>
                  <span />
                </div>
              ))}
            </div>
            <div className="agenda-events">
              {shownEvents.slice(0, view === 'Día' ? 3 : 5).map((event, index) => (
                <button
                  type="button"
                  className={event.color}
                  style={{ top: `${18 + index * 46}px` }}
                  onClick={() => handleSelect(event)}
                  key={event.id}
                >
                  <strong>{event.time}</strong>
                  {event.title}
                  <small>{event.type}</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {selected && (
        <aside className="panel event-detail">
          <button type="button" className="ghost close-detail" onClick={() => setSelected(null)} aria-label="Cerrar">
            <Icon name="close" />
          </button>
          <span>DETALLE DE ACTIVIDAD</span>
          <div className={`event-detail-icon ${selected.color}`}>
            <Icon name="calendar" />
          </div>
          <h2>{selected.title}</h2>
          <p>
            {selected.type} programado para el día {selected.day} a las {selected.time}.
          </p>
          <label>
            Hora
            <input type="time" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} />
          </label>
          <button
            type="button"
            className="primary"
            onClick={() => {
              onUpdateEvent({ ...selected, time: draftTime || selected.time });
              setSelected(null);
            }}
          >
            Guardar cambios
          </button>
          <button
            type="button"
            className="delete-action"
            onClick={() => {
              onDeleteEvent(selected.id);
              setSelected(null);
            }}
          >
            <Icon name="trash" />
            Eliminar
          </button>
        </aside>
      )}
    </div>
  );
}
