"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TimerDisplayProps {
  isActive: boolean;
  paused: boolean;
  totalSeconds: number;
  elapsedSeconds: number;
  hideTimer: boolean;
}

export function TimerDisplay({
  isActive,
  paused,
  totalSeconds,
  elapsedSeconds,
  hideTimer,
}: TimerDisplayProps) {
  const [displayMs, setDisplayMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const savedElapsedRef = useRef(0);
  const rafRef = useRef<number>(0);

  const remainingMs = Math.max(0, totalSeconds * 1000 - displayMs);

  const startRafLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const delta = now - startTimeRef.current;
      const currentElapsed = savedElapsedRef.current + delta;
      setDisplayMs(currentElapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRafLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    if (!isActive || paused) {
      stopRafLoop();
      if (!paused) {
        savedElapsedRef.current = 0;
      } else {
        savedElapsedRef.current = elapsedSeconds * 1000;
      }
      return;
    }
    savedElapsedRef.current = elapsedSeconds * 1000;
    startRafLoop();
    return stopRafLoop;
  }, [isActive, paused, elapsedSeconds, startRafLoop, stopRafLoop]);

  const formatTime = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!isActive) return null;

  if (hideTimer) {
    return (
      <div className="flex items-center justify-center py-2" aria-live="polite">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          Pausa em andamento
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-4" aria-live="polite">
      <time
        className="font-serif text-5xl tabular-nums text-primary sm:text-6xl"
        dateTime={`PT${Math.ceil(remainingMs / 1000)}S`}
      >
        {formatTime(remainingMs)}
      </time>
      <span className="text-xs font-medium text-muted">restante</span>
    </div>
  );
}
