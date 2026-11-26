import { useState } from 'react';
import type { AccentTone, ModuleName, Project, Task } from '../types';
import { isTaskCompleted, isTaskDeleted } from '../modules/tasks/domain/rules';
import { Icon } from '../components/ui/Icon';
import { ProjectModal } from '../components/modals/ProjectModal';

interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
  userInitials: string;
  onSaveProject: (draft: { id?: number; name: string; desc: string; color: AccentTone; date: string }) => void;
  onToggleArchive: (id: number) => void;
  onDeleteProject: (id: number) => void;
  onNavigate: (module: ModuleName) => void;
}

export function ProjectsPage({
  projects,
  tasks,
  userInitials,
  onSaveProject,
  onToggleArchive,
  onDeleteProject,
  onNavigate,
}: ProjectsPageProps) {
  const [tab, setTab] = useState<'Activos' | 'Archivados'>('Activos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const activeTasks = tasks.filter((t) => !isTaskDeleted(t));
  const visible = projects.filter((project) => project.archived === (tab === 'Archivados'));

  const getCounts = (project: Project) => {
    const linked = activeTasks.filter(
      (t) => t.projectId === project.id || (t.projectId === null && t.project === project.name),
    );
    const total = linked.length;
    const done = linked.filter((t) => isTaskCompleted(t)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setModalOpen(true);
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
        <button type="button" className="primary" onClick={openCreate}>
          <Icon name="plus" />
          Nuevo proyecto
        </button>
      </div>

      <div className="project-grid">
        {visible.map((project) => {
          const { done, total, pct } = getCounts(project);
          return (
            <article className="project-card" key={project.id}>
              <div className="project-top">
                <div className={`project-symbol ${project.color}`}>
                  <Icon name="folder" />
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => openEdit(project)}
                    aria-label={`Editar ${project.name}`}
                    title="Editar proyecto"
                  >
                    <Icon name="settings" size={14} />
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onToggleArchive(project.id)}
                    aria-label={project.archived ? 'Restaurar proyecto' : 'Archivar proyecto'}
                    title={project.archived ? 'Restaurar proyecto' : 'Archivar proyecto'}
                  >
                    <Icon name={project.archived ? 'repeat' : 'more'} size={14} />
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onDeleteProject(project.id)}
                    aria-label={`Eliminar ${project.name}`}
                    title="Eliminar proyecto"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <h2>{project.name}</h2>
              <p>{project.desc}</p>
              <div className="project-meta">
                <span>
                  {done} de {total} tareas
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
          <button type="button" className="new-project" onClick={openCreate}>
            <div>
              <Icon name="plus" />
            </div>
            <strong>Crear proyecto</strong>
            <span>Organiza un nuevo objetivo</span>
          </button>
        )}
      </div>

      {modalOpen && (
        <ProjectModal
          projectToEdit={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={(draft) => {
            onSaveProject(draft);
            setModalOpen(false);
            setEditing(null);
            if (!draft.id) setTab('Activos');
          }}
        />
      )}
    </>
  );
}
