import type { RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Menu, Moon, Plus, Search, Sun, X } from 'lucide-react';
import type { IconName, ModuleName, ModuleNavItem, Project, Task } from '@/types';
import { useI18n } from '@/i18n';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchResult {
  label: string;
  meta: string;
  module: ModuleName;
  icon: IconName;
}

interface HeaderProps {
  active: ModuleName;
  query: string;
  onQueryChange: (q: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  modules: ModuleNavItem[];
  tasks: Task[];
  projects: Project[];
  dark: boolean;
  onToggleTheme: () => void;
  onOpenModule: (name: ModuleName) => void;
  onOpenMenu: () => void;
  onOpenNewTask: () => void;
}

export function Header({
  active,
  query,
  onQueryChange,
  searchRef,
  modules,
  tasks,
  projects,
  dark,
  onToggleTheme,
  onOpenModule,
  onOpenMenu,
  onOpenNewTask,
}: HeaderProps) {
  const { moduleLabel, statusLabel, tr } = useI18n();
  const q = query.trim().toLowerCase();
  const searchResults: SearchResult[] = q
    ? [
        ...modules
          .filter((item) => moduleLabel(item.name).toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
          .map((item) => ({
            label: moduleLabel(item.name),
            meta: tr('Módulo', 'Module'),
            module: item.name,
            icon: item.icon,
          })),
        ...tasks
          .filter((task) =>
            `${task.title} ${task.project} ${task.category} ${task.tags.join(' ')}`
              .toLowerCase()
              .includes(q),
          )
          .map((task) => ({
            label: task.title,
            meta: `${task.project} · ${statusLabel(task.status)}`,
            module: 'Tareas' as ModuleName,
            icon: 'check' as IconName,
          })),
        ...projects
          .filter((project) => `${project.name} ${project.desc}`.toLowerCase().includes(q))
          .map((project) => ({
            label: project.name,
            meta: tr('Proyecto', 'Project'),
            module: 'Proyectos' as ModuleName,
            icon: 'folder' as IconName,
          })),
      ].slice(0, 7)
    : [];

  return (
    <header className="sticky top-0 z-30 grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)]/85 px-5 backdrop-blur-md sm:grid-cols-[1fr_minmax(0,24rem)_1fr] lg:px-8">
      <div className="flex items-center gap-3 min-w-0 justify-self-start">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="h-8 w-8 lg:hidden shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="hidden items-center gap-1.5 text-xs sm:flex">
          <span className="font-medium text-[var(--muted)]">Cronia</span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]/60" />
          <span className="truncate font-semibold text-[var(--text)]">{moduleLabel(active)}</span>
        </div>
      </div>

      {/* Locked Centered Command Search */}
      <div className="relative w-full justify-self-center">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          ref={searchRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={tr('Buscar o ir a...', 'Search or jump to...')}
          className="h-8.5 rounded-lg bg-[var(--surface)] pl-8.5 pr-14 text-xs"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--muted)] hover:text-[var(--text)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="font-mono-num pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)] sm:inline-block">
            Ctrl K
          </kbd>
        )}

        <AnimatePresence>
          {query && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-2xl"
            >
              {searchResults.length ? (
                searchResults.map((result, index) => (
                  <button
                    type="button"
                    key={`${result.label}-${index}`}
                    onClick={() => {
                      onOpenModule(result.module);
                      onQueryChange('');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon name={result.icon} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-xs font-semibold text-[var(--text)]">{result.label}</p>
                      <p className="m-0 truncate text-[11px] text-[var(--muted)]">{result.meta}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" />
                  </button>
                ))
              ) : (
                <p className="m-0 py-4 text-center text-xs text-[var(--muted)]">
                  Sin resultados para “{query}”
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-self-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8.5 w-8.5"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button type="button" size="sm" onClick={onOpenNewTask} className="h-8.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{tr('Nueva tarea', 'New task')}</span>
        </Button>
      </div>
    </header>
  );
}
