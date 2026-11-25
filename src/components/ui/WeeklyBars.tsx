import type { WeekDayStat } from '../../types';

interface WeeklyBarsProps {
  days: WeekDayStat[];
  large?: boolean;
}

export function WeeklyBars({ days, large = false }: WeeklyBarsProps) {
  return (
    <div className={`bars ${large ? 'large' : ''}`}>
      {days.map((d) => (
        <div key={d.day}>
          <span>{d.value}%</span>
          <i>
            <em style={{ height: `${d.value}%` }} />
          </i>
          <strong>{d.day}</strong>
          <small className={d.today ? 'today' : ''}>{d.date}</small>
        </div>
      ))}
    </div>
  );
}
