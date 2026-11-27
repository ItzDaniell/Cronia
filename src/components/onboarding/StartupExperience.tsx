import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Moon, Sparkles, Sun } from 'lucide-react';
import type { AccentTone, UserSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StartupExperienceProps {
  hydrated: boolean;
  settings: UserSettings;
  onPreviewSettings: (partial: Partial<UserSettings>) => void;
  onFinishOnboarding: (name: string) => void;
}

const ACCENT_OPTIONS: { tone: AccentTone; label: string }[] = [
  { tone: 'green', label: 'Esmeralda' },
  { tone: 'blue', label: 'Azul' },
  { tone: 'cyan', label: 'Cian' },
  { tone: 'orange', label: 'Ámbar' },
  { tone: 'red', label: 'Coral' },
];

export function StartupExperience({
  hydrated,
  settings,
  onPreviewSettings,
  onFinishOnboarding,
}: StartupExperienceProps) {
  const [stage, setStage] = useState<'splash' | 'onboarding' | 'done'>('splash');
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const needsOnboarding =
    !settings.userName.trim() || settings.userName.trim().toLowerCase() === 'usuario';

  useEffect(() => {
    if (stage === 'done') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [stage]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimePassed(true), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stage !== 'splash' || !hydrated || !minTimePassed) return;
    if (needsOnboarding) {
      setStage('onboarding');
    } else {
      setStage('done');
    }
  }, [stage, hydrated, minTimePassed, needsOnboarding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) {
      setError('Escribe tu nombre (mínimo 2 caracteres).');
      return;
    }
    setError('');
    onFinishOnboarding(clean);
    setStage('done');
  };

  return (
    <AnimatePresence>
      {stage !== 'done' && (
        <motion.div
          key="startup-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)] p-6"
        >
          {/* Subtle radial accent glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, var(--accent-soft), transparent 55%)',
            }}
          />

          <AnimatePresence mode="wait">
            {stage === 'splash' ? (
              <motion.div
                key="splash-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Animated Cronia Logo */}
                <motion.div
                  initial={{ scale: 0.78, opacity: 0, rotate: -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-20 w-20 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
                  style={{ boxShadow: '0 20px 50px -12px var(--accent)' }}
                >
                  <img
                    src="/cronia-logo.png"
                    alt="Cronia"
                    className="h-full w-full object-cover"
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="font-display m-0 mt-5 text-3xl font-extrabold tracking-tight text-[var(--text)]"
                >
                  Cronia
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42, duration: 0.4 }}
                  className="m-0 mt-1.5 text-sm text-[var(--muted)]"
                >
                  Tu espacio de productividad personal
                </motion.p>

                {/* Subtle progress bar */}
                <div className="mt-7 h-1 w-40 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full w-full rounded-full bg-[var(--accent)]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="onboarding-view"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-2xl"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
                      BIENVENIDO A CRONIA
                    </span>
                    <h2 className="font-display m-0 text-xl font-extrabold tracking-tight text-[var(--text)]">
                      Personaliza tu espacio
                    </h2>
                  </div>
                </div>

                <p className="m-0 mb-6 text-sm leading-relaxed text-[var(--muted)]">
                  Es tu primera vez aquí. Dinos tu nombre para saludarte en el Dashboard y personalizar tu experiencia.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboarding-name">¿Cómo te llamas? *</Label>
                    <Input
                      id="onboarding-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Ej. Daniel, Sofía, Alex..."
                      className="h-10 text-sm"
                      autoFocus
                    />
                    {error && <small className="field-error">{error}</small>}
                  </div>

                  <div className="grid grid-cols-1 gap-5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider">Tema</Label>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant={settings.dark ? 'default' : 'outline'}
                          className="h-8 flex-1 text-xs"
                          onClick={() => onPreviewSettings({ dark: true })}
                        >
                          <Moon className="h-3.5 w-3.5" />
                          Oscuro
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={!settings.dark ? 'default' : 'outline'}
                          className="h-8 flex-1 text-xs"
                          onClick={() => onPreviewSettings({ dark: false })}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          Claro
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider">Acento</Label>
                      <div className="colors pt-1">
                        {ACCENT_OPTIONS.map(({ tone, label }) => (
                          <button
                            type="button"
                            key={tone}
                            className={tone}
                            title={label}
                            aria-label={label}
                            onClick={() => onPreviewSettings({ accent: tone })}
                            style={{
                              outline: settings.accent === tone ? '2px solid var(--text)' : 'none',
                              outlineOffset: 2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Comenzar en Cronia
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
