import type { ReactNode } from 'react';

interface SettingRowProps {
  title: string;
  desc: string;
  children: ReactNode;
}

export function SettingRow({ title, desc, children }: SettingRowProps) {
  return (
    <div className="setting">
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      {children}
    </div>
  );
}
