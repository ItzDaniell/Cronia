import { Icon } from './Icon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;
  return (
    <div className="toast">
      <div>
        <Icon name="check" />
      </div>
      <span>
        <strong>Listo</strong>
        {message}
      </span>
      <button type="button" onClick={onClose} aria-label="Cerrar notificación">
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
