import React from "react";
import { BookOpen, SlidersHorizontal } from "lucide-react";
import { ExperienceStage, RoundConfig } from "../types";

interface ControlsHeaderProps {
  currentRound: RoundConfig;
  currentRoundIndex: number;
  totalRounds: number;
  stage: ExperienceStage;
  onOpenStudy: () => void;
  onTogglePlayground?: () => void;
  isPlaygroundMode?: boolean;
}

export const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  currentRound,
  currentRoundIndex,
  totalRounds,
  stage,
  onOpenStudy,
  onTogglePlayground,
  isPlaygroundMode = false,
}) => {
  return (
    <div className="w-full flex items-center justify-end gap-2 sm:gap-3 pb-4 border-b border-[#F1E9DB]">
      {!isPlaygroundMode && stage !== "conclusion" && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB] text-xs text-[#6B6B63] ">
          <span className="font-serif font-medium text-[#262B22]">
            Rodada {currentRoundIndex + 1}
          </span>
          <span className="text-[#D8CFBE]">/</span>
          <span className="text-[#6B6B63]">{totalRounds}</span>
          <span className="hidden md:inline text-[#D8CFBE]">•</span>
          <span className="hidden md:inline text-[#4B4B49] font-medium">
            {currentRound.parameterName}
          </span>
        </div>
      )}

      {onTogglePlayground && (
        <button
          id="btn-toggle-playground"
          onClick={onTogglePlayground}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all ${
            isPlaygroundMode
              ? "bg-[#262B22] text-[#FDFAF4] border-[#262B22]"
              : "bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#4B4B49] border-[#F1E9DB]"
          }`}
          title="Ajustar parâmetros livremente"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Laboratório</span>
        </button>
      )}

      {/* Requisito: MODO ESTUDO: Adicionar opção pequena: “Entender o conceito” */}
      <button
        id="btn-open-study"
        onClick={onOpenStudy}
        className="px-3 py-1.5 rounded-xl bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#4B4B49] border border-[#F1E9DB] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all  hover:border-[#D8CFBE]"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#6B6B63]" />
        <span>Entender o conceito</span>
      </button>
    </div>
  );
};
