// @ts-nocheck -- imported Gemini experience keeps a narrower local state union.
import React from 'react';
import { ExperienceState } from '../../features/interactive-resources/thought-garden/types';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface InteractiveResourceShellProps {
  state: ExperienceState;
  errorMessage?: string | null;
  onRetry?: () => void;
  header: React.ReactNode;
  stage: React.ReactNode;
  controls?: React.ReactNode;
  completion?: React.ReactNode;
  className?: string;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  state,
  errorMessage,
  onRetry,
  header,
  stage,
  controls,
  completion,
  className = '',
}) => {
  return (
    <div
      className={`w-full min-h-[100dvh] max-h-[100dvh] flex flex-col bg-[#FDFAF4] text-[#262B22] selection:bg-[#F1E9DB] selection:text-[#005A1F] overflow-hidden ${className}`}
      data-resource-state={state}
    >
      {/* Cabeçalho do Microapp */}
      {header}

      {/* Estado: Loading */}
      {state === 'loading' && (
        <div
          role="status"
          aria-live="polite"
          className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full border-4 border-[#F1E9DB] border-t-[#005A1F] animate-spin mb-4" />
          <p className="text-base font-medium text-[#005A1F]">Preparando o jardim...</p>
        </div>
      )}

      {/* Estado: Error */}
      {state === 'error' && (
        <div
          role="alert"
          className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto"
        >
          <div className="w-14 h-14 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center text-[#96551F] mb-4">
            <AlertCircle className="w-8 h-8 stroke-[2px]" />
          </div>
          <h2 className="text-xl font-bold font-fraunces text-[#96551F] mb-2">
            Não foi possível carregar esta experiência
          </h2>
          <p className="text-sm text-[#4B4B49] mb-6">
            {errorMessage || 'Tente novamente. Nenhum dado em rascunho foi perdido.'}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005A1F] text-[#FDFAF4] rounded-full hover:bg-[#07614C] transition-colors min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2px]" />
              <span>Tentar novamente</span>
            </button>
          )}
        </div>
      )}

      {/* Estado: Completed */}
      {state === 'completed' && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {completion}
        </div>
      )}

      {/* Estados Operacionais da Experiência: Intro / Ready / Active / Empty / Paused */}
      {state !== 'loading' && state !== 'error' && state !== 'completed' && (
        <>
          {stage}
          {controls}
        </>
      )}
    </div>
  );
};
