/**
 * @license
 * Instituto Figura Viva - ResourceStage (Registro Confluência)
 * Palco central de interação (máx 800px em desktop, tela fluida em mobile).
 * Acolhe os estados: loading, ready, active, paused, empty, error.
 */

import React from 'react';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { ResourceState } from '../../../types';

interface ResourceStageProps {
  state: ResourceState;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  secondaryPanel?: React.ReactNode;
}

export const ResourceStage: React.FC<ResourceStageProps> = ({
  state,
  errorMessage,
  onRetry,
  children,
  secondaryPanel,
}) => {
  return (
    <main 
      id="resource-stage"
      className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col items-center justify-center relative"
      role="region"
      aria-label="Área principal da experiência interativa"
    >
      {/* Estado: Loading */}
      {state === 'loading' && (
        <div 
          id="stage-loading"
          className="flex flex-col items-center justify-center p-12 text-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-10 h-10 text-[#005A1F] animate-spin mb-4" strokeWidth={2} />
          <p className="font-serif text-lg text-[#005A1F] font-semibold">
            Preparando a experiência...
          </p>
          <p className="text-sm text-[#6B6B63] mt-1 font-sans">
            Ajustando o ambiente ao seu ritmo.
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {state === 'error' && (
        <div 
          id="stage-error"
          className="w-full max-w-lg bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] p-6 text-center"
          role="alert"
        >
          <AlertCircle className="w-10 h-10 text-[#96551F] mx-auto mb-3" strokeWidth={2} />
          <h2 className="text-xl font-serif font-bold text-[#96551F]">
            Não foi possível carregar esta experiência
          </h2>
          <p className="text-sm text-[#4B4B49] mt-2 mb-5 font-sans">
            {errorMessage || 'Houve uma oscilação na conexão com o portal. Seu estado anterior não foi perdido.'}
          </p>
          {onRetry && (
            <button
              id="btn-retry-stage"
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] font-medium hover:bg-[#07614C] transition-colors min-h-[44px]"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Estado: Empty */}
      {state === 'empty' && (
        <div 
          id="stage-empty"
          className="w-full max-w-lg bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-8 text-center"
        >
          <Sparkles className="w-10 h-10 text-[#005A1F] mx-auto mb-3" strokeWidth={2} />
          <h2 className="text-xl font-serif font-bold text-[#005A1F]">
            Nenhuma atividade selecionada
          </h2>
          <p className="text-sm text-[#6B6B63] mt-2">
            Escolha uma prática para começar seu momento de presença.
          </p>
        </div>
      )}

      {/* Estado Normal: Ready, Active, Paused, Completed */}
      {state !== 'loading' && state !== 'error' && state !== 'empty' && (
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          {/* Palco central de interação: foco principal */}
          <div className="w-full max-w-[800px] flex flex-col items-center">
            {children}
          </div>

          {/* Painel contextual secundário opcional em Desktop */}
          {secondaryPanel && (
            <aside 
              id="stage-secondary-panel"
              className="hidden lg:block w-72 shrink-0 bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-5 self-stretch"
              aria-label="Painel de apoio contextual"
            >
              {secondaryPanel}
            </aside>
          )}
        </div>
      )}
    </main>
  );
};
