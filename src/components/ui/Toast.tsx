import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  const { tr } = useI18n();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-5 z-[60] flex max-w-[380px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 shadow-[0_14px_38px_-10px_rgba(0,0,0,0.45)]"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Check className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs font-bold text-[var(--text)]">{tr('Listo', 'Done')}</p>
            <p className="m-0 truncate text-[12.5px] text-[var(--muted)]">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Cerrar notificación', 'Close notification')}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
