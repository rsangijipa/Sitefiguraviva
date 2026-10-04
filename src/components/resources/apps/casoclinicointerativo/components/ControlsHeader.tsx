"use client";

import React from "react";
import {
  BookOpen,
  Brain,
  Heart,
  Users,
  User,
  Lightbulb,
  Layers,
} from "lucide-react";
import { ExperienceStage, ClinicalCase, CaseTheme } from "../types";

interface ControlsHeaderProps {
  currentCase: ClinicalCase;
  currentCaseIndex: number;
  totalCases: number;
  stage: ExperienceStage;
  onOpenStudy: () => void;
  onRestart: () => void;
  onNextCase: () => void;
  completedCases: number[];
  stats: {
    totalCasesCompleted: number;
    totalTimeSpentSeconds: number;
    themesExplored: CaseTheme[];
  };
}

const STAGE_LABELS: Record<
  ExperienceStage,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  reading: { label: "LEITURA DO CASO", icon: BookOpen, color: "#8C6B4F" },
  reflecting: { label: "REFLEXÃO CLÍNICA", icon: Brain, color: "#3E5568" },
  analyzing: { label: "ANÁLISE ESTRUTURADA", icon: Layers, color: "#7A4A5A" },
  conclusion: {
    label: "SÍNTESE E CONCLUSÃO",
    icon: Lightbulb,
    color: "#4A6B4F",
  },
};

const THEME_ICONS: Record<
  CaseTheme,
  React.ComponentType<{ className?: string }>
> = {
  ansiedade: Heart,
  depressao: Brain,
  trauma: Layers,
  relacionamento: Users,
  identidade: User,
};

const THEME_COLORS: Record<
  CaseTheme,
  { bg: string; text: string; border: string; icon: string }
> = {
  ansiedade: {
    bg: "#FEF3E2",
    text: "#C47A2E",
    border: "#F0D8B8",
    icon: "#D48B3A",
  },
  depressao: {
    bg: "#E8EBF0",
    text: "#3E5568",
    border: "#D0D8E0",
    icon: "#5A7BA3",
  },
  trauma: {
    bg: "#F0E8EB",
    text: "#7A4A5A",
    border: "#E0D0D5",
    icon: "#9C6B7A",
  },
  relacionamento: {
    bg: "#E8F0E8",
    text: "#3E6B3E",
    border: "#D0E0D0",
    icon: "#5A8B5A",
  },
  identidade: {
    bg: "#F0EBE8",
    text: "#6B5A4A",
    border: "#E0D8D0",
    icon: "#8B7A6A",
  },
};

export const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  currentCase,
  currentCaseIndex,
  totalCases,
  stage,
  onOpenStudy,
  onRestart,
  onNextCase,
  completedCases,
  stats,
}) => {
  const stageInfo = STAGE_LABELS[stage];
  const StageIcon = stageInfo.icon;
  const themeColors = THEME_COLORS[currentCase.theme];
  const ThemeIcon = THEME_ICONS[currentCase.theme];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}min`;
    return `${mins}min`;
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 justify-end pb-4 border-b border-[#E8E4DA]">
      {/* Stage Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E3DFD5] text-xs text-[#6B665E] shadow-2xs w-full sm:w-auto">
        <span style={{ color: stageInfo.color }}>
          <StageIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-serif font-medium text-[#1F1E1D]">
          {stageInfo.label}
        </span>
        <span className="text-[#CCC5BA]">•</span>
        <span className="text-[#555048] font-medium">
          Caso {currentCaseIndex + 1}/{totalCases}
        </span>
      </div>

      {/* Current Case Theme Badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium tracking-wide w-full sm:w-auto"
        style={{
          backgroundColor: themeColors.bg,
          color: themeColors.text,
          borderColor: themeColors.border,
        }}
      >
        <span style={{ color: themeColors.icon }}>
          <ThemeIcon className="w-3.5 h-3.5" />
        </span>
        <span>
          {currentCase.theme.charAt(0).toUpperCase() +
            currentCase.theme.slice(1)}
        </span>
      </div>

      {/* Study Button - Requisito: MODO ESTUDO */}
      <button
        id="btn-open-study"
        onClick={onOpenStudy}
        className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2ECE2] text-[#4F4B44] border border-[#E3DFD5] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-2xs hover:border-[#D5CEBF] focus-visible-ring"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#8C6B4F]" />
        <span>Modo Estudo</span>
      </button>

      {/* Progress Stats (only show in conclusion or when there's progress) */}
      {(stage === "conclusion" || stats.totalCasesCompleted > 0) && (
        <div className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white border border-[#E3DFD5] text-xs text-[#6B665E] shadow-2xs flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-[#8C6B4F]" />
            <span className="font-serif font-medium text-[#1F1E1D]">
              {stats.totalCasesCompleted}
            </span>
            <span className="text-[#CCC5BA]">/</span>
            <span className="text-[#969085]">{totalCases}</span>
          </div>
          <span className="hidden sm:inline text-[#C0B9AC]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 text-[#8C6B4F]">⏱</span>
            <span className="font-mono text-[#555048]">
              {formatTime(stats.totalTimeSpentSeconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
