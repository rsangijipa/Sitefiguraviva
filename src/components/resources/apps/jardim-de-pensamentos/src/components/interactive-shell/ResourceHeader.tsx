import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Eye, HelpCircle } from 'lucide-react';

interface ResourceHeaderProps {
  title: string;
  category?: string;
  onBack: () => void;
  onEndExperience?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
  onOpenHelp?: () => void;
  canEndExperience?: boolean;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  title,
  category = 'Confluência',
  onBack,
}) => {
  return (
    <header className="hidden" aria-hidden="true">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Lado esquerdo: Botão Voltar + Título */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-[#005A1F] hover:text-[#07614C] bg-[#F1E9DB] hover:bg-[#D8CFBE]/60 border border-[#D8CFBE] rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[#005A1F] min-h-[44px] min-w-[44px] shadow-2xs"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
            <span>Voltar</span>
          </button>

          <div className="h-5 w-[2px] bg-[#D8CFBE] hidden sm:block" />

          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#96551F] uppercase tracking-wider block">
              {category}
            </span>
            <h1 className="text-lg sm:text-xl font-bold font-fraunces text-[#005A1F] truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Lado direito: Espaço limpo e sem distrações visuais */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-[#6B6B63] font-medium bg-[#F1E9DB]/60 border border-[#D8CFBE] px-3 py-1 rounded-full">
            Espaço de Contemplação
          </span>
        </div>
      </div>
    </header>
  );
};
