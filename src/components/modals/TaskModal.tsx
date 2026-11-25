import { useState } from 'react';
import type { AccentTone, Priority, Project, Task, TaskStatus } from '../../types';
import { Icon } from '../ui/Icon';

interface TaskModalProps {
  projects: Project[];
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id'>) => void;
}

const PRIORITY_COLORS: Record<Priority, AccentTone> = {
  Urgente: 'red',
  Alta: 'violet',
  Media: 'blue',
  Baja: 'green',
};

export function TaskModal({ projects, onClose, onCreate }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pendiente');
  const [priority, setPriority] = useState<Priority>('Media');
  const [estimate, setEstimate] = useState('30 min');
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState('Hoy, 18:00');
  const [project, setProject] = useState(projects.find((p) => !p.archived)?.name ?? 'Sin proyecto');
  const [category, setCategory] = useState('Desarrollo');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || 'Sin descripción',
      project,
      due: due.trim() || 'Sin fecha',
      start,
      priority,
      status,
      category,
      estimate,
      subtasks: '0/0',
      done: status === 'Completada',
      color: PRIORITY_COLORS[priority],
    });
  };

  return (
    <div className="modal-layer">
      <button type="button" className="modal-bg" onClick={onClose} aria-label="Cerrar modal" />
      <form className="modal task-modal" onSubmit={handleSubmit}>
        <header>
          <div>
            <span>NUEVA TAREA</span>
            <h2>Crear actividad</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <label>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Diseñar vista principal..."
            required
            autoFocus
          />
        </label>

        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Añade detalles adicionales..."
          />
        </label>

        <div className="form-row thirds">
          <label>
            Estado
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </label>
          <label>
            Prioridad
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>
          <label>
            Tiempo estimado
            <select value={estimate} onChange={(e) => setEstimate(e.target.value)}>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="1 h">1 hora</option>
              <option value="2 h">2 horas</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Fecha de inicio
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            Vencimiento
            <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Ej. Hoy, 18:00" />
          </label>
        </div>

        <div className="form-row">
          <label>
            Proyecto
            <select value={project} onChange={(e) => setProject(e.target.value)}>
              {projects
                .filter((p) => !p.archived)
                .map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              <option value="Sin proyecto">Sin proyecto</option>
            </select>
          </label>
          <label>
            Categoría
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Desarrollo">Desarrollo</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Personal">Personal</option>
              <option value="General">General</option>
            </select>
          </label>
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            Crear tarea
          </button>
        </footer>
      </form>
    </div>
  );
}
