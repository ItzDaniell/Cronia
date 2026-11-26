export type AlertTone = 'campana' | 'cristal' | 'digital' | 'zen' | 'silencio';

export const ALERT_TONE_LABELS: Record<AlertTone, string> = {
  campana: 'Campana suave',
  cristal: 'Cristal',
  digital: 'Pulso digital',
  zen: 'Cuenco Zen',
  silencio: 'Silencio',
};

export const ALERT_TONE_STORAGE_KEY = 'cronia.focus.alertTone';

export function readStoredAlertTone(): AlertTone {
  try {
    const raw = window.localStorage.getItem(ALERT_TONE_STORAGE_KEY) as AlertTone | null;
    if (raw && raw in ALERT_TONE_LABELS) return raw;
  } catch {
    // Ignore storage errors
  }
  return 'campana';
}

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return AudioCtx ? new AudioCtx() : null;
  } catch {
    return null;
  }
}

export function playAlertTone(tone: AlertTone = 'campana'): void {
  if (tone === 'silencio') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (tone === 'campana') {
      const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.42);
      });
      return;
    }

    if (tone === 'cristal') {
      const notes = [880, 1174.66, 1318.5, 1760]; // A5 -> D6 -> E6 -> A6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.1 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.48);
      });
      return;
    }

    if (tone === 'digital') {
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(920, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.07, now + offset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
      return;
    }

    if (tone === 'zen') {
      // Warm Tibetan bowl harmonic
      [220, 440, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const peak = idx === 0 ? 0.18 : idx === 1 ? 0.08 : 0.04;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.55);
      });
    }
  } catch {
    // Ignore audio errors if blocked by autoplay policy
  }
}

export function playCompletionChime(): void {
  playAlertTone(readStoredAlertTone());
}
