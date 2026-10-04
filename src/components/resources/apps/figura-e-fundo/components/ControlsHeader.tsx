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
    <div className="w-full flex items-center justify-end gap-2 sm:gap-3 pb-4 border-b border-[#E8E4DA]">
      {!isPlaygroundMode && stage !== "conclusion" && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E3DFD5] text-xs text-[#6B665E] shadow-2xs">
          <span className="font-serif font-medium text-[#1F1E1D]">
            Rodada {currentRoundIndex + 1}
          </span>
          <span className="text-[#CCC5BA]">/</span>
          <span className="text-[#969085]">{totalRounds}</span>
          <span className="hidden md:inline text-[#C0B9AC]">•</span>
          <span className="hidden md:inline text-[#555048] font-medium">
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
              ? "bg-[#2C2A29] text-[#FAF8F5] border-[#2C2A29]"
              : "bg-[#FFFFFF] hover:bg-[#F4EFE6] text-[#555048] border-[#E3DFD5]"
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
        className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2ECE2] text-[#4F4B44] border border-[#E3DFD5] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-2xs hover:border-[#D5CEBF]"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#8C6B4F]" />
        <span>Entender o conceito</span>
      </button>
    </div>
  );
};
