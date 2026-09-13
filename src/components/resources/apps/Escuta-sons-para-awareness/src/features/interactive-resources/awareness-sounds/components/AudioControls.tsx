/**
 * AudioControls - Controles Acústicos Confluência
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios:
 * - Play / Pausa suave com rampas
 * - Volume com ganho moderado e sem falsas promessas de decibéis
 * - Botão de Mudo
 * - Ícones lineares (stroke 2px)
 * - Alvos touch mínimos 44x44
 */

import React from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  onResetPosition?: () => void;
  spatialMode: 'hrtf' | 'stereo' | 'none';
  disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onResetPosition,
  spatialMode,
  disabled = false,
}) => {
  return (
    <div
      id="audio-controls-panel"
      className="w-full p-4 rounded-3xl bg-[#F1E9DB] border-2 border-[#D8CFBE] flex flex-wrap items-center justify-between gap-4"
    >
      {/* Botão Play/Pausa Principal */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="btn-playback-toggle"
          disabled={disabled}
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors touch-target-min ${
            isPlaying
              ? 'bg-[#96551F] text-[#FDFAF4] hover:bg-[#7D4518]'
              : 'bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isPlaying ? 'Pausar reprodução de som' : 'Iniciar reprodução de som'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>Escutar</span>
            </>
          )}
        </button>

        {onResetPosition && (
          <button
            type="button"
            id="btn-reset-position"
            disabled={disabled}
            onClick={onResetPosition}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#D8CFBE] bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#F1E9DB] text-xs font-medium transition-colors touch-target-min"
            title="Recentralizar som"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4B4B49]" strokeWidth={2} />
            <span className="hidden sm:inline">Recentralizar</span>
          </button>
        )}
      </div>

      {/* Controle de Volume e Mudo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="btn-toggle-mute-panel"
          disabled={disabled}
          onClick={onToggleMute}
          className="p-2 rounded-full border border-[#D8CFBE] bg-[#FDFAF4] text-[#005A1F] hover:bg-[#F1E9DB] transition-colors touch-target-min flex items-center justify-center"
          aria-label={isMuted ? 'Desativar mudo' : 'Silenciar áudio'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
          ) : (
            <Volume2 className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          )}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="sound-volume-slider" className="text-xs text-[#6B6B63] select-none">
            Intensidade:
          </label>
          <input
            id="sound-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            disabled={disabled}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 sm:w-32 accent-[#005A1F] cursor-pointer"
            aria-label="Controle de volume suave (ganho acústico)"
          />
        </div>

        {spatialMode === 'hrtf' && (
          <span className="hidden md:inline-block text-[11px] font-medium text-[#07614C] bg-[#FDFAF4] px-2.5 py-1 rounded-full border border-[#D8CFBE]">
            Áudio 3D HRTF Ativo
          </span>
        )}
      </div>
    </div>
  );
};
