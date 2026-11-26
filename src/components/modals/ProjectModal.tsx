import { useState } from 'react';
import type { AccentTone, Project } from '../../types';
import { Icon } from '../ui/Icon';

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
  const [date, setDate] = useState(projectToEdit?.date && projectToEdit.date !== 'Sin fecha' ? projectToEdit.date : '');
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
    <div className="modal-layer">
      <button type="button" className="modal-bg" onClick={onClose} aria-label="Cerrar modal" />
      <form className="modal" onSubmit={handleSubmit} noValidate>
        <header>
          <div>
            <span>{isEditing ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}</span>
            <h2>{isEditing ? 'Actualizar proyecto' : 'Crear proyecto'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <label>
          Nombre *
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Lanzamiento Cronia v1.0"
            autoFocus
          />
          {error && <small className="field-error">{error}</small>}
        </label>

        <label>
          Descripción
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Objetivo principal y alcance del proyecto..."
          />
        </label>

        <div className="form-row">
          <label>
            Fecha objetivo (opcional)
            <input type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : ''} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Color
            <div className="colors" style={{ paddingTop: 6 }}>
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
          </label>
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
        </footer>
      </form>
    </div>
  );
}
