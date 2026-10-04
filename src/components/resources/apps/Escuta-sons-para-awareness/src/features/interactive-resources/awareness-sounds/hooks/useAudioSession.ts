/**
 * Hook de Ciclo de Vida do Áudio - Sons para Awareness
 * Instituto Figura Viva - Registro Confluência
 *
 * Gerencia:
 * - Ativação sob demanda por clique.
 * - Pausa automática se a aba for ocultada (visibilitychange).
 * - Retomada explícita.
 * - Suporte a prefers-reduced-motion.
 * - Limpeza total e desarme de fontes no unmount.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { globalAwarenessAudioEngine, SpatialEngineStatus } from '../audio/audioEngine';
import { SoundId, SoundPosition } from '../types';

export function useAudioSession() {
  const [engineStatus, setEngineStatus] = useState<SpatialEngineStatus>(
    globalAwarenessAudioEngine.getStatus()
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [wasPausedByVisibility, setWasPausedByVisibility] = useState(false);
  const currentPositionRef = useRef<SoundPosition>({ x: 0, y: 0, distanceTier: 'medio' });

  useEffect(() => {
    // Escuta estado do engine
    const unsubscribe = globalAwarenessAudioEngine.subscribe((status) => {
      setEngineStatus(status);
    });

    // Detecta preferência de movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionHandler);

    // Pausa se o documento ficar oculto
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const current = globalAwarenessAudioEngine.getStatus();
        if (current.isPlaying) {
          globalAwarenessAudioEngine.pauseSound();
          setWasPausedByVisibility(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Desconecta e interrompe fontes no unmount
      globalAwarenessAudioEngine.stopAndReset();
    };
  }, []);

  const activateAudio = useCallback(async () => {
    return await globalAwarenessAudioEngine.activateAudio();
  }, []);

  const playSound = useCallback(
    async (soundId: SoundId, position: SoundPosition) => {
      currentPositionRef.current = position;
      setWasPausedByVisibility(false);
      await globalAwarenessAudioEngine.playSound(soundId, position);
    },
    []
  );

  const pauseSound = useCallback(() => {
    globalAwarenessAudioEngine.pauseSound();
  }, []);

  const resumeSound = useCallback(() => {
    setWasPausedByVisibility(false);
    globalAwarenessAudioEngine.resumeSound(currentPositionRef.current);
  }, []);

  const updatePosition = useCallback((position: SoundPosition) => {
    currentPositionRef.current = position;
    globalAwarenessAudioEngine.updatePosition(position);
  }, []);

  const setVolume = useCallback((vol: number) => {
    globalAwarenessAudioEngine.setVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    globalAwarenessAudioEngine.toggleMute();
  }, []);

  const stopAndReset = useCallback(() => {
    setWasPausedByVisibility(false);
    globalAwarenessAudioEngine.stopAndReset();
  }, []);

  return {
    engineStatus,
    prefersReducedMotion,
    wasPausedByVisibility,
    activateAudio,
    playSound,
    pauseSound,
    resumeSound,
    updatePosition,
    setVolume,
    toggleMute,
    stopAndReset,
  };
}
