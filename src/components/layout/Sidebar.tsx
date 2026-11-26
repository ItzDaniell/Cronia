import { motion } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen, Timer, X } from 'lucide-react';
import type { ModuleName, ModuleNavItem } from '@/types';
import { useI18n } from '@/i18n';
import { Icon } from '@/components/ui/Icon';

interface SidebarProps {
  modules: ModuleNavItem[];
  active: ModuleName;
  menuOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (name: ModuleName) => void;
  onCloseMenu: () => void;
  completedCount: number;
  totalCount: number;
  activeRemindersCount: number;
  userName: string;
  timerRunning?: boolean;
  timerLabel?: string;
}

export function Sidebar({
  modules,
  active,
  menuOpen,
  collapsed,
  onToggleCollapse,
  onSelect,
  onCloseMenu,
  completedCount,
  totalCount,
  activeRemindersCount,
  userName,
  timerRunning = false,
  timerLabel = '25:00',
}: SidebarProps) {
  const { moduleLabel, groupLabel, tr } = useI18n();
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CR';

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--line)] bg-[var(--sidebar)] text-[var(--text)] transition-all duration-250 lg:translate-x-0 ${
          collapsed ? 'w-[72px] px-2.5' : 'w-[240px] px-3'
        } py-4 ${menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        {/* Brand header */}
        <div className={`flex h-10 items-center ${collapsed ? 'justify-center' : 'justify-between px-1.5'}`}>
          <button
            type="button"
            onClick={() => onSelect('Dashboard')}
            className="flex items-center gap-2.5 bg-transparent border-0 p-0 text-left"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" />
              </svg>
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <strong className="font-display text-[15px] font-extrabold tracking-tight text-[var(--text)]">
                  Cronia
                </strong>
                <span className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">Workspace</span>
              </div>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Contraer barra lateral"
              className="hidden h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] lg:grid"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onCloseMenu}
            aria-label="Cerrar menú"
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expandir barra lateral"
            className="mx-auto mt-2 hidden h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] lg:grid"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {modules.map((item) => {
            const badge = item.name === 'Recordatorios' ? activeRemindersCount : item.badge;
            const isActive = active === item.name;
            return (
              <div key={item.name}>
                {item.group && !collapsed && (
                  <p className="mb-1.5 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]/80 first:mt-0">
                    {groupLabel(item.group)}
                  </p>
                )}
                {item.group && collapsed && <div className="my-2.5 h-px bg-[var(--line)] first:hidden" />}
                <button
                  type="button"
                  title={collapsed ? moduleLabel(item.name) : undefined}
                  onClick={() => onSelect(item.name)}
                  className={`group relative flex h-9 w-full items-center rounded-lg transition-colors ${
                    collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
                  } ${
                    isActive
                      ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--text)]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="cronia-nav-bar"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[var(--accent)]"
                    />
                  )}
                  <span className={isActive ? 'text-[var(--accent)]' : ''}>
                    <Icon name={item.icon} size={17} />
                  </span>
                  {!collapsed && <span className="truncate text-[13.5px]">{moduleLabel(item.name)}</span>}
                  {!collapsed && badge ? (
                    <span className="font-mono-num ml-auto rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                      {badge}
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Live focus pill if running */}
        {timerRunning && (
          <button
            type="button"
            onClick={() => onSelect('Enfoque')}
            className={`mb-2.5 flex items-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:brightness-110 ${
              collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
            }`}
          >
            <Timer className="h-4 w-4 shrink-0 animate-pulse" />
            {!collapsed && (
              <span className="font-mono-num text-xs font-bold">Enfoque · {timerLabel}</span>
            )}
          </button>
        )}

        {/* Footer progress + user */}
        <div className="mt-2 space-y-2.5 border-t border-[var(--line)] pt-3">
          {!collapsed && (
            <div className="rounded-lg bg-[var(--surface-2)]/70 px-3 py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">{tr('Progreso', 'Progress')}</span>
                <span className="font-mono-num font-bold text-[var(--text)]">{progress}%</span>
              </div>
              <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <p className="m-0 text-[11px] text-[var(--muted)]">
                {completedCount}/{totalCount} {tr('tareas listas', 'tasks done')}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelect('Configuración')}
            title={collapsed ? userName : undefined}
            className={`flex w-full items-center rounded-lg p-1.5 text-left transition-colors hover:bg-[var(--surface-2)] ${
              collapsed ? 'justify-center' : 'gap-2.5'
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
              {initials}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <p className="m-0 truncate text-[13px] font-semibold text-[var(--text)]">{userName}</p>
                <p className="m-0 text-[11px] text-[var(--muted)]">{tr('Espacio personal', 'Personal space')}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMenu}
          aria-label="Cerrar menú"
        />
      )}
    </>
  );
}
