import { useState } from 'react';
import type { ModuleName, Project } from '../types';
import { Icon } from '../components/ui/Icon';

interface ProjectsPageProps {
  projects: Project[];
  userInitials: string;
  onCreateProject: (name: string, desc: string) => void;
  onToggleArchive: (id: number) => void;
  onNavigate: (module: ModuleName) => void;
}

export function ProjectsPage({
  projects,
  userInitials,
  onCreateProject,
  onToggleArchive,
  onNavigate,
}: ProjectsPageProps) {
  const [tab, setTab] = useState<'Activos' | 'Archivados'>('Activos');
  const visible = projects.filter((project) => project.archived === (tab === 'Archivados'));

  const handleCreate = () => {
    onCreateProject(`Nuevo proyecto ${projects.length + 1}`, 'Objetivo creado recientemente');
    setTab('Activos');
  };

  return (
    <>
      <div className="project-tools">
        <div className="tabs">
          <button type="button" className={tab === 'Activos' ? 'active' : ''} onClick={() => setTab('Activos')}>
            Activos <span>{projects.filter((p) => !p.archived).length}</span>
          </button>
          <button type="button" className={tab === 'Archivados' ? 'active' : ''} onClick={() => setTab('Archivados')}>
            Archivados <span>{projects.filter((p) => p.archived).length}</span>
          </button>
        </div>
        <button type="button" className="primary" onClick={handleCreate}>
          <Icon name="plus" />
          Nuevo proyecto
        </button>
      </div>

      <div className="project-grid">
        {visible.map((project) => {
          const pct = project.total > 0 ? Math.round((project.done / project.total) * 100) : 0;
          return (
            <article className="project-card" key={project.id}>
              <div className="project-top">
                <div className={`project-symbol ${project.color}`}>
                  <Icon name="folder" />
                </div>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onToggleArchive(project.id)}
                  aria-label={project.archived ? 'Restaurar proyecto' : 'Archivar proyecto'}
                >
                  <Icon name={project.archived ? 'repeat' : 'more'} />
                </button>
              </div>
              <h2>{project.name}</h2>
              <p>{project.desc}</p>
              <div className="project-meta">
                <span>
                  {project.done} de {project.total} tareas
                </span>
                <b>{pct}%</b>
              </div>
              <div className="progress">
                <i style={{ width: `${pct}%` }} />
              </div>
              <footer>
                <span className="mini-avatar">{userInitials}</span>
                <time>
                  <Icon name="calendar" size={13} />
                  {project.date}
                </time>
                <button type="button" onClick={() => onNavigate('Tareas')} aria-label={`Abrir tareas de ${project.name}`}>
                  <Icon name="arrow" />
                </button>
              </footer>
            </article>
          );
        })}

        {tab === 'Activos' && (
          <button type="button" className="new-project" onClick={handleCreate}>
            <div>
              <Icon name="plus" />
            </div>
            <strong>Crear proyecto</strong>
            <span>Organiza un nuevo objetivo</span>
          </button>
        )}
      </div>
    </>
  );
}
