import { useMemo, useState } from 'react';
import type { AccentTone, CalendarEvent, Task } from '../types';
import { isTaskDeleted, toLocalDateKey } from '../modules/tasks/domain/rules';
import { Icon } from '../components/ui/Icon';
import { EventModal } from '../components/modals/EventModal';

interface CalendarPageProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: number) => void;
  onEditTask?: (task: Task) => void;
}

interface CalendarDisplayItem {
  key: string;
  title: string;
  date: string;
  time: string;
  type: CalendarEvent['type'];
  color: AccentTone;
  source: 'event' | 'task';
  event?: CalendarEvent;
  task?: Task;
}

function getMondayOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

export function CalendarPage({
  events,
  tasks,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onEditTask,
}: CalendarPageProps) {
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [view, setView] = useState<'Mes' | 'Semana' | 'Día'>('Mes');
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const allItems = useMemo<CalendarDisplayItem[]>(() => {
    const eventItems: CalendarDisplayItem[] = events.map((ev) => ({
      key: `ev-${ev.id}`,
      title: ev.title,
      date:
        ev.date ||
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(ev.day).padStart(2, '0')}`,
      time: ev.time,
      type: ev.type,
      color: ev.color,
      source: 'event',
      event: ev,
    }));

    const taskItems: CalendarDisplayItem[] = tasks
      .filter((t) => !isTaskDeleted(t) && Boolean(t.dueDate))
      .map((t) => ({
        key: `task-${t.id}`,
        title: t.title,
        date: t.dueDate!,
        time: 'Todo el día',
        type: 'Tarea',
        color: t.color,
        source: 'task',
        task: t,
      }));

    return [...eventItems, ...taskItems].filter((item) => filter === 'Todos' || item.type === filter);
  }, [events, tasks, filter, cursor]);

  const move = (amount: number) => {
    if (view === 'Mes') {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1));
    } else if (view === 'Semana') {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + amount * 7));
    } else {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + amount));
    }
  };

  const titleLabel =
    view === 'Mes'
      ? new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(cursor)
      : view === 'Día'
        ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(cursor)
        : (() => {
            const start = getMondayOfWeek(cursor);
            const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
            const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });
            return `${fmt.format(start)} – ${fmt.format(end)}`;
          })();

  const firstDay = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => index - firstDay + 1);
  const isCurrentMonth =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  const weekDates = useMemo(() => {
    const start = getMondayOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return {
        date: d,
        key: toLocalDateKey(d),
        label: new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' }).format(d),
      };
    });
  }, [cursor]);

  const cursorKey = toLocalDateKey(cursor);
  const agendaItems =
    view === 'Día'
      ? allItems.filter((item) => item.date === cursorKey)
      : allItems.filter((item) => weekDates.some((wd) => wd.key === item.date));

  const handleItemClick = (item: CalendarDisplayItem) => {
    if (item.source === 'event' && item.event) {
      setSelected(item.event);
    } else if (item.source === 'task' && item.task && onEditTask) {
      onEditTask(item.task);
    }
  };

  return (
    <div className="calendar-layout">
      <section className="panel calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <button type="button" onClick={() => move(-1)} aria-label="Anterior">
              <Icon name="arrow" />
            </button>
            <h2 style={{ textTransform: 'capitalize' }}>{titleLabel}</h2>
            <button type="button" className="right" onClick={() => move(1)} aria-label="Siguiente">
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="today-btn"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate()))}
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
          {['Todos', 'Trabajo', 'Enfoque', 'Entrega', 'Tarea', 'Evento'].map((item) => (
            <button type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>
              {item}
            </button>
          ))}
          <button
            type="button"
            className="calendar-add"
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
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
              {cells.map((day, index) => {
                const cellDate =
                  day > 0 && day <= daysInMonth
                    ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : '';
                const dayItems = cellDate ? allItems.filter((item) => item.date === cellDate) : [];

                return (
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
                    {dayItems.map((item) => (
                      <button
                        type="button"
                        className={`cal-event ${item.color}`}
                        onClick={() => handleItemClick(item)}
                        key={item.key}
                        title={`${item.time} · ${item.title}`}
                      >
                        {item.source === 'task' ? '✓ ' : `${item.time} · `}
                        {item.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        ) : view === 'Semana' ? (
          <div className="calendar-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDates.map((wd) => {
              const items = agendaItems.filter((it) => it.date === wd.key);
              return (
                <div key={wd.key} className={wd.key === todayKey ? 'current' : ''} style={{ minHeight: 280 }}>
                  <b style={{ width: 'auto', padding: '0 6px', borderRadius: 6, textTransform: 'capitalize' }}>
                    {wd.label}
                  </b>
                  {items.map((item) => (
                    <button
                      type="button"
                      className={`cal-event ${item.color}`}
                      onClick={() => handleItemClick(item)}
                      key={item.key}
                    >
                      {item.source === 'task' ? '✓ ' : `${item.time} · `}
                      {item.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="calendar-agenda día">
            <div className="agenda-hours">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00'].map((hour) => (
                <div key={hour}>
                  <time>{hour}</time>
                  <span />
                </div>
              ))}
            </div>
            <div className="agenda-events">
              {agendaItems.length === 0 ? (
                <div className="empty-state" style={{ paddingTop: 60 }}>
                  <strong>Sin actividades para este día</strong>
                  <span>Pulsa “+ Evento” para programar una actividad.</span>
                </div>
              ) : (
                agendaItems.map((item, index) => (
                  <button
                    type="button"
                    className={item.color}
                    style={{ top: `${18 + index * 52}px` }}
                    onClick={() => handleItemClick(item)}
                    key={item.key}
                  >
                    <strong>{item.time}</strong>
                    {item.title}
                    <small>{item.source === 'task' ? 'Tarea con vencimiento' : item.type}</small>
                  </button>
                ))
              )}
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
            {selected.type} programado para el {selected.date || `día ${selected.day}`} a las {selected.time}.
          </p>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setEditingEvent(selected);
              setModalOpen(true);
            }}
          >
            Editar evento
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

      {modalOpen && (
        <EventModal
          eventToEdit={editingEvent}
          defaultDate={cursorKey}
          onClose={() => {
            setModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={(draft) => {
            if (draft.id) {
              const updated: CalendarEvent = {
                id: draft.id,
                day: draft.day,
                date: draft.date,
                title: draft.title,
                type: draft.type,
                color: draft.color,
                time: draft.time,
              };
              onUpdateEvent(updated);
              setSelected(updated);
            } else {
              onAddEvent({
                day: draft.day,
                date: draft.date,
                title: draft.title,
                type: draft.type,
                color: draft.color,
                time: draft.time,
              });
            }
            setModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}
