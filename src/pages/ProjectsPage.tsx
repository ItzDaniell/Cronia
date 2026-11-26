import { useState } from 'react';
import { motion } from 'motion/react';
import { Archive, ArrowRight, Calendar, Folder, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { AccentTone, ModuleName, Project, Task } from '@/types';
import { isTaskCompleted, isTaskDeleted } from '@/modules/tasks/domain/rules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectModal } from '@/components/modals/ProjectModal';

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
          {(['Activos', 'Archivados'] as const).map((item) => {
            const count = projects.filter((p) => p.archived === (item === 'Archivados')).length;
            const active = tab === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => setTab(item)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {item}
                <span className="text-xs opacity-80">{count}</span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((project, idx) => {
          const { done, total, pct } = getCounts(project);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.15) }}
            >
              <Card className="flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50">
                <div className="flex items-center justify-between">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${project.color}`}>
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditing(project);
                        setModalOpen(true);
                      }}
                      title="Editar proyecto"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleArchive(project.id)}
                      title={project.archived ? 'Restaurar proyecto' : 'Archivar proyecto'}
                    >
                      {project.archived ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-rose-500"
                      onClick={() => onDeleteProject(project.id)}
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <h3 className="mb-1 mt-4 font-['Manrope'] text-lg font-bold text-[var(--text)]">
                  {project.name}
                </h3>
                <p className="m-0 mb-5 flex-1 text-xs leading-relaxed text-[var(--muted)]">
                  {project.desc}
                </p>

                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>
                    {done} de {total} tareas
                  </span>
                  <strong className="text-[var(--text)]">{pct}%</strong>
                </div>
                <div className="my-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <footer className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-200 text-[11px] font-extrabold text-amber-950">
                    {userInitials}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Calendar className="h-3.5 w-3.5" />
                    {project.date}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onNavigate('Tareas')}
                    aria-label={`Abrir tareas de ${project.name}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </footer>
              </Card>
            </motion.div>
          );
        })}

        {tab === 'Activos' && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--line)] bg-transparent p-6 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Plus className="h-5 w-5" />
            </div>
            <strong className="text-sm text-[var(--text)]">Crear proyecto</strong>
            <span className="text-xs text-[var(--muted)]">Organiza un nuevo objetivo</span>
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
    </div>
  );
}
