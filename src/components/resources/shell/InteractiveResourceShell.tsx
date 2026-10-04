import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Eye, AlertCircle, RefreshCw, X } from 'lucide-react';
import { ShellState, ResourceCategory } from '../types';
import { audioService } from '../services/audioService';

interface ResourceHeaderProps {
  title: string;
  category: ResourceCategory;
  subtitle?: string;
  onBack: () => void;
  onCloseExperience: () => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  hasAudioFeature?: boolean;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title,
  category,
  subtitle,
  onBack,
  onCloseExperience,
  isReducedMotion,
  onToggleReducedMotion,
  isAudioMuted,
  onToggleAudio,
  hasAudioFeature = true,
}) => {
  return (
    <header
      id="resource-header"
      className="w-full bg-[#FDFAF4] border-b-2 border-[#F1E9DB] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 select-none"
    >
      <div className="flex items-center gap-3">
        <button
          id="btn-back-to-resources"
          onClick={onBack}
          aria-label="Voltar para o catálogo de Recursos Interativos"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#005A1F] hover:bg-[#F1E9DB] active:bg-[#E9E3D5] text-sm font-medium transition-colors min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5 text-[#005A1F] stroke-[2]" />
          <span className="hidden sm:inline">Recursos</span>
        </button>

        <div className="h-5 w-[2px] bg-[#D8CFBE] hidden sm:block" />

        <div>
          <div className="flex items-center gap-2">
            <span
              id="resource-category-tag"
              className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F1E9DB] text-[#262B22] border border-[#D8CFBE] uppercase"
            >
              {category}
            </span>
            <h1
              id="resource-title"
              className="text-lg sm:text-xl font-semibold text-[#262B22] font-fraunces leading-tight"
            >
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-[#6B6B63] mt-0.5 max-w-md line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Toggle de Áudio */}
        {hasAudioFeature && (
          <button
            id="btn-toggle-audio"
            onClick={onToggleAudio}
            aria-label={isAudioMuted ? 'Ativar ressonância sonora sutil' : 'Silenciar áudio'}
            title={isAudioMuted ? 'Ativar som' : 'Silenciar'}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border-2 border-[#D8CFBE] text-[#262B22] hover:bg-[#F1E9DB] active:bg-[#E9E3D5] transition-colors min-h-[44px] min-w-[44px]"
          >
            {isAudioMuted ? (
              <VolumeX className="w-5 h-5 text-[#6B6B63] stroke-[2]" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#005A1F] stroke-[2]" />
            )}
            <span className="sr-only">{isAudioMuted ? 'Áudio desativado' : 'Áudio ativado'}</span>
          </button>
        )}

        {/* Toggle de Movimento Reduzido */}
        <button
          id="btn-toggle-reduced-motion"
          onClick={onToggleReducedMotion}
          aria-label={isReducedMotion ? 'Movimento reduzido ativo. Clique para reativar animações suaves.' : 'Ativar movimento reduzido para acessibilidade'}
          title={isReducedMotion ? 'Animações reduzidas' : 'Reduzir movimento'}
          className={`inline-flex items-center justify-center p-2.5 rounded-xl border-2 transition-colors min-h-[44px] min-w-[44px] ${
            isReducedMotion
              ? 'border-[#005A1F] bg-[#F1E9DB] text-[#005A1F]'
              : 'border-[#D8CFBE] text-[#262B22] hover:bg-[#F1E9DB]'
          }`}
        >
          <Eye className="w-5 h-5 stroke-[2]" />
          <span className="sr-only">
            {isReducedMotion ? 'Movimento reduzido ativado' : 'Movimento padrão'}
          </span>
        </button>

        {/* Botão Encerrar Experiência (respeitando o princípio: não transformar subjetividade em pontuação) */}
        <button
          id="btn-close-experience"
          onClick={onCloseExperience}
          aria-label="Encerrar experiência"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#96551F] text-[#96551F] hover:bg-[#F1E9DB] active:bg-[#E9E3D5] text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
        >
          <X className="w-4 h-4 text-[#96551F] stroke-[2]" />
          <span>Encerrar experiência</span>
        </button>
      </div>
    </header>
  );
};

interface ResourceStageProps {
  state: ShellState;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const ResourceStage: React.FC<ResourceStageProps> = ({ state, onRetry, children }) => {
  if (state === 'loading') {
    return (
      <div
        id="resource-stage-loading"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FDFAF4]"
        role="status"
        aria-live="polite"
      >
        <div className="w-12 h-12 rounded-full border-4 border-[#F1E9DB] border-t-[#005A1F] animate-spin mb-4" />
        <h2 className="text-lg font-semibold font-fraunces text-[#262B22] mb-1">
          Preparando o espaço de percepção...
        </h2>
        <p className="text-sm text-[#6B6B63] max-w-sm">
          Um instante para acolher a respiração e acomodar os sentidos.
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        id="resource-stage-error"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FDFAF4]"
        role="alert"
      >
        <div className="w-12 h-12 rounded-full bg-[#F1E9DB] flex items-center justify-center mb-4 text-[#96551F]">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>
        <h2 className="text-lg font-semibold font-fraunces text-[#262B22] mb-1">
          Não foi possível carregar a experiência
        </h2>
        <p className="text-sm text-[#6B6B63] max-w-sm mb-4">
          Houve uma interrupção passageira. Seus dados e anotações permanecem protegidos.
        </p>
        {onRetry && (
          <button
            id="btn-retry-experience"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] font-medium text-sm hover:opacity-95 transition-opacity min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4 stroke-[2]" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div
        id="resource-stage-empty"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FDFAF4]"
      >
        <p className="text-[#6B6B63] text-sm">Nenhum elemento selecionado no momento.</p>
      </div>
    );
  }

  return (
    <main
      id="resource-stage-content"
      className="flex-1 flex flex-col overflow-y-auto bg-[#FDFAF4] relative"
    >
      {children}
    </main>
  );
};

interface ResourceControlsProps {
  children?: React.ReactNode;
}

export const ResourceControls: React.FC<ResourceControlsProps> = ({ children }) => {
  if (!children) return null;
  return (
    <footer
      id="resource-controls-bar"
      className="w-full bg-[#FDFAF4] border-t-2 border-[#F1E9DB] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3"
    >
      {children}
    </footer>
  );
};

interface InteractiveResourceShellProps {
  title: string;
  category: ResourceCategory;
  subtitle?: string;
  state: ShellState;
  onBack: () => void;
  onCloseExperience: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
  controls?: React.ReactNode;
  liveMessage?: string;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  title,
  category,
  subtitle,
  state,
  onBack,
  onCloseExperience,
  onRetry,
  children,
  controls,
  liveMessage,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Detecta preferência do sistema para movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setIsAudioMuted(audioService.getIsMuted());
  }, []);

  const handleToggleAudio = () => {
    const muted = audioService.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleToggleReducedMotion = () => {
    setIsReducedMotion((prev) => !prev);
  };

  return (
    <div
      id="interactive-resource-shell"
      className={`flex flex-col w-full h-full min-h-0 bg-[#FDFAF4] text-[#262B22] overflow-hidden ${
        isReducedMotion ? 'motion-reduce' : ''
      }`}
    >
      {/* Região Acessível Live para leitores de tela */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="accessibility-live-region">
        {liveMessage}
      </div>

      <div className="hidden" aria-hidden="true">
      <ResourceHeader
        title={title}
        category={category}
        subtitle={subtitle}
        onBack={onBack}
        onCloseExperience={onCloseExperience}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
      />
      </div>

      <ResourceStage state={state} onRetry={onRetry}>
        {children}
      </ResourceStage>

      {controls && <ResourceControls>{controls}</ResourceControls>}
    </div>
  );
};
