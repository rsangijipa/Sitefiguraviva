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
  reading: { label: "LEITURA DO CASO", icon: BookOpen, color: "#6B6B63" },
  reflecting: { label: "REFLEXÃO CLÍNICA", icon: Brain, color: "#4B4B49" },
  analyzing: { label: "ANÁLISE ESTRUTURADA", icon: Layers, color: "#6B6B63" },
  conclusion: {
    label: "SÍNTESE E CONCLUSÃO",
    icon: Lightbulb,
    color: "#4B4B49",
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
    bg: "#F1E9DB",
    text: "#96551F",
    border: "#D8CFBE",
    icon: "#96551F",
  },
  depressao: {
    bg: "#F1E9DB",
    text: "#4B4B49",
    border: "#D8CFBE",
    icon: "#6B6B63",
  },
  trauma: {
    bg: "#F1E9DB",
    text: "#6B6B63",
    border: "#D8CFBE",
    icon: "#6B6B63",
  },
  relacionamento: {
    bg: "#F1E9DB",
    text: "#4B4B49",
    border: "#D8CFBE",
    icon: "#6B6B63",
  },
  identidade: {
    bg: "#F1E9DB",
    text: "#6B6B63",
    border: "#D8CFBE",
    icon: "#6B6B63",
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
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 justify-end pb-4 border-b border-[#F1E9DB]">
      {/* Stage Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-[#F1E9DB] text-xs text-[#6B6B63]  w-full sm:w-auto">
        <span style={{ color: stageInfo.color }}>
          <StageIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-serif font-medium text-[#262B22]">
          {stageInfo.label}
        </span>
        <span className="text-[#D8CFBE]">•</span>
        <span className="text-[#4B4B49] font-medium">
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
        className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-paper hover:bg-[#F1E9DB] text-[#4B4B49] border border-[#F1E9DB] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all  hover:border-[#D8CFBE] focus-visible-ring"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#6B6B63]" />
        <span>Modo Estudo</span>
      </button>

      {/* Progress Stats (only show in conclusion or when there's progress) */}
      {(stage === "conclusion" || stats.totalCasesCompleted > 0) && (
        <div className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-paper border border-[#F1E9DB] text-xs text-[#6B6B63]  flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-[#6B6B63]" />
            <span className="font-serif font-medium text-[#262B22]">
              {stats.totalCasesCompleted}
            </span>
            <span className="text-[#D8CFBE]">/</span>
            <span className="text-[#6B6B63]">{totalCases}</span>
          </div>
          <span className="hidden sm:inline text-[#D8CFBE]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 text-[#6B6B63]">⏱</span>
            <span className="font-mono text-[#4B4B49]">
              {formatTime(stats.totalTimeSpentSeconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
