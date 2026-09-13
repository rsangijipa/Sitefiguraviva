/**
 * Barra de controles da experiência (RiverControls)
 * Controles de ritmo, acessibilidade de movimento, ambiência sonora e encerramento ético.
 */

import React from 'react';
import { Play, Pause, Volume2, VolumeX, Eye, Clock, LogOut, Sun, Sunrise, Sunset, Gauge } from 'lucide-react';
import { RiverMode } from '../../../../types';

interface RiverControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  mode: RiverMode;
  plannedDuration: number | null;
  onSelectDuration: (duration: number | null) => void;
  elapsedSeconds: number;
  onEndExperience: () => void;
  ambience?: number;
  onSelectAmbience?: (ambience: number) => void;
  speed?: number;
  onSelectSpeed?: (speed: number) => void;
}

export const RiverControls: React.FC<RiverControlsProps> = ({
  isPaused,
  onTogglePause,
  reducedMotion,
  onToggleReducedMotion,
  isAudioActive,
  onToggleAudio,
  mode,
  plannedDuration,
  onSelectDuration,
  elapsedSeconds,
  onEndExperience,
  ambience = 0,
  onSelectAmbience,
  speed = 1.0,
  onSelectSpeed,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-4 sm:p-5 flex flex-col gap-4 shadow-none">
      {/* Linha superior: Modos de tempo e cronômetro acolhedor */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D8CFBE]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span className="text-xs font-medium text-[#262B22]">Duração:</span>
            
            <div className="flex items-center gap-1.5" role="group" aria-label="Opções de tempo sugerido">
              <button
                type="button"
                onClick={() => onSelectDuration(null)}
                className={`px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  plannedDuration === null
                    ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
              >
                Livre
              </button>
              <button
                type="button"
                onClick={() => onSelectDuration(120)}
                className={`px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  plannedDuration === 120
                    ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
              >
                2 min
              </button>
              <button
                type="button"
                onClick={() => onSelectDuration(180)}
                className={`px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  plannedDuration === 180
                    ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
              >
                3 min
              </button>
              <button
                type="button"
                onClick={() => onSelectDuration(300)}
                className={`px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  plannedDuration === 300
                    ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
              >
                5 min
              </button>
            </div>
          </div>

          {/* Seletor de Ambiência e Luz Natural */}
          {onSelectAmbience && (
            <div className="flex items-center gap-1.5 pl-2 sm:border-l border-[#D8CFBE]">
              <span className="text-xs font-medium text-[#262B22] hidden sm:inline">Luz:</span>
              <button
                type="button"
                onClick={() => onSelectAmbience(0)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  ambience === 0
                    ? 'bg-[#07614C] text-[#FDFAF4] border-[#07614C]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
                title="Manhã Serena: Águas translúcidas e luz matinal"
              >
                <Sunrise className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Manhã</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectAmbience(1)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  ambience === 1
                    ? 'bg-[#96551F] text-[#FDFAF4] border-[#96551F]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
                title="Tarde Solar: Reflexos dourados e caústicas intensas"
              >
                <Sun className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Tarde Solar</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectAmbience(2)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border min-h-[30px] transition-colors cursor-pointer ${
                  ambience === 2
                    ? 'bg-[#262B22] text-[#FDFAF4] border-[#262B22]'
                    : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:bg-[#FDFAF4]'
                }`}
                title="Crepúsculo: Tons esmeralda profundos e introspecção"
              >
                <Sunset className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Crepúsculo</span>
              </button>
            </div>
          )}
        </div>

        {/* Marcador de tempo decorrido */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B63]">
          <span>Tempo decorrido:</span>
          <span className="font-mono text-[#005A1F] font-semibold text-sm">
            {formatTime(elapsedSeconds)}
          </span>
          {plannedDuration && (
            <span className="text-xs text-[#6B6B63]">/ {formatTime(plannedDuration)}</span>
          )}
        </div>
      </div>

      {/* Linha de botões de controle operacional */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pausar / Retomar */}
          <button
            type="button"
            onClick={onTogglePause}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium text-[#262B22] transition-colors cursor-pointer"
            aria-label={isPaused ? 'Retomar movimento do rio' : 'Pausar movimento do rio'}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
                <span>Retomar</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
                <span>Pausar</span>
              </>
            )}
          </button>

          {/* Ajuste de Velocidade da Correnteza */}
          {onSelectSpeed && (
            <div className="inline-flex items-center gap-1 p-1 rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4]">
              <span className="text-[11px] font-medium text-[#6B6B63] px-2 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#07614C]" strokeWidth={2} />
                Fluxo:
              </span>
              <button
                type="button"
                onClick={() => onSelectSpeed(0.7)}
                className={`px-2 py-1 text-xs rounded-[10px] font-medium transition-colors cursor-pointer ${
                  speed === 0.7 ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22] hover:bg-[#F1E9DB]'
                }`}
              >
                Sereno
              </button>
              <button
                type="button"
                onClick={() => onSelectSpeed(1.0)}
                className={`px-2 py-1 text-xs rounded-[10px] font-medium transition-colors cursor-pointer ${
                  speed === 1.0 ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22] hover:bg-[#F1E9DB]'
                }`}
              >
                1.0x
              </button>
              <button
                type="button"
                onClick={() => onSelectSpeed(1.4)}
                className={`px-2 py-1 text-xs rounded-[10px] font-medium transition-colors cursor-pointer ${
                  speed === 1.4 ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22] hover:bg-[#F1E9DB]'
                }`}
              >
                1.4x
              </button>
            </div>
          )}

          {/* Reduzir Movimento (Acessibilidade) */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded-[16px] border-2 transition-colors cursor-pointer text-xs sm:text-sm font-medium ${
              reducedMotion
                ? 'border-[#005A1F] bg-[#005A1F]/10 text-[#005A1F]'
                : 'border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22]'
            }`}
            aria-pressed={reducedMotion}
            aria-label="Alternar modo de movimento reduzido"
          >
            <Eye className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span>{reducedMotion ? 'Movimento reduzido' : 'Reduzir movimento'}</span>
          </button>

          {/* Som Ambiente (Opcional, com mute explícito) */}
          <button
            type="button"
            onClick={onToggleAudio}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded-[16px] border-2 transition-colors cursor-pointer text-xs sm:text-sm font-medium ${
              isAudioActive
                ? 'border-[#07614C] bg-[#07614C]/10 text-[#07614C]'
                : 'border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22]'
            }`}
            aria-pressed={isAudioActive}
            aria-label={isAudioActive ? 'Silenciar som do rio' : 'Ouvir som do rio'}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-4 h-4 text-[#07614C]" strokeWidth={2} />
                <span>Som ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#6B6B63]" strokeWidth={2} />
                <span>Som mudo</span>
              </>
            )}
          </button>
        </div>

        {/* Botão Encerrar Experiência */}
        <button
          type="button"
          onClick={onEndExperience}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-[16px] border-2 border-[#96551F] bg-[#FDFAF4] text-[#96551F] hover:bg-[#F1E9DB] active:bg-[#F1E9DB] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
          <span>Encerrar experiência</span>
        </button>
      </div>
    </div>
  );
};
