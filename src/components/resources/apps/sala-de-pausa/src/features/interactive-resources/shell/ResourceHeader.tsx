/**
 * @license
 * Instituto Figura Viva - ResourceHeader (Registro Confluência)
 * Cabeçalho interno compacto, botão voltar, título do recurso, status e controles de acessibilidade.
 */

import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Eye, EyeOff, Sliders, ShieldCheck } from 'lucide-react';
import { ResourceState } from '../../../types';

interface ResourceHeaderProps {
  title: string;
  categoryLabel?: string;
  state: ResourceState;
  onBackToCatalog: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  supportsAudio?: boolean;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
  hideTimer?: boolean;
  onToggleHideTimer?: () => void;
  supportsTimerHiding?: boolean;
  badgeLabel?: string;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title,
  categoryLabel = 'Recurso Confluência',
  state,
  onBackToCatalog,
  isMuted = false,
  onToggleMute,
  supportsAudio = false,
  reducedMotion = false,
  onToggleReducedMotion,
  hideTimer = false,
  onToggleHideTimer,
  supportsTimerHiding = false,
  badgeLabel,
}) => {
  return (
    <header 
      id="resource-header"
      className="hidden"
      aria-hidden="true"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Esquerda: Voltar e Título */}
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-recursos"
            type="button"
            onClick={onBackToCatalog}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#005A1F] hover:bg-[#F1E9DB] border-2 border-transparent hover:border-[#005A1F] transition-all min-h-[44px] min-w-[44px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            aria-label="Voltar para a lista de Recursos Interativos"
          >
            <ArrowLeft className="w-5 h-5 text-[#005A1F]" strokeWidth={2} />
            <span className="hidden md:inline font-sans">Voltar aos Recursos</span>
          </button>

          <div className="h-6 w-[2px] bg-[#D8CFBE] hidden sm:block" aria-hidden="true" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#96551F] font-medium">
                {categoryLabel}
              </span>
              {badgeLabel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1E9DB] text-[#005A1F] border border-[#005A1F]/30">
                  {badgeLabel}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#005A1F] leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Direita: Controles de ambiente, áudio e acessibilidade */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
          {/* Ocultar timer / foco */}
          {supportsTimerHiding && onToggleHideTimer && (
            <button
              id="btn-toggle-timer-display"
              type="button"
              onClick={onToggleHideTimer}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
                hideTimer 
                  ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]' 
                  : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
              }`}
              title={hideTimer ? 'Mostrar contagem' : 'Ocultar contagem'}
              aria-label={hideTimer ? 'Mostrar tempo' : 'Ocultar tempo'}
            >
              {hideTimer ? (
                <>
                  <EyeOff className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
                  <span className="hidden sm:inline">Tempo oculto</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-[#4B4B49]" strokeWidth={2} />
                  <span className="hidden sm:inline">Tempo visível</span>
                </>
              )}
            </button>
          )}

          {/* Movimento Reduzido */}
          {onToggleReducedMotion && (
            <button
              id="btn-toggle-reduced-motion"
              type="button"
              onClick={onToggleReducedMotion}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
                reducedMotion
                  ? 'bg-[#F1E9DB] border-[#96551F] text-[#96551F]'
                  : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
              }`}
              title={reducedMotion ? 'Movimento reduzido ativado' : 'Alternar movimento reduzido'}
              aria-label="Alternar movimento reduzido"
            >
              <Sliders className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">
                {reducedMotion ? 'Movimento calmo' : 'Movimento padrão'}
              </span>
            </button>
          )}

          {/* Mudo / Áudio (opcional) */}
          {supportsAudio && onToggleMute && (
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
                isMuted 
                  ? 'border-[#D8CFBE] text-[#6B6B63] hover:bg-[#F1E9DB]' 
                  : 'bg-[#F1E9DB] border-[#07614C] text-[#07614C]'
              }`}
              title={isMuted ? 'Ativar som suave' : 'Silenciar áudio'}
              aria-label={isMuted ? 'Ativar som suave' : 'Silenciar áudio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">Silencioso</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#07614C]" strokeWidth={2} />
                  <span className="hidden sm:inline">Som ativo</span>
                </>
              )}
            </button>
          )}

          {/* Indicador de Privacidade Confluência */}
          <div 
            className="hidden lg:flex items-center gap-1 px-2 py-1 text-xs text-[#6B6B63] bg-[#F1E9DB]/50 rounded-lg border border-[#D8CFBE]"
            title="Sua experiência é privada e local por padrão"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
            <span>Privado</span>
          </div>
        </div>
      </div>
    </header>
  );
};
