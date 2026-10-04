import React from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Pause,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { MicroappState } from '../../types';

interface InteractiveResourceShellProps {
  title: string;
  category: string;
  durationApprox?: string;
  state: MicroappState;
  onBackToResources: () => void;
  onEndExperience: () => void;
  onResetExperience?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isTextAlternativeOpen?: boolean;
  onToggleTextAlternative?: () => void;
  isReducedMotionActive?: boolean;
  onToggleReducedMotion?: () => void;
  onTogglePause?: () => void;
  errorMessage?: string;
  headerRightContent?: React.ReactNode;
  secondaryContextPanel?: React.ReactNode;
  children: React.ReactNode;
  controlsContent?: React.ReactNode;
  completionContent?: React.ReactNode;
}

export function InteractiveResourceShell({
  title,
  category,
  durationApprox,
  state,
  onBackToResources,
  onEndExperience,
  onResetExperience,
  isMuted = true,
  onToggleMute,
  isTextAlternativeOpen = false,
  onToggleTextAlternative,
  isReducedMotionActive = false,
  onToggleReducedMotion,
  onTogglePause,
  errorMessage,
  headerRightContent,
  secondaryContextPanel,
  children,
  controlsContent,
  completionContent,
}: InteractiveResourceShellProps) {
  return (
    <div
      id="interactive-resource-shell"
      className="h-full min-h-0 bg-[#FDFAF4] text-[#262B22] flex flex-col justify-between overflow-x-hidden"
    >
      {/* 1. RESOURCE HEADER */}
      <header
        id="resource-header"
        className="hidden"
        aria-hidden="true"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Voltar e Identificação */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="btn-back-to-catalog"
              onClick={onBackToResources}
              aria-label="Voltar para a página de Recursos Interativos"
              className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#005A1F] hover:bg-[#FDFAF4] hover:border-[#005A1F] focus:outline-none focus:ring-2 focus:ring-[#005A1F] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-2 text-[#005A1F]" />
              <span className="text-sm font-semibold tracking-tight hidden sm:inline">Recursos</span>
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
                  {category}
                </span>
                {durationApprox && (
                  <>
                    <span className="text-[#6B6B63] text-xs" aria-hidden="true">•</span>
                    <span className="text-xs text-[#6B6B63]">{durationApprox}</span>
                  </>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-serif text-[#262B22] truncate tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Ferramentas de Acessibilidade & Encerrar Experiência */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Áudio Opcional */}
            {onToggleMute && (
              <button
                id="btn-toggle-audio"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Ativar sonoridade ambiente' : 'Silenciar sonoridade ambiente'}
                className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                  !isMuted
                    ? 'bg-[#FDFAF4] border-[#005A1F] text-[#005A1F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#6B6B63] hover:text-[#262B22]'
                }`}
              >
                {!isMuted ? (
                  <Volume2 className="w-5 h-5 stroke-2 text-[#005A1F]" />
                ) : (
                  <VolumeX className="w-5 h-5 stroke-2 text-[#6B6B63]" />
                )}
                <span className="text-xs font-medium hidden md:inline">
                  {!isMuted ? 'Som ativo' : 'Silenciado'}
                </span>
              </button>
            )}

            {/* Alternativa Textual (Acessibilidade) */}
            {onToggleTextAlternative && (
              <button
                id="btn-toggle-text-alt"
                onClick={onToggleTextAlternative}
                aria-label="Alternar modo de lista textual acessível"
                className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                  isTextAlternativeOpen
                    ? 'bg-[#FDFAF4] border-[#96551F] text-[#96551F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#6B6B63] hover:text-[#262B22]'
                }`}
              >
                <Eye className="w-5 h-5 stroke-2 text-[#96551F]" />
                <span className="text-xs font-medium hidden lg:inline">Modo Textual</span>
              </button>
            )}

            {/* Redução de Movimento */}
            {onToggleReducedMotion && (
              <button
                id="btn-toggle-reduced-motion"
                onClick={onToggleReducedMotion}
                aria-label={
                  isReducedMotionActive
                    ? 'Movimento reduzido ativado'
                    : 'Ativar modo de redução de movimento'
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                  isReducedMotionActive
                    ? 'bg-[#FDFAF4] border-[#005A1F] text-[#005A1F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#6B6B63]'
                }`}
              >
                <Sliders className="w-5 h-5 stroke-2 text-[#005A1F]" />
                <span className="text-xs font-medium hidden xl:inline">
                  {isReducedMotionActive ? 'Movimento reduzido' : 'Movimento padrão'}
                </span>
              </button>
            )}

            {/* Pausar / Continuar quando aplicável */}
            {onTogglePause && (state === 'active' || state === 'paused') && (
              <button
                id="btn-toggle-pause"
                onClick={onTogglePause}
                aria-label={state === 'paused' ? 'Retomar experiência' : 'Pausar experiência'}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#262B22] hover:border-[#005A1F] focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
              >
                {state === 'paused' ? (
                  <Play className="w-5 h-5 stroke-2 text-[#005A1F]" />
                ) : (
                  <Pause className="w-5 h-5 stroke-2 text-[#96551F]" />
                )}
                <span className="text-xs font-medium hidden sm:inline">
                  {state === 'paused' ? 'Retomar' : 'Pausar'}
                </span>
              </button>
            )}

            {headerRightContent}

            {/* BOTÃO OBRIGATÓRIO: "Encerrar experiência" */}
            <button
              id="btn-end-experience"
              onClick={onEndExperience}
              className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#96551F] text-[#96551F] font-semibold text-sm hover:bg-[#F1E9DB] focus:outline-none focus:ring-2 focus:ring-[#96551F] transition-colors"
            >
              Encerrar experiência
            </button>
          </div>
        </div>

        {/* Gradiente Confluência discreto de transição na base do cabeçalho */}
        <div className="w-full h-[2px] gradient-confluencia mt-2" aria-hidden="true" />
      </header>

      {/* 2. RESOURCE STAGE & SECONDARY PANEL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4">
        {/* ESTADOS ESPECÍFICOS DO SISTEMA */}
        {state === 'error' && (
          <div
            id="state-error-alert"
            role="alert"
            className="w-full p-4 rounded-[24px] bg-[#FDFAF4] border-2 border-[#FE538B] text-[#262B22] flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 stroke-2 text-[#96551F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-bold text-base font-serif text-[#262B22]">
                Aviso sobre a experiência
              </h2>
              <p className="text-sm text-[#4B4B49] mt-1">
                {errorMessage ||
                  'Houve uma instabilidade temporária ao carregar o recurso. Você pode tentar reiniciar.'}
              </p>
              {onResetExperience && (
                <button
                  id="btn-retry-experience"
                  onClick={onResetExperience}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[16px] bg-[#F1E9DB] border-2 border-[#005A1F] text-[#005A1F] font-medium text-sm hover:bg-[#FDFAF4]"
                >
                  <RotateCcw className="w-4 h-4 stroke-2 text-[#005A1F]" />
                  <span>Tentar novamente</span>
                </button>
              )}
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div
            id="state-loading-spinner"
            className="w-full h-72 sm:h-96 rounded-[24px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex flex-col items-center justify-center p-6 text-center"
            aria-live="polite"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#D8CFBE] border-t-[#005A1F] animate-spin mb-4" />
            <p className="font-serif text-lg font-bold text-[#262B22]">Preparando o espaço...</p>
            <p className="text-sm text-[#6B6B63] max-w-sm mt-1">
              Ajustando as camadas do jardim e harmonizando os elementos da experiência.
            </p>
          </div>
        )}

        {state === 'completed' && completionContent ? (
          <div id="state-completed-view" className="w-full">
            {completionContent}
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-5">
            {/* Palco Principal Interativo */}
            <div className="flex-1 flex flex-col min-w-0">
              <div
                id="resource-stage"
                className="relative flex-1 w-full bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] p-2 sm:p-4 min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] flex flex-col justify-between"
              >
                {children}
              </div>

              {/* 3. RESOURCE CONTROLS */}
              {controlsContent && (
                <div
                  id="resource-controls"
                  className="w-full mt-3 sm:mt-4 p-3 sm:p-4 bg-[#F1E9DB] rounded-[24px] border-2 border-[#D8CFBE]"
                >
                  {controlsContent}
                </div>
              )}
            </div>

            {/* Painel Contextual Secundário (Opcional no Desktop, ocultável no Mobile) */}
            {secondaryContextPanel && (
              <aside
                id="secondary-context-panel"
                className="w-full lg:w-80 shrink-0 flex flex-col gap-4"
              >
                <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] p-4 sm:p-5">
                  {secondaryContextPanel}
                </div>
              </aside>
            )}
          </div>
        )}
      </main>

      {/* FOOTER DISCRETO DO INSTITUTO FIGURA VIVA */}
      <footer
        id="resource-footer"
        className="w-full bg-[#F1E9DB] border-t-2 border-[#D8CFBE] px-4 py-3 mt-auto"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B6B63]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#005A1F]">Instituto Figura Viva</span>
            <span aria-hidden="true">•</span>
            <span>Design System Confluência v1.0</span>
          </div>
          <p className="text-center sm:text-right">
            Espaço de acolhimento e escuta sem julgamento clínico ou métricas de desempenho.
          </p>
        </div>
      </footer>
    </div>
  );
}
