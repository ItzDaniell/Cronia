import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}

function parseIsoDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  clearable = true,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);

  const label = selected
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(selected)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-9 w-full justify-between bg-[var(--surface-2)] px-3 font-normal text-[13px]',
            !selected && 'text-[var(--muted)]',
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          {clearable && selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpiar fecha"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className="rounded p-0.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 cronia-daypicker" align="start">
        <DayPicker
          mode="single"
          locale={es}
          selected={selected}
          onSelect={(day) => {
            onChange(day ? formatIsoDate(day) : '');
            setOpen(false);
          }}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
