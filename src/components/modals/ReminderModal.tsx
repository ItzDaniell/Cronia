import { useState } from 'react';
import type { Reminder } from '@/types';
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
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReminderModalProps {
  reminder: Reminder;
  isNew: boolean;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
}

const BEFORE_OPTIONS = [
  'A la hora',
  '5 minutos antes',
  '15 minutos antes',
  '30 minutos antes',
  '1 hora antes',
  '1 día antes',
];

export function ReminderModal({ reminder, isNew, onClose, onSave }: ReminderModalProps) {
  const [draft, setDraft] = useState<Reminder>(reminder);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription>{isNew ? 'NUEVO RECORDATORIO' : 'EDITAR RECORDATORIO'}</DialogDescription>
          <DialogTitle>{isNew ? 'Programar alerta' : 'Actualizar alerta'}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.title.trim()) return;
            onSave({ ...draft, title: draft.title.trim() });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="rem-title">Título *</Label>
            <Input
              id="rem-title"
              value={draft.title}
              required
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Ej. Llamada de seguimiento"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <DatePicker
                value={draft.date}
                onChange={(val) => setDraft({ ...draft, date: val })}
                clearable={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <TimePicker value={draft.time} onChange={(val) => setDraft({ ...draft, time: val })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Anticipación</Label>
            <Select
              value={draft.before}
              onValueChange={(value) => setDraft({ ...draft, before: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BEFORE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <div>
              <p className="m-0 text-[13px] font-semibold text-[var(--text)]">Recordatorio activo</p>
              <p className="m-0 text-xs text-[var(--muted)]">Permitir que Windows muestre esta alerta</p>
            </div>
            <Switch
              checked={draft.enabled}
              onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isNew ? 'Programar' : 'Guardar cambios'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
