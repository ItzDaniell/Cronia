import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Download, Pause, Play, RotateCcw, Target, Timer, Zap } from 'lucide-react';
import type { FocusSession, Task } from '@/types';
import { isTaskCompleted } from '@/modules/tasks/domain/rules';
import { downloadJson } from '@/utils/exportData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  onSetSeconds: (seconds: number) => void;
  onSetRunning: (running: boolean) => void;
  onCompleteSession: (taskTitle: string, durationMinutes: number) => void;
  onNotify: (message: string) => void;
}

const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function FocusPage({
  tasks,
  sessions,
  seconds,
  running,
  onSetSeconds,
  onSetRunning,
  onCompleteSession,
  onNotify,
}: FocusPageProps) {
  const [phase, setPhase] = useState<'Enfoque' | 'Descanso corto' | 'Descanso largo'>('Enfoque');
  const [selectedTask, setSelectedTask] = useState(
    tasks.find((t) => !isTaskCompleted(t))?.title ?? 'Sin tarea asociada',
  );
  const [work, setWork] = useState(25);
  const [ambient, setAmbient] = useState('Sin sonido');

  const durations = { Enfoque: work, 'Descanso corto': 5, 'Descanso largo': 15 };
  const duration = durations[phase];

  const choosePhase = (next: typeof phase) => {
    setPhase(next);
    onSetRunning(false);
    onSetSeconds(durations[next] * 60);
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
        {/* Top status row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[var(--surface-2)] p-1">
            {(Object.keys(durations) as (keyof typeof durations)[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => choosePhase(item)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all ${
                  phase === item
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {item}
                <span className="font-mono-num text-[10.5px] opacity-70">{durations[item]}m</span>
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

        {/* Bottom Task Dock */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Target className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                TAREA ASOCIADA
              </p>
              <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">{selectedTask}</p>
            </div>
          </div>

          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger className="w-full sm:w-[240px] bg-[var(--surface)]">
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
            <div>
              <CardTitle>Configuración del ciclo</CardTitle>
              <CardDescription>Duración y ambiente</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Enfoque</Label>
              <Select
                value={String(work)}
                onValueChange={(val) => {
                  const value = Number(val);
                  setWork(value);
                  if (phase === 'Enfoque') onSetSeconds(value * 60);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 minutos</SelectItem>
                  <SelectItem value="50">50 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ambiente</Label>
              <Select value={ambient} onValueChange={setAmbient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin sonido">Sin sonido</SelectItem>
                  <SelectItem value="Lluvia suave">Lluvia suave</SelectItem>
                  <SelectItem value="Café">Café</SelectItem>
                  <SelectItem value="Ruido blanco">Ruido blanco</SelectItem>
                </SelectContent>
              </Select>
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
