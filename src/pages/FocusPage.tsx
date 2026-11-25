import { useState } from 'react';
import type { FocusSession, Task } from '../types';
import { isTaskCompleted } from '../modules/tasks/domain/rules';
import { Icon } from '../components/ui/Icon';
import { PanelHeading } from '../components/ui/PanelHeading';

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
  const [selectedTask, setSelectedTask] = useState(tasks.find((t) => !isTaskCompleted(t))?.title ?? 'Sin tarea asociada');
  const [work, setWork] = useState(25);

  const durations = { Enfoque: work, 'Descanso corto': 5, 'Descanso largo': 15 };
  const duration = durations[phase];

  const choosePhase = (next: typeof phase) => {
    setPhase(next);
    onSetRunning(false);
    onSetSeconds(durations[next] * 60);
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = Math.max(0, 1 - seconds / (duration * 60));

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
    <div className="enhanced-focus">
      <section className={`focus-workspace ${running ? 'is-running' : ''}`}>
        <div className="focus-topline">
          <div>
            <span>MODO SIN DISTRACCIONES</span>
            <strong>{running ? 'Sesión activa' : 'Preparado para enfocarte'}</strong>
          </div>
          <div className="session-streak">
            <Icon name="bolt" />
            <span>
              <strong>{sessions.length}</strong>
              sesiones hoy
            </span>
          </div>
        </div>

        <div className="phase-tabs">
          {(Object.keys(durations) as (keyof typeof durations)[]).map((item) => (
            <button
              type="button"
              className={phase === item ? 'active' : ''}
              onClick={() => choosePhase(item)}
              key={item}
            >
              {item}
              <small>{durations[item]} min</small>
            </button>
          ))}
        </div>

        <div className="focus-center">
          <div className="focus-orbit" style={{ '--progress': `${progress * 360}deg` } as React.CSSProperties}>
            <div>
              <span>{phase.toUpperCase()}</span>
              <strong>
                {minutes}:{secs}
              </strong>
              <small>{running ? 'Mantén el ritmo' : 'Pulsa iniciar cuando estés listo'}</small>
            </div>
          </div>

          <div className="focus-controls">
            <button
              type="button"
              className="secondary-round"
              onClick={() => {
                onSetRunning(false);
                onSetSeconds(duration * 60);
              }}
              aria-label="Reiniciar sesión"
            >
              <Icon name="repeat" />
            </button>
            <button type="button" className="focus-start" onClick={() => onSetRunning(!running)}>
              <Icon name={running ? 'pause' : 'play'} />
              {running ? 'Pausar' : 'Iniciar enfoque'}
            </button>
            <button
              type="button"
              className="secondary-round"
              onClick={() => {
                onSetRunning(false);
                onCompleteSession(selectedTask, duration);
                onSetSeconds(duration * 60);
              }}
              aria-label="Finalizar sesión"
            >
              <Icon name="check" />
            </button>
          </div>
        </div>

        <div className="focus-assignment">
          <div>
            <Icon name="target" />
            <span>
              <small>TAREA DE ESTA SESIÓN</small>
              <strong>{selectedTask}</strong>
            </span>
          </div>
          <select value={selectedTask} onChange={(event) => setSelectedTask(event.target.value)}>
            {tasks.map((t) => (
              <option key={t.id} value={t.title}>
                {t.title}
              </option>
            ))}
            <option value="Sin tarea asociada">Sin tarea asociada</option>
          </select>
        </div>
      </section>

      <aside className="focus-dashboard">
        <section className="panel focus-daily">
          <PanelHeading title="Resumen de hoy" subtitle={todayLabel} />
          <div className="focus-kpis">
            <div>
              <span>
                <Icon name="timer" />
              </span>
              <strong>{formattedTotal}</strong>
              <small>tiempo enfocado</small>
            </div>
            <div>
              <span>
                <Icon name="check" />
              </span>
              <strong>{sessions.length}</strong>
              <small>sesiones completas</small>
            </div>
            <div>
              <span>
                <Icon name="target" />
              </span>
              <strong>{dailyGoalPct}%</strong>
              <small>objetivo diario</small>
            </div>
          </div>
          <div className="daily-goal">
            <span>
              Meta diaria <b>{formattedTotal} / 2h</b>
            </span>
            <i>
              <em style={{ width: `${dailyGoalPct}%` }} />
            </i>
          </div>
        </section>

        <section className="panel focus-settings-card">
          <PanelHeading title="Duración" subtitle="Personaliza tu ciclo" />
          <div>
            <label>
              Enfoque
              <select
                value={work}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setWork(value);
                  if (phase === 'Enfoque') onSetSeconds(value * 60);
                }}
              >
                <option value={25}>25 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </label>
            <label>
              Sonido ambiente
              <select>
                <option>Sin sonido</option>
                <option>Lluvia suave</option>
                <option>Café</option>
                <option>Ruido blanco</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <PanelHeading
            title="Sesiones recientes"
            action="Exportar"
            onAction={() => onNotify('Historial de enfoque exportado')}
          />
          <div className="recent enhanced">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id}>
                <i className={s.color} />
                <span>
                  <strong>{s.taskTitle}</strong>
                  {s.durationMinutes} min · {s.completedAt}
                </span>
                <b>{s.completionRate}%</b>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
