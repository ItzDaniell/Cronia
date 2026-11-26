import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import type {
  Project,
  RecurrenceFrequency,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
} from '@/types';
import type { CreateTaskDto, UpdateTaskDto } from '@/modules/tasks/application/dtos';
import {
  validateCreateTaskDto,
  validateUpdateTaskDto,
} from '@/modules/tasks/application/validators';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  toLocalDateKey,
} from '@/modules/tasks/domain/rules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskModalProps {
  projects: Project[];
  taskToEdit?: Task | null;
  initialStatus?: TaskStatus;
  initialProject?: string;
  onClose: () => void;
  onCreate: (dto: CreateTaskDto) => void;
  onUpdate?: (dto: UpdateTaskDto) => void;
}

const RECURRENCE_OPTIONS: RecurrenceFrequency[] = ['none', 'daily', 'weekly', 'monthly'];
const CATEGORIES = ['Desarrollo', 'Trabajo', 'Personal', 'Estudio', 'General'];

export function TaskModal({
  projects,
  taskToEdit = null,
  initialStatus = 'Pending',
  initialProject,
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
    taskToEdit?.project ?? initialProject ?? projects.find((p) => !p.archived)?.name ?? 'Sin proyecto',
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

  const addSubtask = () => {
    const clean = subtaskInput.trim();
    if (!clean) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length + 1}`, title: clean, completed: false },
    ]);
    setSubtaskInput('');
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogDescription>{isEditing ? 'EDITAR TAREA' : 'NUEVA TAREA'}</DialogDescription>
          <DialogTitle>{isEditing ? 'Actualizar actividad' : 'Crear actividad'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Título *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Diseñar vista principal..."
              autoFocus
            />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Descripción</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles, contexto o criterios de aceptación..."
            />
            {errors.description && <small className="field-error">{errors.description}</small>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-est">Tiempo estimado (min)</Label>
              <Input
                id="task-est"
                type="number"
                min={0}
                max={10080}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              />
              {errors.estimatedMinutes && <small className="field-error">{errors.estimatedMinutes}</small>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha de inicio</Label>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Sin fecha de inicio" />
              {errors.startDate && <small className="field-error">{errors.startDate}</small>}
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de vencimiento</Label>
              <DatePicker value={dueDate} onChange={setDueDate} placeholder="Sin fecha de vencimiento" />
              {errors.dueDate && <small className="field-error">{errors.dueDate}</small>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Proyecto</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter((p) => !p.archived)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="Sin proyecto">Sin proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Recurrencia</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {RECURRENCE_LABELS[opt]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {frequency !== 'none' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="task-int">Cada (intervalo)</Label>
                  <Input
                    id="task-int"
                    type="number"
                    min={1}
                    max={365}
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Finaliza el (opcional)</Label>
                  <DatePicker
                    value={recurrenceEndDate}
                    onChange={setRecurrenceEndDate}
                    placeholder="Sin fecha fin"
                  />
                </div>
              </>
            )}
          </div>
          {errors.recurrence && <small className="field-error">{errors.recurrence}</small>}

          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
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
              <Button type="button" variant="outline" onClick={addTag}>
                Añadir
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge variant="default" key={tag} className="gap-1.5 py-1 px-2.5">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                      aria-label={`Quitar etiqueta ${tag}`}
                      className="hover:opacity-75"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Subtareas ({subtasks.length})</Label>
            <div className="flex gap-2">
              <Input
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
              <Button type="button" variant="outline" onClick={addSubtask}>
                Añadir
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    className="flex items-center gap-2.5 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[13px]"
                    key={st.id}
                  >
                    <Checkbox
                      checked={st.completed}
                      onCheckedChange={() =>
                        setSubtasks((prev) =>
                          prev.map((item) =>
                            item.id === st.id ? { ...item, completed: !item.completed } : item,
                          ),
                        )
                      }
                    />
                    <span className={st.completed ? 'flex-1 line-through text-[var(--muted)]' : 'flex-1'}>
                      {st.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSubtasks((prev) => prev.filter((item) => item.id !== st.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.subtasks && <small className="field-error">{errors.subtasks}</small>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Guardar cambios' : 'Crear tarea'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
