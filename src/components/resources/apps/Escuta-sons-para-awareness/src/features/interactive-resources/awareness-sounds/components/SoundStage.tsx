/**
 * SoundStage - Palco Acústico Espacial Confluência
 * Instituto Figura Viva - Registro Confluência
 *
 * Características:
 * - Palco circular com ouvinte no centro (Verde Raiz).
 * - Círculos concêntricos Areia (#F1E9DB) sobre fundo Creme (#FDFAF4).
 * - Marcador sonoro em Terra Barro (#96551F).
 * - Rótulos textuais sempre presentes: Frente, Atrás, Esquerda, Direita, Centro.
 * - Ondas discretas orgânicas sem simulação enganosa de medição física.
 * - No modo guiado, oculta a posição visual até que seja intencionalmente revelada.
 * - Navegação completa por teclado e botões HTML acessíveis (não depende de arrasto).
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { User, Volume2, Move, Eye, EyeOff, Sparkles, Navigation } from 'lucide-react';
import { SoundId, SoundPosition } from '../types';
import { SOUND_LIBRARY_MANIFEST } from '../audio/assetLoader';

interface SoundStageProps {
  position: SoundPosition;
  onPositionChange: (pos: SoundPosition) => void;
  activeSoundId: SoundId;
  isPlaying: boolean;
  isGuidedMode: boolean;
  isRevealed: boolean;
  reducedMotion: boolean;
  disabled?: boolean;
}

export const SoundStage: React.FC<SoundStageProps> = ({
  position,
  onPositionChange,
  activeSoundId,
  isPlaying,
  isGuidedMode,
  isRevealed,
  reducedMotion,
  disabled = false,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const soundManifest = SOUND_LIBRARY_MANIFEST[activeSoundId];

  // Converte coordenadas normalizadas (-1 a 1) para percentual no palco (0% a 100%)
  // Nota: y positivo é Frente (topo do palco = Y menor em CSS, logo top: 50% - y*40%)
  const markerXPercent = 50 + position.x * 40;
  const markerYPercent = 50 - position.y * 40;

  const handlePointerUpdate = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || (isGuidedMode && !isRevealed)) return;
      if (!stageRef.current) return;

      const rect = stageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (clientX - centerX) / (rect.width / 2);
      const dy = (centerY - clientY) / (rect.height / 2); // Inverte Y: topo é frente

      // Limita ao círculo de raio 1.0
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(1.0, dist);
      const angle = Math.atan2(dy, dx);

      const normX = clampedDist > 0.05 ? Math.cos(angle) * clampedDist : 0;
      const normY = clampedDist > 0.05 ? Math.sin(angle) * clampedDist : 0;

      let tier: 'perto' | 'medio' | 'longe' = 'medio';
      if (clampedDist < 0.4) tier = 'perto';
      else if (clampedDist > 0.75) tier = 'longe';

      onPositionChange({
        x: Number(normX.toFixed(2)),
        y: Number(normY.toFixed(2)),
        distanceTier: tier,
      });
    },
    [disabled, isGuidedMode, isRevealed, onPositionChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || (isGuidedMode && !isRevealed)) return;
    setIsDragging(true);
    handlePointerUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerUpdate(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || (isGuidedMode && !isRevealed)) return;
    if (e.touches.length > 0) {
      setIsDragging(true);
      handlePointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handlePointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Atalhos de botões HTML para garantir acessibilidade sem arrasto
  const applyPreset = (x: number, y: number, tier: 'perto' | 'medio' | 'longe') => {
    if (disabled || (isGuidedMode && !isRevealed)) return;
    onPositionChange({ x, y, distanceTier: tier });
  };

  return (
    <div id="sound-stage-container" className="flex flex-col items-center w-full space-y-4">
      {/* Informação descritiva da cena sonora */}
      <div className="w-full flex items-center justify-between text-xs sm:text-sm text-[#4B4B49] px-2">
        <span className="font-medium text-[#005A1F] flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          {soundManifest.title}
        </span>
        <span className="text-[#6B6B63]">
          {isGuidedMode && !isRevealed
            ? 'Posição misteriosa (ouça atentamente)'
            : `Distância: ${position.distanceTier.toUpperCase()}`}
        </span>
      </div>

      {/* Palco Circular Principal */}
      <div
        ref={stageRef}
        id="sound-stage-disc"
        role="region"
        aria-label="Palco acústico circular com ouvinte central e fonte sonora posicionável"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full max-w-[340px] sm:max-w-[420px] aspect-square rounded-full bg-[#F1E9DB] border-2 border-[#D8CFBE] select-none touch-none flex items-center justify-center ${
          disabled || (isGuidedMode && !isRevealed) ? 'cursor-default' : 'cursor-crosshair'
        }`}
      >
        {/* Rótulo Textual: Frente */}
        <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          Frente
        </div>

        {/* Rótulo Textual: Atrás */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          Atrás
        </div>

        {/* Rótulo Textual: Esquerda */}
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          Esquerda
        </div>

        {/* Rótulo Textual: Direita */}
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          Direita
        </div>

        {/* Anel Externo de Distância: Longe */}
        <div
          className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#D8CFBE] pointer-events-none"
          aria-hidden="true"
        />

        {/* Anel Médio de Distância: Intermediário */}
        <div
          className="absolute w-[52%] h-[52%] rounded-full border border-[#D8CFBE] pointer-events-none"
          aria-hidden="true"
        />

        {/* Anel Interno de Distância: Perto */}
        <div
          className="absolute w-[28%] h-[28%] rounded-full border border-[#D8CFBE] bg-[#FDFAF4]/40 pointer-events-none"
          aria-hidden="true"
        />

        {/* Eixos Orientadores Centrais */}
        <div className="absolute w-full h-px bg-[#D8CFBE]/60 pointer-events-none" aria-hidden="true" />
        <div className="absolute h-full w-px bg-[#D8CFBE]/60 pointer-events-none" aria-hidden="true" />

        {/* Centro: Posição do Ouvinte (Verde Raiz) */}
        <div
          id="stage-listener-node"
          className="relative z-10 w-11 h-11 rounded-full bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center border-2 border-[#FDFAF4] shadow-none"
          title="Você no centro da escuta"
          role="img"
          aria-label="Você, posicionado no centro do palco"
        >
          <User className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2} />
        </div>

        {/* Fonte Sonora: Terra Barro (#96551F) */}
        {(!isGuidedMode || isRevealed) && (
          <div
            id="stage-sound-marker"
            style={{
              left: `${markerXPercent}%`,
              top: `${markerYPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-20 transition-transform duration-75"
          >
            {/* Ondas discretas não-quantitativas quando em reprodução */}
            {isPlaying && !reducedMotion && (
              <div
                className="absolute inset-0 -m-3 rounded-full border-2 border-[#96551F] animate-ping opacity-30 pointer-events-none"
                aria-hidden="true"
              />
            )}

            <div
              className="w-10 h-10 rounded-full bg-[#96551F] text-[#FDFAF4] border-2 border-[#FDFAF4] flex items-center justify-center cursor-grab active:cursor-grabbing touch-target-min"
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Fonte sonora: ${soundManifest.title}. Posição: X ${position.x}, Y ${position.y}. Use setas para mover.`}
              aria-valuenow={Math.round(position.x * 100)}
              onKeyDown={(e) => {
                if (disabled) return;
                const step = 0.15;
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  onPositionChange({ ...position, x: Math.max(-1, position.x - step) });
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  onPositionChange({ ...position, x: Math.min(1, position.x + step) });
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  onPositionChange({ ...position, y: Math.min(1, position.y + step) });
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  onPositionChange({ ...position, y: Math.max(-1, position.y - step) });
                }
              }}
            >
              <Volume2 className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2} />
            </div>

            <span className="absolute top-11 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FDFAF4] border border-[#D8CFBE] text-[10px] font-semibold text-[#96551F] whitespace-nowrap">
              {soundManifest.title}
            </span>
          </div>
        )}

        {/* Modo Guiado Oculto: Indicador de escuta atenta no ar */}
        {isGuidedMode && !isRevealed && (
          <div className="absolute z-15 inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-[#FDFAF4]/90 border border-[#D8CFBE] text-xs text-[#6B6B63] flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
              <span>Posição oculta para escuta livre</span>
            </div>
          </div>
        )}
      </div>

      {/* Controles de Posicionamento Acessíveis por Botão (Garante que nenhuma função dependa de arrasto) */}
      {(!isGuidedMode || isRevealed) && !disabled && (
        <div className="w-full pt-1 space-y-2">
          <span className="block text-xs font-semibold text-[#005A1F] text-center">
            Ajustar posição no espaço:
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              id="pos-frente"
              onClick={() => applyPreset(0, 0.7, 'medio')}
              className="px-3 py-1.5 text-xs rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] font-medium touch-target-min"
            >
              Frente
            </button>
            <button
              type="button"
              id="pos-esquerda"
              onClick={() => applyPreset(-0.7, 0, 'medio')}
              className="px-3 py-1.5 text-xs rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] font-medium touch-target-min"
            >
              Esquerda
            </button>
            <button
              type="button"
              id="pos-centro"
              onClick={() => applyPreset(0, 0, 'perto')}
              className="px-3 py-1.5 text-xs rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] font-medium touch-target-min"
            >
              Centro
            </button>
            <button
              type="button"
              id="pos-direita"
              onClick={() => applyPreset(0.7, 0, 'medio')}
              className="px-3 py-1.5 text-xs rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] font-medium touch-target-min"
            >
              Direita
            </button>
            <button
              type="button"
              id="pos-atras"
              onClick={() => applyPreset(0, -0.7, 'medio')}
              className="px-3 py-1.5 text-xs rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] font-medium touch-target-min"
            >
              Atrás
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
