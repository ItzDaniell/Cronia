import { useState } from 'react';
import type { AccentTone, Project } from '@/types';
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
import { DatePicker } from '@/components/ui/date-picker';

interface ProjectModalProps {
  projectToEdit?: Project | null;
  onClose: () => void;
  onSave: (draft: { id?: number; name: string; desc: string; color: AccentTone; date: string }) => void;
}

const COLORS: AccentTone[] = ['violet', 'blue', 'cyan', 'green', 'orange', 'red'];

export function ProjectModal({ projectToEdit = null, onClose, onSave }: ProjectModalProps) {
  const isEditing = Boolean(projectToEdit);
  const [name, setName] = useState(projectToEdit?.name ?? '');
  const [desc, setDesc] = useState(projectToEdit?.desc ?? '');
  const [color, setColor] = useState<AccentTone>(projectToEdit?.color ?? 'violet');
  const [date, setDate] = useState(
    projectToEdit?.date && projectToEdit.date !== 'Sin fecha' ? projectToEdit.date : '',
  );
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }
    setError('');
    onSave({
      id: projectToEdit?.id,
      name: cleanName,
      desc: desc.trim() || 'Sin descripción',
      color,
      date: date.trim() || 'Sin fecha',
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription>{isEditing ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}</DialogDescription>
          <DialogTitle>{isEditing ? 'Actualizar proyecto' : 'Crear proyecto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Nombre *</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Lanzamiento Cronia v1.0"
              autoFocus
            />
            {error && <small className="field-error">{error}</small>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Descripción</Label>
            <Textarea
              id="proj-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Objetivo principal y alcance del proyecto..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Fecha objetivo (opcional)</Label>
              <DatePicker
                value={/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : ''}
                onChange={setDate}
                placeholder="Sin fecha objetivo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="colors pt-1.5">
                {COLORS.map((tone) => (
                  <button
                    type="button"
                    key={tone}
                    className={tone}
                    onClick={() => setColor(tone)}
                    aria-label={`Color ${tone}`}
                    style={{
                      outline: color === tone ? '2px solid var(--text)' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Guardar cambios' : 'Crear proyecto'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
