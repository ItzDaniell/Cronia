import type { AccentTone, IconName } from '../../types';
import { Icon } from './Icon';

interface MetricCardProps {
  icon: IconName;
  tone: AccentTone;
  label: string;
  value: string | number;
  note: string;
}

export function MetricCard({ icon, tone, label, value, note }: MetricCardProps) {
  return (
    <article className="metric">
      <div className={`metric-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <Icon name="arrow" size={14} />
    </article>
  );
}
