import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Download,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Timer,
  Volume2,
  Zap,
} from 'lucide-react';
import type { FocusSession, Task } from '@/types';
import { downloadJson } from '@/utils/exportData';
import { ALERT_TONE_LABELS, playAlertTone, type AlertTone } from '@/utils/sound';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FocusPageProps {
  tasks: Task[];
  sessions: FocusSession[];
  seconds: number;
  running: boolean;
  selectedTask: string;
  alertTone: AlertTone;
  onSelectTask: (title: string) => void;
  onChangeAlertTone: (tone: AlertTone) => void;
  onSetSeconds: (seconds: number) => void;
  onSetRunning: (running: boolean) => void;
  onSyncFocusConfig: (durationMinutes: number, countsAsWork: boolean) => void;
  onCompleteSession: (taskTitle: string, durationMinutes: number) => void;
  onNotify: (message: string) => void;
}

type FocusPhase = 'Enfoque' | 'Descanso corto' | 'Descanso largo' | 'Personalizado';

const CUSTOM_TIME_KEY = 'cronia.focus.customMinutes';
const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function readCustomMinutes(): number {
  try {
    const raw = Number(window.localStorage.getItem(CUSTOM_TIME_KEY));
    return Number.isFinite(raw) && raw >= 1 && raw <= 180 ? Math.round(raw) : 45;
  } catch {
    return 45;
  }
}

export function FocusPage({
  tasks,
  sessions,
  seconds,
  running,
  selectedTask,
  alertTone,
  onSelectTask,
  onChangeAlertTone,
  onSetSeconds,
  onSetRunning,
  onSyncFocusConfig,
  onCompleteSession,
  onNotify,
}: FocusPageProps) {
  const [phase, setPhase] = useState<FocusPhase>('Enfoque');
  const [customMinutes, setCustomMinutes] = useState<number>(readCustomMinutes);
  const [draftCustom, setDraftCustom] = useState<string>(String(customMinutes));
  const [editOpen, setEditOpen] = useState(false);

  const durations: Record<FocusPhase, number> = {
    Enfoque: 25,
    'Descanso corto': 5,
    'Descanso largo': 15,
    Personalizado: customMinutes,
  };
  const duration = durations[phase];
  const countsAsWork = phase === 'Enfoque' || phase === 'Personalizado';

  useEffect(() => {
    onSyncFocusConfig(duration, countsAsWork);
  }, [duration, countsAsWork, onSyncFocusConfig]);

  const choosePhase = (next: FocusPhase) => {
    setPhase(next);
    onSetRunning(false);
    onSetSeconds(durations[next] * 60);
  };

  const handleSaveCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(1, Math.min(180, Math.round(Number(draftCustom) || 1)));
    setCustomMinutes(clamped);
    setDraftCustom(String(clamped));
    try {
      window.localStorage.setItem(CUSTOM_TIME_KEY, String(clamped));
    } catch {
      // Ignore storage errors
    }
    setPhase('Personalizado');
    onSetRunning(false);
    onSetSeconds(clamped * 60);
    setEditOpen(false);
    onNotify(`Tiempo personalizado guardado (${clamped} min)`);
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = Math.max(0, Math.min(1, 1 - seconds / (duration * 60)));
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const remMins = totalMinutes % 60;
  const formattedTotal = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;
  const dailyGoalPct = Math.min(100, Math.round((totalMinutes / 120) * 100));

  const todayLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Zen Precision Studio Timer */}
      <Card className="flex flex-col justify-between gap-7 p-6 sm:p-8 xl:col-span-8">
        {/* Top status row + centered phase switcher */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  running ? 'bg-[var(--accent)] animate-pulse' : 'bg-[var(--muted)]/50'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {running ? 'Sesión en curso' : 'Zen Studio · Listo'}
              </span>
            </div>

            <Popover
              open={editOpen}
              onOpenChange={(open) => {
                setEditOpen(open);
                if (open) setDraftCustom(String(customMinutes));
              }}
            >
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Tiempo personalizado
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-4">
                <form onSubmit={handleSaveCustomTime} className="space-y-3">
                  <div>
                    <p className="m-0 text-sm font-bold text-[var(--text)]">Tiempo personalizado</p>
                    <p className="m-0 text-xs text-[var(--muted)]">
                      Define tu duración favorita (1–180 min)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={draftCustom}
                      onChange={(e) => setDraftCustom(e.target.value)}
                      className="h-9 text-center font-mono-num"
                      autoFocus
                    />
                    <span className="text-xs font-medium text-[var(--muted)]">min</span>
                  </div>
                  <Button type="submit" size="sm" className="w-full">
                    Guardar tiempo
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-1">
            {(Object.keys(durations) as FocusPhase[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => choosePhase(item)}
                className={`inline-flex h-8.5 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-all ${
                  phase === item
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {item}
                <span className="font-mono-num text-[11px] opacity-75">{durations[item]}m</span>
              </button>
            ))}
          </div>
        </div>

        {/* Precision SVG Ring Timer */}
        <div className="flex flex-col items-center gap-6 py-2">
          <div className="relative grid h-64 w-64 place-items-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
                {phase}
              </span>
              <span className="font-mono-num my-1 text-5xl font-bold tracking-tight text-[var(--text)]">
                {minutes}:{secs}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {running ? 'Mantén el enfoque' : 'Pulsa iniciar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => {
                onSetRunning(false);
                onSetSeconds(duration * 60);
              }}
              aria-label="Reiniciar sesión"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="lg"
              className="h-11 min-w-[175px] rounded-xl text-sm"
              onClick={() => onSetRunning(!running)}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? 'Pausar' : 'Iniciar enfoque'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => {
                onSetRunning(false);
                onCompleteSession(selectedTask, duration);
                onSetSeconds(duration * 60);
              }}
              aria-label="Completar y guardar sesión"
              title="Completar y guardar sesión"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Controls & Task Dock */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-4">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="flex h-4 items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Volume2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                Tono de alerta
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={alertTone}
                  onValueChange={(val) => {
                    const next = val as AlertTone;
                    onChangeAlertTone(next);
                    playAlertTone(next);
                  }}
                >
                  <SelectTrigger className="bg-[var(--surface)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ALERT_TONE_LABELS) as AlertTone[]).map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {ALERT_TONE_LABELS[tone]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-[var(--surface)]"
                  onClick={() => playAlertTone(alertTone)}
                  disabled={alertTone === 'silencio'}
                  title="Probar tono"
                  aria-label="Probar tono de alerta"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex h-4 items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Target className="h-3.5 w-3.5 text-[var(--accent)]" />
                Tarea asociada
              </Label>
              <Select value={selectedTask} onValueChange={onSelectTask}>
                <SelectTrigger className="bg-[var(--surface)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.title}>
                      {t.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="Sin tarea asociada">Sin tarea asociada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Column */}
      <aside className="flex flex-col gap-5 xl:col-span-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Resumen de hoy</CardTitle>
              <CardDescription className="capitalize">{todayLabel}</CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
              <Zap className="h-3 w-3" />
              {sessions.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 divide-x divide-[var(--line)] text-center">
              <div className="px-2">
                <Timer className="mx-auto mb-1 h-4 w-4 text-[var(--accent)]" />
                <p className="font-mono-num m-0 text-base font-bold">{formattedTotal}</p>
                <p className="m-0 text-[11px] text-[var(--muted)]">enfocado</p>
              </div>
              <div className="px-2">
                <Check className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                <p className="font-mono-num m-0 text-base font-bold">{sessions.length}</p>
                <p className="m-0 text-[11px] text-[var(--muted)]">sesiones</p>
              </div>
              <div className="px-2">
                <Target className="mx-auto mb-1 h-4 w-4 text-sky-500" />
                <p className="font-mono-num m-0 text-base font-bold">{dailyGoalPct}%</p>
                <p className="m-0 text-[11px] text-[var(--muted)]">meta</p>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs text-[var(--muted)]">
                <span>Meta diaria</span>
                <strong className="font-mono-num text-[var(--text)]">{formattedTotal} / 2h</strong>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesiones recientes</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                downloadJson(`cronia-focus-sessions-${new Date().toISOString().slice(0, 10)}.json`, sessions);
                onNotify('Historial de enfoque exportado (JSON)');
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="m-0 py-4 text-center text-xs text-[var(--muted)]">
                Completa un ciclo de enfoque para ver tu historial.
              </p>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {sessions.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className={`h-7 w-1 rounded-full ${s.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[13px] font-semibold">{s.taskTitle}</p>
                      <p className="font-mono-num m-0 text-[11px] text-[var(--muted)]">
                        {s.durationMinutes} min · {s.completedAt}
                      </p>
                    </div>
                    <span className="font-mono-num text-xs font-bold text-[var(--accent)]">
                      {s.completionRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
