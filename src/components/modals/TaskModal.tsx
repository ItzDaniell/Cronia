import { useState } from 'react';
import type {
  Project,
  RecurrenceFrequency,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
} from '../../types';
import type { CreateTaskDto, UpdateTaskDto } from '../../modules/tasks/application/dtos';
import {
  validateCreateTaskDto,
  validateUpdateTaskDto,
} from '../../modules/tasks/application/validators';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  toLocalDateKey,
} from '../../modules/tasks/domain/rules';
import { Icon } from '../ui/Icon';

interface TaskModalProps {
  projects: Project[];
  taskToEdit?: Task | null;
  initialStatus?: TaskStatus;
  onClose: () => void;
  onCreate: (dto: CreateTaskDto) => void;
  onUpdate?: (dto: UpdateTaskDto) => void;
}

const RECURRENCE_OPTIONS: RecurrenceFrequency[] = ['none', 'daily', 'weekly', 'monthly'];

export function TaskModal({
  projects,
  taskToEdit = null,
  initialStatus = 'Pending',
  onClose,
  onCreate,
  onUpdate,
}: TaskModalProps) {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState(taskToEdit?.title ?? '');
  const [description, setDescription] = useState(taskToEdit?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status ?? initialStatus);
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority ?? 'Medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(taskToEdit?.estimatedMinutes ?? 30);
  const [startDate, setStartDate] = useState<string>(taskToEdit?.startDate ?? toLocalDateKey());
  const [dueDate, setDueDate] = useState<string>(taskToEdit?.dueDate ?? toLocalDateKey());
  const [project, setProject] = useState(
    taskToEdit?.project ?? projects.find((p) => !p.archived)?.name ?? 'Sin proyecto',
  );
  const [category, setCategory] = useState(taskToEdit?.category ?? 'Desarrollo');
  const [tags, setTags] = useState<string[]>(taskToEdit?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(taskToEdit?.subtasks ?? []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    taskToEdit?.recurrence.frequency ?? 'none',
  );
  const [interval, setInterval] = useState<number>(taskToEdit?.recurrence.interval ?? 1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>(
    taskToEdit?.recurrence.endDate ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!clean || tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const addSubtask = () => {
    const clean = subtaskInput.trim();
    if (!clean) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length + 1}`, title: clean, completed: false },
    ]);
    setSubtaskInput('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)),
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const matchedProject = projects.find((p) => p.name === project);
    const baseDto: CreateTaskDto = {
      title,
      description,
      projectId: matchedProject?.id ?? null,
      project,
      startDate: startDate || null,
      dueDate: dueDate || null,
      priority,
      status,
      category,
      tags,
      subtasks,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      recurrence: {
        frequency,
        interval: Math.max(1, Number(interval) || 1),
        endDate: frequency !== 'none' && recurrenceEndDate ? recurrenceEndDate : null,
      },
      color: PRIORITY_COLORS[priority],
    };

    if (isEditing && taskToEdit && onUpdate) {
      const updateDto: UpdateTaskDto = { id: taskToEdit.id, ...baseDto };
      const validation = validateUpdateTaskDto(updateDto);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      setErrors({});
      onUpdate(updateDto);
      return;
    }

    const validation = validateCreateTaskDto(baseDto);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onCreate(baseDto);
  };

  return (
    <div className="modal-layer">
      <button type="button" className="modal-bg" onClick={onClose} aria-label="Cerrar modal" />
      <form className="modal task-modal" onSubmit={handleSubmit} noValidate>
        <header>
          <div>
            <span>{isEditing ? 'EDITAR TAREA' : 'NUEVA TAREA'}</span>
            <h2>{isEditing ? 'Actualizar actividad' : 'Crear actividad'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <label>
          Título *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Diseñar vista principal..."
            autoFocus
          />
          {errors.title && <small className="field-error">{errors.title}</small>}
        </label>

        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Añade detalles, contexto o criterios de aceptación..."
          />
          {errors.description && <small className="field-error">{errors.description}</small>}
        </label>

        <div className="form-row thirds">
          <label>
            Estado
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {TASK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridad
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tiempo estimado (min)
            <input
              type="number"
              min={0}
              max={10080}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
            {errors.estimatedMinutes && (
              <small className="field-error">{errors.estimatedMinutes}</small>
            )}
          </label>
        </div>

        <div className="form-row">
          <label>
            Fecha de inicio
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            {errors.startDate && <small className="field-error">{errors.startDate}</small>}
          </label>
          <label>
            Fecha de vencimiento
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {errors.dueDate && <small className="field-error">{errors.dueDate}</small>}
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
              <option value="Estudio">Estudio</option>
              <option value="General">General</option>
            </select>
          </label>
        </div>

        <div className="form-row thirds">
          <label>
            Recurrencia
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {RECURRENCE_LABELS[opt]}
                </option>
              ))}
            </select>
          </label>
          {frequency !== 'none' && (
            <>
              <label>
                Cada (intervalo)
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                />
              </label>
              <label>
                Finaliza el (opcional)
                <input
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                />
              </label>
            </>
          )}
        </div>
        {errors.recurrence && <small className="field-error">{errors.recurrence}</small>}

        <div className="modal-section">
          <span className="modal-section-label">Etiquetas</span>
          <div className="inline-input-row">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ej. backend, urgente, sprint (Enter para añadir)"
            />
            <button type="button" className="setting-action" onClick={addTag}>
              Añadir
            </button>
          </div>
          {tags.length > 0 && (
            <div className="tag-list">
              {tags.map((tag) => (
                <span className="tag-chip" key={tag}>
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Quitar etiqueta ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="modal-section">
          <span className="modal-section-label">Subtareas ({subtasks.length})</span>
          <div className="inline-input-row">
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              placeholder="Añadir paso o subtarea..."
            />
            <button type="button" className="setting-action" onClick={addSubtask}>
              Añadir
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="subtask-editor-list">
              {subtasks.map((st) => (
                <div className="subtask-editor-item" key={st.id}>
                  <button
                    type="button"
                    className={`task-check ${st.completed ? 'checked' : ''}`}
                    onClick={() => toggleSubtask(st.id)}
                    aria-label={`Marcar subtarea ${st.title}`}
                  >
                    {st.completed && <Icon name="check" size={11} />}
                  </button>
                  <span className={st.completed ? 'done' : ''}>{st.title}</span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removeSubtask(st.id)}
                    aria-label={`Eliminar subtarea ${st.title}`}
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.subtasks && <small className="field-error">{errors.subtasks}</small>}
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </footer>
      </form>
    </div>
  );
}
