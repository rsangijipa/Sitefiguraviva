/**
 * @license
 * Instituto Figura Viva - Hook de Timer Ativo Monotônico
 * Medição precisa via performance.now(), segmentos de tempo ativo e congelamento em background/pausa.
 */

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseActiveTimerOptions {
  plannedDurationSeconds: number;
  onComplete?: () => void;
  onPauseByVisibility?: () => void;
}

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isOpenEnded: boolean; // Após o timer planejado, se o usuário optou por "Continuar um pouco"
  hideCountdown: boolean;
  activeSeconds: number;
  remainingSeconds: number;
  plannedSeconds: number;
  progressFraction: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  continueOpenEnded: () => void;
  toggleHideCountdown: () => void;
  reset: (newPlannedDuration?: number) => void;
}

export function useActiveTimer(
  options: UseActiveTimerOptions,
): ActiveTimerState {
  const { plannedDurationSeconds, onComplete, onPauseByVisibility } = options;

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isOpenEnded, setIsOpenEnded] = useState<boolean>(
    plannedDurationSeconds === 0,
  );
  const [hideCountdown, setHideCountdown] = useState<boolean>(false);
  const [plannedSeconds, setPlannedSeconds] = useState<number>(
    plannedDurationSeconds,
  );

  // Estados acumuladores em milissegundos
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    plannedDurationSeconds,
  );

  // Refs monotônicas
  const accumulatedActiveMsRef = useRef<number>(0);
  const currentSegmentStartRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onPauseByVisibilityRef = useRef(onPauseByVisibility);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onPauseByVisibilityRef.current = onPauseByVisibility;
  }, [onPauseByVisibility]);

  // Atualiza plannedSeconds quando options mudar
  useEffect(() => {
    setPlannedSeconds(plannedDurationSeconds);
    setIsOpenEnded(plannedDurationSeconds === 0);
    if (!isActive) {
      setRemainingSeconds(plannedDurationSeconds);
    }
  }, [plannedDurationSeconds, isActive]);

  // Função interna para obter tempo ativo total exato
  const getCalculatedActiveMs = useCallback(() => {
    let total = accumulatedActiveMsRef.current;
    if (currentSegmentStartRef.current !== null) {
      total += performance.now() - currentSegmentStartRef.current;
    }
    return total;
  }, []);

  const pause = useCallback(() => {
    if (currentSegmentStartRef.current !== null) {
      accumulatedActiveMsRef.current +=
        performance.now() - currentSegmentStartRef.current;
      currentSegmentStartRef.current = null;
    }
    setIsActive(false);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    currentSegmentStartRef.current = performance.now();
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const start = useCallback(() => {
    accumulatedActiveMsRef.current = 0;
    currentSegmentStartRef.current = performance.now();
    setIsActive(true);
    setIsPaused(false);
    setIsCompleted(false);
    setIsOpenEnded(plannedDurationSeconds === 0);
  }, [plannedDurationSeconds]);

  const stop = useCallback(() => {
    if (currentSegmentStartRef.current !== null) {
      accumulatedActiveMsRef.current +=
        performance.now() - currentSegmentStartRef.current;
      currentSegmentStartRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const continueOpenEnded = useCallback(() => {
    setIsOpenEnded(true);
    setIsCompleted(false);
    resume();
  }, [resume]);

  const reset = useCallback(
    (newPlanned?: number) => {
      accumulatedActiveMsRef.current = 0;
      currentSegmentStartRef.current = null;
      const target = newPlanned ?? plannedDurationSeconds;
      setPlannedSeconds(target);
      setActiveSeconds(0);
      setRemainingSeconds(target);
      setIsActive(false);
      setIsPaused(false);
      setIsCompleted(false);
      setIsOpenEnded(false);
    },
    [plannedDurationSeconds],
  );

  const toggleHideCountdown = useCallback(() => {
    setHideCountdown((prev) => !prev);
  }, []);

  // Monitora visibilidade da aba: ao ocultar, congela automaticamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        pause();
        if (onPauseByVisibilityRef.current) {
          onPauseByVisibilityRef.current();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, pause]);

  // Loop de atualização por requestAnimationFrame ou intervalo para atualização suave da UI
  useEffect(() => {
    if (!isActive) return;

    const intervalId = window.setInterval(() => {
      const activeMs = getCalculatedActiveMs();
      const currentActiveSec = Math.floor(activeMs / 1000);
      setActiveSeconds(currentActiveSec);

      if (!isOpenEnded) {
        const remaining = Math.max(0, plannedSeconds - currentActiveSec);
        setRemainingSeconds(remaining);

        if (remaining <= 0 && !isCompleted) {
          // Timer planejado finalizado
          if (currentSegmentStartRef.current !== null) {
            accumulatedActiveMsRef.current +=
              performance.now() - currentSegmentStartRef.current;
            currentSegmentStartRef.current = null;
          }
          setIsActive(false);
          setIsPaused(false);
          setIsCompleted(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      }
    }, 200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    isActive,
    isOpenEnded,
    plannedSeconds,
    isCompleted,
    getCalculatedActiveMs,
  ]);

  const progressFraction =
    plannedSeconds > 0 ? Math.min(1, activeSeconds / plannedSeconds) : 0;

  return {
    isActive,
    isPaused,
    isCompleted,
    isOpenEnded,
    hideCountdown,
    activeSeconds,
    remainingSeconds,
    plannedSeconds,
    progressFraction,
    start,
    pause,
    resume,
    stop,
    continueOpenEnded,
    toggleHideCountdown,
    reset,
  };
}
