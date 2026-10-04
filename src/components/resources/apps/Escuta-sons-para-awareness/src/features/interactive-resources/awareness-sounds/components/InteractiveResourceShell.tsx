/**
 * InteractiveResourceShell - Arquitetura Padrão de Microapp Confluência
 * Instituto Figura Viva - Registro Confluência
 *
 * Estados obrigatórios:
 * - loading
 * - ready
 * - active
 * - paused
 * - completed
 * - empty
 * - error
 * - reduced-motion
 *
 * Botão obrigatório: "Encerrar experiência" (e nunca "Concluir com sucesso").
 */

import React from 'react';
import { ArrowLeft, Volume2, VolumeX, AlertCircle, RefreshCw, Sparkles, Pause, Play } from 'lucide-react';
import { ResourceMode } from '../types';

export type ShellState =
  | 'loading'
  | 'ready'
  | 'active'
  | 'paused'
  | 'completed'
  | 'empty'
  | 'error'
  | 'reduced-motion';

interface InteractiveResourceShellProps {
  state: ShellState;
  mode: ResourceMode;
  title: string;
  subtitle: string;
  onBackToCatalog: () => void;
  onEndExperience: () => void;
  onToggleAudioMute?: () => void;
  isMuted?: boolean;
  audioActive?: boolean;
  onRetry?: () => void;
  announcement?: string;
  children: React.ReactNode;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  state,
  mode,
  title,
  subtitle,
  onBackToCatalog,
  onEndExperience,
  onToggleAudioMute,
  isMuted = false,
  audioActive = false,
  onRetry,
  announcement,
  children,
}) => {
  return (
    <div
      id="interactive-resource-shell"
      className="w-full max-w-6xl mx-auto flex flex-col min-h-[calc(100dvh-5rem)] bg-[#FDFAF4] rounded-3xl border-2 border-[#D8CFBE] overflow-hidden transition-colors"
      role="region"
      aria-label="Experiência Interativa: Sons para Awareness"
    >
      {/* Indicador de Acento Confluência: Aurora -> Vazante -> Broto (Nunca invertido) */}
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[#FE538B] via-[#FED701] to-[#01C94D]"
        role="presentation"
        aria-hidden="true"
      />

      {/* Região ao vivo para leitores de tela sem sobrecarga de anúncios */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Cabeçalho Compacto do Microapp (ResourceHeader) */}
      <header
        id="resource-header"
        className="hidden"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-catalog"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#005A1F] hover:bg-[#F1E9DB] rounded-full transition-colors border border-[#D8CFBE] touch-target-min"
            aria-label="Voltar para a lista de Recursos Interativos"
          >
            <ArrowLeft className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
            <span>Recursos</span>
          </button>

          <div className="h-4 w-px bg-[#D8CFBE] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-semibold text-lg sm:text-xl text-[#005A1F] leading-tight">
                {title}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] font-medium tracking-wide">
                {mode === 'free' ? 'Exploração Livre' : mode === 'guided' ? 'Escuta Guiada' : 'Modo Textual'}
              </span>
            </div>
            <p className="text-xs text-[#6B6B63] hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Controles de Topo: Mudo, Status e Encerrar Experiência */}
        <div className="flex items-center gap-2">
          {mode !== 'text' && onToggleAudioMute && (
            <button
              id="btn-toggle-mute-header"
              onClick={onToggleAudioMute}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors touch-target-min ${
                isMuted
                  ? 'border-[#96551F] text-[#96551F] bg-[#F1E9DB]'
                  : 'border-[#D8CFBE] text-[#005A1F] hover:bg-[#F1E9DB]'
              }`}
              aria-label={isMuted ? 'Ativar som' : 'Silenciar áudio'}
              title={isMuted ? 'Áudio silenciado' : 'Áudio ativo'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              ) : (
                <Volume2 className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
              )}
              <span className="hidden md:inline">{isMuted ? 'Mutado' : 'Áudio'}</span>
            </button>
          )}

          {/* Botão Obrigatório: "Encerrar experiência" */}
          {state !== 'completed' && (
            <button
              id="btn-end-experience"
              onClick={onEndExperience}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#96551F] hover:text-[#262B22] hover:bg-[#F1E9DB] rounded-full border border-[#96551F] transition-colors touch-target-min"
              aria-label="Encerrar experiência e revisar percepções"
            >
              <span>Encerrar experiência</span>
            </button>
          )}
        </div>
      </header>

      {/* Área Principal de Estados */}
      <div id="resource-shell-body" className="flex-1 flex flex-col p-3 sm:p-6 relative">
        {state === 'loading' && (
          <div
            id="resource-state-loading"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            role="status"
          >
            <div className="w-12 h-12 rounded-full border-4 border-[#F1E9DB] border-t-[#005A1F] animate-spin mb-4" />
            <h2 className="font-heading text-lg font-medium text-[#005A1F] mb-1">
              Preparando campo acústico...
            </h2>
            <p className="text-sm text-[#6B6B63] max-w-sm">
              Carregando texturas sonoras e inicializando nós de espacialização.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div
            id="resource-state-error"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            role="alert"
          >
            <div className="w-14 h-14 rounded-full bg-[#F1E9DB] flex items-center justify-center text-[#96551F] mb-4">
              <AlertCircle className="w-8 h-8 text-[#96551F]" strokeWidth={2} />
            </div>
            <h2 className="font-heading text-xl font-semibold text-[#005A1F] mb-2">
              Não foi possível carregar o áudio no dispositivo
            </h2>
            <p className="text-sm text-[#4B4B49] max-w-md mb-6 leading-relaxed">
              Ocorreu uma restrição de reprodução de áudio no navegador. Você pode tentar novamente ou continuar pelo modo textual, sem áudio.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {onRetry && (
                <button
                  id="btn-retry-experience"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#005A1F] text-[#FDFAF4] text-sm font-medium hover:bg-[#07614C] transition-colors touch-target-min"
                >
                  <RefreshCw className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
                  <span>Tentar novamente</span>
                </button>
              )}
              <button
                id="btn-error-to-text-mode"
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] text-sm font-medium transition-colors touch-target-min"
              >
                <span>Voltar ao catálogo</span>
              </button>
            </div>
          </div>
        )}

        {state === 'empty' && (
          <div
            id="resource-state-empty"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <p className="text-base text-[#6B6B63] mb-4">
              Nenhuma cena sonora disponível no momento.
            </p>
            <button
              onClick={onBackToCatalog}
              className="px-4 py-2 text-sm rounded-full bg-[#F1E9DB] text-[#005A1F] border border-[#D8CFBE]"
            >
              Voltar aos Recursos
            </button>
          </div>
        )}

        {/* Estado operacional ativo/ready/paused/completed */}
        {state !== 'loading' && state !== 'error' && state !== 'empty' && (
          <div className="flex-1 flex flex-col h-full">{children}</div>
        )}
      </div>
    </div>
  );
};
