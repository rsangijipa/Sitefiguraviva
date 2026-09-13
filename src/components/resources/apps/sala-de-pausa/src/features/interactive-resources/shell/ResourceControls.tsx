/**
 * @license
 * Instituto Figura Viva - ResourceControls (Registro Confluência)
 * Barra de controles de interação com alvos touch >= 44x44, sem dependência de hover.
 * Botão "Encerrar experiência" (nunca "Concluir com sucesso").
 */

import React from 'react';
import { Play, Pause, Square, RefreshCw, XCircle } from 'lucide-react';
import { ResourceState } from '../../../types';

interface ResourceControlsProps {
  state: ResourceState;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEndExperience: () => void; // "Encerrar experiência"
  onSwitchPractice?: () => void;
  switchLabel?: string;
  startLabel?: string;
  resumeLabel?: string;
  isPaused?: boolean;
}

export const ResourceControls: React.FC<ResourceControlsProps> = ({
  state,
  onStart,
  onPause,
  onResume,
  onEndExperience,
  onSwitchPractice,
  switchLabel = 'Trocar prática',
  startLabel = 'Começar pausa',
  resumeLabel = 'Retomar',
  isPaused = false,
}) => {
  return (
    <footer 
      id="resource-controls"
      className="w-full bg-[#FDFAF4] border-t-2 border-[#D8CFBE] px-4 py-3 sm:py-4 sticky bottom-0 z-20"
      role="toolbar"
      aria-label="Controles da experiência"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Lado Esquerdo: Trocar de prática / Alternar */}
        <div>
          {onSwitchPractice && (
            <button
              id="btn-switch-practice"
              type="button"
              onClick={onSwitchPractice}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[#96551F] border-2 border-[#96551F]/40 hover:bg-[#F1E9DB] active:bg-[#D8CFBE] transition-colors min-h-[44px] min-w-[44px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#96551F]"
              aria-label={switchLabel}
            >
              <RefreshCw className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>{switchLabel}</span>
            </button>
          )}
        </div>

        {/* Centro / Lado Direito: Ações principais de fluxo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Começar */}
          {state === 'ready' && onStart && (
            <button
              id="btn-start-experience"
              type="button"
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] active:bg-[#005A1F] font-medium transition-colors min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <Play className="w-5 h-5 fill-current" strokeWidth={2} />
              <span>{startLabel}</span>
            </button>
          )}

          {/* Pausar / Retomar durante atividade ativa */}
          {state === 'active' && onPause && (
            <button
              id="btn-pause-experience"
              type="button"
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] active:bg-[#D8CFBE] font-medium transition-colors min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <Pause className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
              <span>Pausar</span>
            </button>
          )}

          {/* Retomar se pausado */}
          {isPaused && onResume && (
            <button
              id="btn-resume-experience"
              type="button"
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] active:bg-[#005A1F] font-medium transition-colors min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <Play className="w-5 h-5 fill-current" strokeWidth={2} />
              <span>{resumeLabel}</span>
            </button>
          )}

          {/* Botão Mandatório: Encerrar experiência (nunca "concluir com sucesso") */}
          {(state === 'active' || isPaused || state === 'ready') && (
            <button
              id="btn-end-experience"
              type="button"
              onClick={onEndExperience}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#4B4B49] hover:text-[#96551F] hover:bg-[#F1E9DB] active:bg-[#D8CFBE] border-2 border-transparent hover:border-[#D8CFBE] transition-colors min-h-[44px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#96551F]"
              aria-label="Encerrar experiência atual sem cobrança"
            >
              <XCircle className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>Encerrar experiência</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
