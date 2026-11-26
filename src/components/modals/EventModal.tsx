import { useState } from 'react';
import type { AccentTone, CalendarEvent } from '@/types';
import { toLocalDateKey } from '@/modules/tasks/domain/rules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription>{isEditing ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}</DialogDescription>
          <DialogTitle>{isEditing ? 'Actualizar actividad' : 'Programar evento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Título *</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Reunión de revisión semanal"
              autoFocus
            />
            {error && <small className="field-error">{error}</small>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <DatePicker value={date} onChange={setDate} clearable={false} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <TimePicker value={time} onChange={setTime} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEvent['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="colors pt-1.5">
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
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Guardar cambios' : 'Crear evento'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
