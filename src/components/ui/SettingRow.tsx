import type { ReactNode } from 'react';

interface SettingRowProps {
  title: string;
  desc: string;
  children: ReactNode;
}

export function SettingRow({ title, desc, children }: SettingRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold text-[var(--text)]">{title}</p>
        <p className="m-0 mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
