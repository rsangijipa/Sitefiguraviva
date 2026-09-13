/**
 * Hook de ciclo de renderização e animação contínua do Rio dos Pensamentos.
 * Suporta WebGL avançado para correntes e fluidos com fallback transparente em Canvas 2D.
 * Controla requestAnimationFrame, delta time seguro, visibilidade de aba e redimensionamento.
 */

import { useEffect, useRef, RefObject } from 'react';
import { RiverSceneEngine } from '../engine/riverScene';
import { drawRiverBed, drawLeaf, drawLeafRipples, drawSediments, drawAquaticFlora } from '../engine/leafMotion';
import { RiverWebGLRenderer } from '../engine/riverWebGL';

interface UseRiverLoopProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  webglCanvasRef?: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  pointerRef?: RefObject<{ x: number; y: number; intensity: number }>;
  scene: RiverSceneEngine;
  isPaused: boolean;
  reducedMotion: boolean;
  useWebGL?: boolean;
  ambience?: number;
  onRendererStatus?: (status: { isWebGL: boolean; hasError: boolean }) => void;
  onFrameUpdate?: () => void;
}

export function useRiverLoop({
  canvasRef,
  webglCanvasRef,
  containerRef,
  pointerRef,
  scene,
  isPaused,
  reducedMotion,
  useWebGL = true,
  ambience = 0,
  onRendererStatus,
  onFrameUpdate,
}: UseRiverLoopProps) {
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const isTabHiddenRef = useRef<boolean>(false);
  const webglRendererRef = useRef<RiverWebGLRenderer | null>(null);

  useEffect(() => {
    const canvas2d = canvasRef.current;
    const webglCanvas = webglCanvasRef?.current;
    const container = containerRef.current;
    if (!canvas2d || !container) return;

    const ctx2d = canvas2d.getContext('2d');
    if (!ctx2d) {
      if (onRendererStatus) {
        onRendererStatus({ isWebGL: false, hasError: true });
      }
      return;
    }

    // Inicializa WebGL se solicitado e disponível
    let isWebglActive = false;
    if (useWebGL && webglCanvas) {
      try {
        const renderer = new RiverWebGLRenderer(webglCanvas);
        if (renderer.isAvailable()) {
          webglRendererRef.current = renderer;
          isWebglActive = true;
          if (onRendererStatus) {
            onRendererStatus({ isWebGL: true, hasError: false });
          }
        } else {
          renderer.destroy();
          webglRendererRef.current = null;
          if (onRendererStatus) {
            onRendererStatus({ isWebGL: false, hasError: false });
          }
        }
      } catch (err) {
        console.warn('Falha ao iniciar WebGL. Alternando para Canvas 2D:', err);
        webglRendererRef.current = null;
        if (onRendererStatus) {
          onRendererStatus({ isWebGL: false, hasError: false });
        }
      }
    } else {
      if (webglRendererRef.current) {
        webglRendererRef.current.destroy();
        webglRendererRef.current = null;
      }
      if (onRendererStatus) {
        onRendererStatus({ isWebGL: false, hasError: false });
      }
    }

    // Ajuste de resolução com limite de DPR a 2
    const updateCanvasSize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.max(Math.floor(rect.height), 240);

      // Canvas 2D
      if (canvas2d.width !== displayWidth * dpr || canvas2d.height !== displayHeight * dpr) {
        canvas2d.width = displayWidth * dpr;
        canvas2d.height = displayHeight * dpr;
        canvas2d.style.width = `${displayWidth}px`;
        canvas2d.style.height = `${displayHeight}px`;
        ctx2d.scale(dpr, dpr);
      }

      // Canvas WebGL (se ativo)
      if (webglCanvas) {
        if (webglCanvas.width !== displayWidth * dpr || webglCanvas.height !== displayHeight * dpr) {
          webglCanvas.width = displayWidth * dpr;
          webglCanvas.height = displayHeight * dpr;
          webglCanvas.style.width = `${displayWidth}px`;
          webglCanvas.style.height = `${displayHeight}px`;
        }
      }
    };

    // Inicializa tamanho
    updateCanvasSize();

    // ResizeObserver para manter fluidez responsiva
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    // Tratamento de mudança de visibilidade da aba
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabHiddenRef.current = true;
      } else {
        isTabHiddenRef.current = false;
        lastTimeRef.current = performance.now(); // reseta marcador para delta limpo
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Loop de animação
    const loop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      // Calcula delta time em segundos
      let dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Se a aba estiver escondida ou pausada, congela dt
      if (isTabHiddenRef.current || isPaused || reducedMotion) {
        dt = 0;
      } else {
        // Limita dt a no máximo 100ms para evitar saltos
        dt = Math.min(dt, 0.1);
        elapsedTimeRef.current += dt;
      }

      // Atualiza física e posições da cena
      scene.update(dt);

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 240);
      const time = elapsedTimeRef.current;
      const leaves = scene.getLeaves();
      const sediments = scene.getSediments();
      const speedMultiplier = scene.getSpeedMultiplier();

      // 1. RENDERIZAÇÃO DO LEITO (WebGL ou 2D)
      const currentPointer = pointerRef?.current || { x: 0.5, y: 0.5, intensity: 0 };
      if (pointerRef?.current && pointerRef.current.intensity > 0 && dt > 0) {
        pointerRef.current.intensity = Math.max(0, pointerRef.current.intensity - dt * 1.6);
      }

      if (isWebglActive && webglRendererRef.current) {
        const shaderLeaves = scene.getShaderLeavesData(height);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        webglRendererRef.current.render(
          Math.floor(width * dpr),
          Math.floor(height * dpr),
          time,
          speedMultiplier,
          shaderLeaves,
          currentPointer,
          ambience
        );
      }

      // 2. RENDERIZAÇÃO EM CAMADAS (2D Canvas)
      ctx2d.save();
      ctx2d.clearRect(0, 0, width, height);

      // Se WebGL não estiver ativo, desenha o leito em 2D
      if (!isWebglActive || !webglRendererRef.current) {
        drawRiverBed(ctx2d, width, height, time);
      }

      // Camada de flora aquática (nenúfares e vitórias-régias nas margens serenas)
      drawAquaticFlora(ctx2d, width, height, time);

      // Camada de sedimentos profundos
      drawSediments(ctx2d, sediments, width, height, time, 'deep');

      // Camada de marolas ao redor das folhas
      for (const leaf of leaves) {
        drawLeafRipples(ctx2d, leaf, width, height, time);
      }

      // Camada de sedimentos médios
      drawSediments(ctx2d, sediments, width, height, time, 'mid');

      // Camada das folhas botânicas e reflexões
      for (const leaf of leaves) {
        drawLeaf(ctx2d, leaf, width, height, time);
      }

      // Camada de sedimentos superficiais
      drawSediments(ctx2d, sediments, width, height, time, 'surface');

      ctx2d.restore();

      if (onFrameUpdate) {
        onFrameUpdate();
      }

      // Continua loop
      rafIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (webglRendererRef.current) {
        webglRendererRef.current.destroy();
        webglRendererRef.current = null;
      }
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [canvasRef, webglCanvasRef, containerRef, pointerRef, scene, isPaused, reducedMotion, useWebGL, ambience, onRendererStatus, onFrameUpdate]);
}
