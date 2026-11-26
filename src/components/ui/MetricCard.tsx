import { motion } from 'motion/react';
import type { AccentTone, IconName } from '@/types';
import { Icon } from '@/components/ui/Icon';

interface MetricCardProps {
  icon: IconName;
  tone: AccentTone;
  label: string;
  value: string | number;
  note: string;
}

export function MetricCard({ icon, tone, label, value, note }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]"
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-xs font-medium text-[var(--muted)]">{label}</p>
        <p className="font-mono-num my-1.5 text-2xl font-bold leading-none tracking-tight text-[var(--text)]">
          {value}
        </p>
        <p className="m-0 truncate text-[11.5px] text-[var(--muted)]">{note}</p>
      </div>
      <div className={`metric-icon ${tone}`}>
        <Icon name={icon} size={18} />
      </div>
    </motion.div>
  );
}
