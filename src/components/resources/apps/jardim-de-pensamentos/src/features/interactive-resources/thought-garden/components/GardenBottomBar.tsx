import React from 'react';
import {
  Play,
  Pause,
  Eye,
  Wind,
  Compass,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Bookmark,
  Sparkles,
  Plus,
  Waves,
  Trees,
} from 'lucide-react';
import { GardenViewPreset, RightPanelState, WindIntensity } from '../types';

interface GardenBottomBarProps {
  leavesCount: number;
  savedCount: number;
  hasFloatingLeaves: boolean;
  isFloatingPaused: boolean;
  onTogglePauseFloating: () => void;
  reducedMotion: boolean;
  windIntensity: WindIntensity;
  onChangeWindIntensity: (intensity: WindIntensity) => void;
  viewPreset: GardenViewPreset;
  onChangeViewPreset: (preset: GardenViewPreset) => void;
  panelState: RightPanelState;
  onTogglePanelState: () => void;
  onTogglePanelWidth: () => void;
  onOpenSavedThoughts: () => void;
  onQuickAddThought: () => void;
  isMobile: boolean;
  mobileTab?: 'garden' | 'composer' | 'list';
  onSelectMobileTab?: (tab: 'garden' | 'composer' | 'list') => void;
}

export const GardenBottomBar: React.FC<GardenBottomBarProps> = ({
  leavesCount,
  savedCount,
  hasFloatingLeaves,
  isFloatingPaused,
  onTogglePauseFloating,
  reducedMotion,
  windIntensity,
  onChangeWindIntensity,
  viewPreset,
  onChangeViewPreset,
  panelState,
  onTogglePanelState,
  onTogglePanelWidth,
  onOpenSavedThoughts,
  onQuickAddThought,
  isMobile,
  mobileTab = 'garden',
  onSelectMobileTab,
}) => {
  // Próxima intensidade de brisa/vento
  const cycleWind = () => {
    if (windIntensity === 'calm') onChangeWindIntensity('gentle');
    else if (windIntensity === 'gentle') onChangeWindIntensity('breeze');
    else onChangeWindIntensity('calm');
  };

  const windLabels: Record<WindIntensity, { label: string; sub: string }> = {
    calm: { label: 'Brisa Suave', sub: 'Calma' },
    gentle: { label: 'Brisa Serena', sub: 'Média' },
    breeze: { label: 'Brisa Viva', sub: 'Forte' },
  };

  if (isMobile) {
    return (
      <footer className="w-full bg-[#FDFAF4] border-t-2 border-[#D8CFBE] px-3 py-2 flex flex-col gap-2 z-20">
        {/* Linha 1: Controles de Flutuação e Física reunidos */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {hasFloatingLeaves ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1E9DB] border border-[#D8CFBE] text-[11px] font-semibold text-[#005A1F] truncate">
                <Sparkles className="w-3 h-3 text-[#FED701] shrink-0" />
                <span className="truncate">Contemplação</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#6B6B63] font-medium px-2 py-1">
                {leavesCount} {leavesCount === 1 ? 'folha' : 'folhas'}
              </span>
            )}

            {!reducedMotion && hasFloatingLeaves && (
              <button
                type="button"
                onClick={onTogglePauseFloating}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] border border-[#D8CFBE] transition-colors min-h-[36px]"
                aria-label={isFloatingPaused ? 'Retomar flutuação' : 'Pausar flutuação'}
              >
                {isFloatingPaused ? (
                  <>
                    <Play className="w-3 h-3 fill-[#005A1F] text-[#005A1F]" />
                    <span>Retomar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 fill-[#96551F] text-[#96551F]" />
                    <span>Pausar</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={cycleWind}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-[#4B4B49] bg-[#FDFAF4] border border-[#D8CFBE] min-h-[36px]"
              title="Ajustar intensidade da física/brisa"
            >
              <Wind className="w-3 h-3 text-[#07614C]" />
              <span>{windLabels[windIntensity].sub}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSavedThoughts}
            className="p-2 text-[#005A1F] hover:bg-[#F1E9DB] rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center relative"
            aria-label="Ver pensamentos guardados"
          >
            <Bookmark className="w-4 h-4 stroke-[2px]" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FE538B]" />
            )}
          </button>
        </div>

        {/* Linha 2: Alternador de visualizações e abas Mobile */}
        {onSelectMobileTab && (
          <div className="flex items-center justify-center gap-1 bg-[#F1E9DB] p-1 rounded-full">
            <button
              type="button"
              onClick={() => onSelectMobileTab('garden')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors min-h-[38px] ${
                mobileTab === 'garden' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22]'
              }`}
            >
              Jardim ({leavesCount})
            </button>
            <button
              type="button"
              onClick={() => onSelectMobileTab('composer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors min-h-[38px] ${
                mobileTab === 'composer' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22]'
              }`}
            >
              Escrever
            </button>
            <button
              type="button"
              onClick={() => onSelectMobileTab('list')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors min-h-[38px] ${
                mobileTab === 'list' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#262B22]'
              }`}
            >
              Folhas
            </button>
          </div>
        )}
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#FDFAF4] border-t-2 border-[#D8CFBE] px-4 py-2.5 lg:px-6 shadow-2xs z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* GRUPO 1: Estado de Contemplação & Pausa das Folhas */}
        <div className="flex items-center gap-2.5">
          {hasFloatingLeaves ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1E9DB] border border-[#D8CFBE] text-xs font-semibold text-[#005A1F]">
              <Sparkles className="w-3.5 h-3.5 text-[#FED701]" />
              <Eye className="w-3.5 h-3.5 text-[#005A1F]" />
              <span>Folha em contemplação</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1E9DB]/60 border border-[#D8CFBE] text-xs font-medium text-[#6B6B63]">
              <span>Canteiro sereno ({leavesCount} {leavesCount === 1 ? 'folha' : 'folhas'})</span>
            </div>
          )}

          {/* Botão Pausar / Retomar Flutuação */}
          {!reducedMotion && (
            <button
              type="button"
              onClick={onTogglePauseFloating}
              disabled={!hasFloatingLeaves}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all min-h-[38px] ${
                hasFloatingLeaves
                  ? isFloatingPaused
                    ? 'bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] border-[#D8CFBE]'
                  : 'opacity-50 cursor-not-allowed bg-[#F1E9DB]/40 text-[#6B6B63] border-transparent'
              }`}
              title={
                !hasFloatingLeaves
                  ? 'Nenhuma folha em flutuação ativa no momento'
                  : isFloatingPaused
                  ? 'Retomar movimento de flutuação'
                  : 'Pausar movimento de flutuação'
              }
              aria-label={isFloatingPaused ? 'Retomar flutuação' : 'Pausar flutuação'}
            >
              {isFloatingPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#FDFAF4]" />
                  <span>Retomar flutuação</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-[#96551F] text-[#96551F]" />
                  <span>Pausar flutuação</span>
                </>
              )}
            </button>
          )}

          {/* Botão de Controle de Física & Brisa */}
          <button
            type="button"
            onClick={cycleWind}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-[#07614C] bg-[#F1E9DB]/70 hover:bg-[#F1E9DB] border border-[#D8CFBE] transition-colors min-h-[38px]"
            title="Alterar dinâmica da física (vento, água e partículas)"
            aria-label={`Dinâmica da física: ${windLabels[windIntensity].label}`}
          >
            <Wind className="w-3.5 h-3.5 text-[#07614C]" />
            <span>Física: <strong>{windLabels[windIntensity].label}</strong></span>
          </button>
        </div>

        {/* GRUPO 2: Navegação e Enquadramento do Jardim */}
        <div className="hidden md:flex items-center gap-1 bg-[#F1E9DB]/70 border border-[#D8CFBE] p-1 rounded-full">
          <span className="text-[11px] font-semibold text-[#96551F] px-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#96551F]" />
            <span>Navegar:</span>
          </span>

          <button
            type="button"
            onClick={() => onChangeViewPreset('panoramic')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all min-h-[32px] ${
              viewPreset === 'panoramic'
                ? 'bg-[#005A1F] text-[#FDFAF4] shadow-2xs'
                : 'text-[#4B4B49] hover:text-[#262B22] hover:bg-[#FDFAF4]'
            }`}
            title="Visão geral do jardim"
          >
            Panorâmica
          </button>

          <button
            type="button"
            onClick={() => onChangeViewPreset('stream')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all min-h-[32px] ${
              viewPreset === 'stream'
                ? 'bg-[#07614C] text-[#FDFAF4] shadow-2xs'
                : 'text-[#4B4B49] hover:text-[#262B22] hover:bg-[#FDFAF4]'
            }`}
            title="Focar no igarapé e no curso da água"
          >
            <Waves className="w-3 h-3" />
            <span>Igarapé</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewPreset('clearing')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all min-h-[32px] ${
              viewPreset === 'clearing'
                ? 'bg-[#96551F] text-[#FDFAF4] shadow-2xs'
                : 'text-[#4B4B49] hover:text-[#262B22] hover:bg-[#FDFAF4]'
            }`}
            title="Focar na clareira central de acolhimento"
          >
            <Sparkles className="w-3 h-3 text-[#FED701]" />
            <span>Clareira</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewPreset('canopy')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all min-h-[32px] ${
              viewPreset === 'canopy'
                ? 'bg-[#005A1F] text-[#FDFAF4] shadow-2xs'
                : 'text-[#4B4B49] hover:text-[#262B22] hover:bg-[#FDFAF4]'
            }`}
            title="Focar nas folhagens do bosque"
          >
            <Trees className="w-3 h-3" />
            <span>Bosque</span>
          </button>
        </div>

        {/* GRUPO 3: Botões de Expansão, Painel Direito & Ações */}
        <div className="flex items-center gap-2">
          {/* Ação rápida: Semear */}
          <button
            type="button"
            onClick={onQuickAddThought}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#005A1F] font-semibold border border-[#D8CFBE] rounded-full transition-colors min-h-[38px]"
            title="Semear novo pensamento acolhedor"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span className="hidden sm:inline">Semear</span>
          </button>

          {/* Pensamentos guardados */}
          <button
            type="button"
            onClick={onOpenSavedThoughts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005A1F] bg-[#F1E9DB] hover:bg-[#D8CFBE] border border-[#D8CFBE] rounded-full transition-colors min-h-[38px]"
            title="Ver pensamentos guardados"
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[2px]" />
            <span className="hidden lg:inline">Guardados</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#005A1F] text-[#FDFAF4] text-[10px] font-bold rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {/* Botão de Expansão / Alternância do Menu Direito */}
          <div className="h-5 w-[1px] bg-[#D8CFBE] mx-1" />

          {panelState !== 'collapsed' && (
            <button
              type="button"
              onClick={onTogglePanelWidth}
              className="p-2 text-[#4B4B49] hover:text-[#262B22] hover:bg-[#F1E9DB] border border-[#D8CFBE] rounded-full transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title={
                panelState === 'expanded'
                  ? 'Reduzir largura do painel'
                  : 'Expandir largura do painel de escrita'
              }
              aria-label="Alternar largura do painel de escrita"
            >
              {panelState === 'expanded' ? (
                <Minimize2 className="w-4 h-4 stroke-[2px]" />
              ) : (
                <Maximize2 className="w-4 h-4 stroke-[2px]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onTogglePanelState}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all min-h-[38px] ${
              panelState === 'collapsed'
                ? 'bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] border-[#005A1F] shadow-xs'
                : 'bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] border-[#D8CFBE]'
            }`}
            title={
              panelState === 'collapsed'
                ? 'Abrir painel de escrita e ações'
                : 'Recolher painel para visualização imersiva total do jardim'
            }
            aria-label="Alternar exibição do painel direito"
          >
            {panelState === 'collapsed' ? (
              <>
                <PanelRightOpen className="w-4 h-4 stroke-[2px]" />
                <span>Abrir painel</span>
              </>
            ) : (
              <>
                <PanelRightClose className="w-4 h-4 stroke-[2px]" />
                <span className="hidden xl:inline">Jardim total</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
