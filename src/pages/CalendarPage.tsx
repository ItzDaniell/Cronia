import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import type { AccentTone, CalendarEvent, Task } from '@/types';
import { isTaskDeleted, toLocalDateKey } from '@/modules/tasks/domain/rules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventModal } from '@/components/modals/EventModal';

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
    <div className={`grid grid-cols-1 gap-5 ${selected ? 'xl:grid-cols-12' : ''}`}>
      <Card className={`overflow-hidden ${selected ? 'xl:col-span-9' : ''}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => move(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="m-0 min-w-[160px] text-center font-['Manrope'] text-base font-bold capitalize">
              {titleLabel}
            </h2>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => move(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate()))}
            >
              Hoy
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-[var(--surface-2)] p-1">
              {(['Mes', 'Semana', 'Día'] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setView(item)}
                  className={`h-7 rounded-md px-3 text-xs font-semibold transition-all ${
                    view === item
                      ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingEvent(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Evento
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--line)] bg-[var(--surface-2)]/50 px-5 py-2.5">
          <span className="mr-1 text-xs font-semibold text-[var(--muted)]">Mostrar:</span>
          {['Todos', 'Trabajo', 'Enfoque', 'Entrega', 'Tarea', 'Evento'].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              className={`h-7 rounded-full border px-3 text-xs font-medium transition-colors ${
                filter === item
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {view === 'Mes' ? (
          <>
            <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--surface-2)]/70 py-2 text-center text-[11px] font-bold text-[var(--muted)]">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, index) => {
                const isOutside = day < 1 || day > daysInMonth;
                const isToday = isCurrentMonth && day === today.getDate();
                const cellDate = !isOutside
                  ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : '';
                const dayItems = cellDate ? allItems.filter((item) => item.date === cellDate) : [];
                const displayDay =
                  day < 1
                    ? new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate() + day
                    : day > daysInMonth
                      ? day - daysInMonth
                      : day;

                return (
                  <div
                    key={index}
                    className={`flex min-h-[106px] flex-col gap-1 border-b border-r border-[var(--line)] p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                      isToday ? 'bg-[var(--accent-soft)]/30' : ''
                    } ${isOutside ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                        isToday ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)]'
                      }`}
                    >
                      {displayDay}
                    </span>
                    {dayItems.map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => handleItemClick(item)}
                        title={`${item.time} · ${item.title}`}
                        className={`w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-semibold text-white ${item.color}`}
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
          <div className="grid grid-cols-1 divide-y divide-[var(--line)] sm:grid-cols-7 sm:divide-x sm:divide-y-0">
            {weekDates.map((wd) => {
              const items = agendaItems.filter((it) => it.date === wd.key);
              return (
                <div
                  key={wd.key}
                  className={`flex min-h-[280px] flex-col gap-1.5 p-2.5 ${
                    wd.key === todayKey ? 'bg-[var(--accent-soft)]/30' : ''
                  }`}
                >
                  <span className="mb-1 text-xs font-bold capitalize text-[var(--text)]">{wd.label}</span>
                  {items.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleItemClick(item)}
                      className={`w-full truncate rounded-md px-2 py-1.5 text-left text-[11px] font-semibold text-white ${item.color}`}
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
          <div className="p-5">
            {agendaItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <CalendarIcon className="h-8 w-8 text-[var(--muted)]/60" />
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Sin actividades para este día</p>
                <p className="m-0 text-xs text-[var(--muted)]">
                  Pulsa “+ Evento” para programar una actividad en esta fecha.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {agendaItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-white ${item.color}`}
                  >
                    <strong className="text-sm">{item.time}</strong>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-bold">{item.title}</p>
                      <p className="m-0 text-xs opacity-85">
                        {item.source === 'task' ? 'Tarea con vencimiento' : item.type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {selected && (
        <Card className="relative flex flex-col gap-3 p-5 xl:col-span-3 h-fit">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8"
            onClick={() => setSelected(null)}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            DETALLE DE ACTIVIDAD
          </span>
          <div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${selected.color}`}>
            <CalendarIcon className="h-5 w-5" />
          </div>
          <h3 className="m-0 font-['Manrope'] text-lg font-bold">{selected.title}</h3>
          <p className="m-0 text-xs leading-relaxed text-[var(--muted)]">
            {selected.type} programado para el {selected.date || `día ${selected.day}`} a las {selected.time}.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setEditingEvent(selected);
                setModalOpen(true);
              }}
            >
              Editar evento
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                onDeleteEvent(selected.id);
                setSelected(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </Card>
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
