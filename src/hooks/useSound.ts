import { useCallback, useRef } from 'react';

type SoundType = 'type' | 'notification' | 'success' | 'alert' | 'deploy';

const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(frequency: number, duration: number, volume: number = 0.05, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may not be available
  }
}

const SOUNDS: Record<SoundType, () => void> = {
  type: () => playTone(800 + Math.random() * 200, 0.03, 0.02, 'square'),
  notification: () => {
    playTone(880, 0.1, 0.04);
    setTimeout(() => playTone(1100, 0.15, 0.04), 100);
  },
  success: () => {
    playTone(523, 0.1, 0.04);
    setTimeout(() => playTone(659, 0.1, 0.04), 100);
    setTimeout(() => playTone(784, 0.15, 0.04), 200);
  },
  alert: () => {
    playTone(440, 0.15, 0.05, 'sawtooth');
    setTimeout(() => playTone(440, 0.15, 0.05, 'sawtooth'), 200);
  },
  deploy: () => {
    playTone(330, 0.08, 0.03);
    setTimeout(() => playTone(440, 0.08, 0.03), 80);
    setTimeout(() => playTone(550, 0.12, 0.03), 160);
  },
};

export function useSound(enabled: boolean) {
  const lastPlayRef = useRef<number>(0);

  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    const now = Date.now();
    // Throttle sounds to avoid overwhelming
    if (type === 'type' && now - lastPlayRef.current < 30) return;
    lastPlayRef.current = now;
    SOUNDS[type]?.();
  }, [enabled]);

  return { play };
}
