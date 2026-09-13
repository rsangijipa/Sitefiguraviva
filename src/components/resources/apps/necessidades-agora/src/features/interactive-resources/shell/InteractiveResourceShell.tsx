/**
 * InteractiveResourceShell - Casca Canônica para Recursos Interativos do Instituto Figura Viva
 * Registro Confluência
 *
 * Provê cabeçalho interno compacto, controles de acessibilidade (áudio, reduced-motion),
 * contenção do estágio de interação, diálogo de saída não destrutivo e área de conclusão.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Info,
} from 'lucide-react';
import { ResourceStageState } from '../../../types';
import { audioManager } from '../../../lib/audio';

interface InteractiveResourceShellProps {
  title: string;
  subtitle?: string;
  stageState: ResourceStageState;
  onBackToCatalog: () => void;
  onExitExperience: () => void;
  hasUnsavedChanges?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  completion?: React.ReactNode;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  title,
  subtitle,
  stageState,
  onBackToCatalog,
  onExitExperience,
  hasUnsavedChanges = false,
  onRetry,
  errorMessage,
  children,
  controls,
  completion,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  useEffect(() => {
    // Detectar preferência do sistema para reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleAudioToggle = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioManager.setMuted(nextMuted);
    if (!nextMuted) {
      audioManager.playGentleChime(528, 0.4);
    }
  };

  const handleAttemptExit = () => {
    if (hasUnsavedChanges && stageState !== 'completed') {
      setShowExitModal(true);
    } else {
      onExitExperience();
    }
  };

  const confirmExitWithoutSaving = () => {
    setShowExitModal(false);
    onExitExperience();
  };

  return (
    <div
      id="interactive-resource-shell"
      className={`h-full min-h-0 bg-[#FDFAF4] text-[#262B22] flex flex-col ${
        reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      {/* 1. ResourceHeader: Cabeçalho interno compacto com Confluência Accent */}
      <header
        id="resource-header"
        className="hidden"
        aria-hidden="true"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-to-catalog"
              type="button"
              onClick={handleAttemptExit}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#005A1F] hover:bg-[#F1E9DB] border-2 border-transparent hover:border-[#D8CFBE] transition-colors focus-visible:ring-2 focus-visible:ring-[#005A1F] min-h-[44px]"
              aria-label="Voltar para a biblioteca de recursos"
            >
              <ArrowLeft className="w-5 h-5 stroke-2 text-[#005A1F]" />
              <span className="hidden sm:inline">Recursos</span>
            </button>

            <div className="h-5 w-px bg-[#D8CFBE]" aria-hidden="true" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-bold text-[#005A1F] tracking-tight leading-tight">
                  {title}
                </h1>
                <span
                  className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE]"
                  title="Registro Confluência - Práticas de percepção e presença"
                >
                  Confluência
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-[#6B6B63] hidden sm:block truncate max-w-md">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Controles de cabeçalho: Privacidade, Áudio, Movimento, Encerrar */}
          <div className="flex items-center gap-2">
            <button
              id="btn-privacy-info"
              type="button"
              onClick={() => setShowPrivacyNotice(true)}
              className="p-2 rounded-xl text-[#6B6B63] hover:text-[#005A1F] hover:bg-[#F1E9DB] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Informações sobre privacidade deste recurso"
              title="Privacidade privada"
            >
              <Info className="w-5 h-5 stroke-2" />
            </button>

            <button
              id="btn-toggle-audio"
              type="button"
              onClick={handleAudioToggle}
              className={`p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isAudioMuted
                  ? 'text-[#6B6B63] hover:bg-[#F1E9DB]'
                  : 'text-[#005A1F] bg-[#F1E9DB] border border-[#005A1F]'
              }`}
              aria-label={isAudioMuted ? 'Ativar som sutil' : 'Silenciar áudio'}
              title={isAudioMuted ? 'Áudio desativado' : 'Áudio ativado'}
            >
              {isAudioMuted ? (
                <VolumeX className="w-5 h-5 stroke-2" />
              ) : (
                <Volume2 className="w-5 h-5 stroke-2 text-[#005A1F]" />
              )}
            </button>

            <button
              id="btn-exit-experience"
              type="button"
              onClick={handleAttemptExit}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#96551F] hover:text-[#262B22] bg-[#F1E9DB] hover:bg-[#D8CFBE] border-2 border-[#D8CFBE] transition-colors min-h-[44px] flex items-center justify-center whitespace-nowrap"
            >
              Encerrar experiência
            </button>
          </div>
        </div>

        {/* Linha de acento Gradiente Confluência: Aurora -> Vazante -> Broto (delicada, 2px) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] gradient-confluencia-line pointer-events-none"
          aria-hidden="true"
        />
      </header>

      {/* 2. ResourceStage: Conteúdo principal da experiência */}
      <main id="resource-stage" className="flex-1 flex flex-col">
        {stageState === 'loading' && (
          <div
            id="stage-state-loading"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="w-10 h-10 border-3 border-[#005A1F] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-base text-[#262B22] font-medium">
              Preparando o espaço de observação...
            </p>
          </div>
        )}

        {stageState === 'error' && (
          <div
            id="stage-state-error"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto"
            role="alert"
          >
            <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center mb-4 text-[#96551F]">
              <AlertCircle className="w-6 h-6 stroke-2" />
            </div>
            <h2 className="font-heading text-xl font-bold text-[#005A1F] mb-2">
              Não foi possível carregar esta experiência
            </h2>
            <p className="text-sm text-[#4B4B49] mb-6">
              {errorMessage || 'Tente novamente para retomar a exploração de necessidades.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4 stroke-2" />
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {stageState === 'completed' && completion ? (
          <div id="stage-state-completed" className="flex-1 flex flex-col">
            {completion}
          </div>
        ) : (
          (stageState === 'ready' || stageState === 'active' || stageState === 'paused') && (
            <div className="flex-1 flex flex-col w-full">{children}</div>
          )
        )}
      </main>

      {/* 3. ResourceControls: Rodapé de ações contextuais fixas ou contextuais */}
      {controls && (
        <div
          id="resource-controls"
          className="bg-[#FDFAF4] border-t-2 border-[#D8CFBE] p-4 sm:px-8 z-20"
        >
          <div className="max-w-7xl mx-auto">{controls}</div>
        </div>
      )}

      {/* Diálogo de Saída Não-Destrutivo com Foco Previsível */}
      {showExitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
        >
          <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#96551F] p-6 max-w-md w-full text-left">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center shrink-0 text-[#96551F]">
                <AlertCircle className="w-5 h-5 stroke-2" />
              </div>
              <div>
                <h3
                  id="exit-dialog-title"
                  className="font-heading text-lg font-bold text-[#005A1F]"
                >
                  Encerrar experiência?
                </h3>
                <p className="text-sm text-[#4B4B49] mt-1 leading-relaxed">
                  Ao sair sem salvar, as escolhas que você marcou nesta sessão não
                  ficarão guardadas no seu histórico. Você pode continuar ou sair livremente.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-6 pt-4 border-t-2 border-[#D8CFBE]">
              <button
                type="button"
                onClick={confirmExitWithoutSaving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-sm font-medium text-[#96551F] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
              >
                Sair sem salvar
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setShowExitModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
              >
                Continuar aqui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo Informativo de Privacidade */}
      {showPrivacyNotice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
        >
          <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#005A1F] p-6 max-w-md w-full text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#005A1F]">
                <Eye className="w-5 h-5 stroke-2 text-[#005A1F]" />
                <h3
                  id="privacy-dialog-title"
                  className="font-heading text-lg font-bold text-[#005A1F]"
                >
                  Privacidade no Instituto Figura Viva
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyNotice(false)}
                className="p-1 rounded-lg text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fechar diálogo de privacidade"
              >
                <X className="w-5 h-5 stroke-2" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#4B4B49] leading-relaxed">
              <p>
                <strong>Você pode experimentar sem salvar.</strong> Para guardar no
                seu histórico, basta escolher <em>Salvar</em> ao finalizar a revisão.
              </p>
              <p>
                Este registro fica no seu histórico privado. Professores, tutores e
                outros alunos não têm acesso por esta ferramenta.
              </p>
              <p className="text-xs text-[#6B6B63] pt-2 border-t border-[#D8CFBE]">
                Não utilizamos inteligência artificial, diagnósticos automatizados ou
                classificações clínicas sobre as suas respostas.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#D8CFBE] flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyNotice(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
