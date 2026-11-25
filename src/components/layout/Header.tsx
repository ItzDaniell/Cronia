import type { RefObject } from 'react';
import type { IconName, ModuleName, ModuleNavItem, Project, Task } from '../../types';
import { STATUS_LABELS } from '../../modules/tasks/domain/rules';
import { Icon } from '../ui/Icon';

interface SearchResult {
  label: string;
  meta: string;
  module: ModuleName;
  icon: IconName;
}

interface HeaderProps {
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
  const q = query.trim().toLowerCase();
  const searchResults: SearchResult[] = q
    ? [
        ...modules
          .filter((item) => item.name.toLowerCase().includes(q))
          .map((item) => ({ label: item.name, meta: 'Módulo', module: item.name, icon: item.icon })),
        ...tasks
          .filter((task) =>
            `${task.title} ${task.project} ${task.category} ${task.tags.join(' ')}`.toLowerCase().includes(q),
          )
          .map((task) => ({
            label: task.title,
            meta: `${task.project} · ${STATUS_LABELS[task.status]}`,
            module: 'Tareas' as ModuleName,
            icon: 'check' as IconName,
          })),
        ...projects
          .filter((project) => `${project.name} ${project.desc}`.toLowerCase().includes(q))
          .map((project) => ({
            label: project.name,
            meta: `Proyecto · ${project.done}/${project.total}`,
            module: 'Proyectos' as ModuleName,
            icon: 'folder' as IconName,
          })),
      ].slice(0, 7)
    : [];

  return (
    <header>
      <button type="button" className="square mobile-menu" onClick={onOpenMenu} aria-label="Abrir menú">
        <Icon name="menu" />
      </button>

      <div className="search-wrap">
        <div className="search">
          <Icon name="search" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar tareas, proyectos o módulos..."
          />
          <kbd>Ctrl K</kbd>
          {query && (
            <button type="button" onClick={() => onQueryChange('')} aria-label="Limpiar búsqueda">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {query && (
          <div className="search-results">
            {searchResults.length ? (
              searchResults.map((result, index) => (
                <button
                  type="button"
                  key={`${result.label}-${index}`}
                  onClick={() => {
                    onOpenModule(result.module);
                    onQueryChange('');
                  }}
                >
                  <span>
                    <Icon name={result.icon} />
                  </span>
                  <div>
                    <strong>{result.label}</strong>
                    <small>{result.meta}</small>
                  </div>
                  <Icon name="arrow" size={14} />
                </button>
              ))
            ) : (
              <p>No se encontraron resultados para “{query}”</p>
            )}
          </div>
        )}
      </div>

      <div className="top-actions">
        <button type="button" className="square" onClick={onToggleTheme} aria-label="Cambiar tema">
          <Icon name={dark ? 'sun' : 'moon'} />
        </button>
        <button type="button" className="square bell" onClick={() => onOpenModule('Recordatorios')} aria-label="Recordatorios">
          <Icon name="bell" />
          <i />
        </button>
        <button type="button" className="primary" onClick={onOpenNewTask}>
          <Icon name="plus" size={16} />
          Nueva tarea
        </button>
      </div>
    </header>
  );
}
