import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // HH:MM
  onChange: (value: string) => void;
  className?: string;
}

const TIME_SLOTS: string[] = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0');
  const m = String((i % 4) * 15).padStart(2, '0');
  return `${h}:${m}`;
});

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const options = value && !TIME_SLOTS.includes(value) ? [value, ...TIME_SLOTS] : TIME_SLOTS;

  return (
    <Select value={value || '09:00'} onValueChange={onChange}>
      <SelectTrigger className={cn('h-9 w-full bg-[var(--surface-2)] text-[13px]', className)}>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
          <SelectValue placeholder="Hora" />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {options.map((slot) => (
          <SelectItem key={slot} value={slot}>
            {slot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
