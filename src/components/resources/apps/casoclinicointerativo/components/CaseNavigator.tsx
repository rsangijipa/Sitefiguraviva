"use client";

import React from "react";
import { ClinicalCase, CaseTheme, UserAnalysis } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Clock,
  Brain,
  Heart,
  Users,
  User,
  Lightbulb,
  Layers,
} from "lucide-react";

interface CaseNavigatorProps {
  cases: ClinicalCase[];
  currentIndex: number;
  completedCases: number[];
  analyses: UserAnalysis[];
  onSelectCase: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  disabled?: boolean;
}

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  if (mins === 0) return "< 1 min";
  return `${mins} min`;
};

export const CaseNavigator: React.FC<CaseNavigatorProps> = ({
  cases,
  currentIndex,
  completedCases,
  analyses,
  onSelectCase,
  onNext,
  onPrev,
  disabled = false,
}) => {
  const currentCase = cases[currentIndex];
  const isCompleted = completedCases.includes(currentIndex);
  const analysis = analyses.find((a) => a.caseId === currentCase.id);

  return (
    <div
      className="space-y-4"
      role="navigation"
      aria-label="Navegação entre casos clínicos"
    >
      {/* Compact Case Selector */}
      <div
        className="overflow-x-auto pb-2 custom-scrollbar"
        role="tablist"
        aria-label="Lista de casos"
      >
        <div className="flex gap-2 min-w-max">
          {cases.map((caseItem, idx) => {
            const themeColors = THEME_COLORS[caseItem.theme];
            const ThemeIcon = THEME_ICONS[caseItem.theme];
            const isCurrent = idx === currentIndex;
            const isDone = completedCases.includes(idx);
            const caseAnalysis = analyses.find((a) => a.caseId === caseItem.id);

            return (
              <button
                key={caseItem.id}
                type="button"
                onClick={() => !disabled && onSelectCase(idx)}
                disabled={disabled}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`${caseItem.title}${isDone ? ", concluído" : ""}${isCurrent ? ", atual" : ""}`}
                className={`relative flex-shrink-0 w-40 sm:w-48 p-3 rounded-xl border-2 transition-all text-left group ${
                  isCurrent
                    ? `border-2 shadow-md`
                    : isDone
                      ? "bg-[#EBF0EB] border-[#D0E0D0] hover:border-[#B8D0B8]"
                      : "bg-[#FAF8F5] border-[#E8E4DA] hover:border-[#D4CEC3] hover:bg-[#F3F0E8]"
                } ${themeColors.border}`}
                style={{
                  borderColor: isCurrent ? themeColors.icon : undefined,
                  boxShadow: isCurrent
                    ? `0 0 0 2px ${themeColors.bg}`
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: isCurrent ? "white" : undefined }}>
                    <ThemeIcon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isCurrent ? "text-white" : "text-[#8C867D]"
                      }`}
                    />
                  </span>
                  <span className="font-medium text-sm text-[#1F1E1D] line-clamp-1 flex-1">
                    {caseItem.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#7A7468]">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-medium border"
                    style={{
                      backgroundColor: themeColors.bg,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
                  >
                    {caseItem.theme.charAt(0).toUpperCase() +
                      caseItem.theme.slice(1)}
                  </span>
                  {isDone && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-[#4A6B4F]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {caseAnalysis && (
                  <div className="mt-2 pt-2 border-t border-current/20 text-[10px] text-[#8C867D]">
                    {formatTime(caseAnalysis.timeSpentSeconds)} •{" "}
                    {caseAnalysis.selectedFocusAreas.length} áreas
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Case Detail */}
      <div className="p-4 rounded-xl bg-white border border-[#E8E4DA] shadow-sm animate-fade-in-up">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: THEME_COLORS[currentCase.theme].bg }}
          >
            {(() => {
              const ThemeIconComp = THEME_ICONS[currentCase.theme] || BookOpen;
              return (
                <span style={{ color: THEME_COLORS[currentCase.theme].icon }}>
                  <ThemeIconComp className="w-5 h-5" />
                </span>
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-medium border"
                style={{
                  backgroundColor: THEME_COLORS[currentCase.theme].bg,
                  color: THEME_COLORS[currentCase.theme].text,
                  borderColor: THEME_COLORS[currentCase.theme].border,
                }}
              >
                {currentCase.theme.charAt(0).toUpperCase() +
                  currentCase.theme.slice(1)}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#4A6B4F]">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluído
                </span>
              )}
            </div>
            <h3 className="font-serif text-base font-medium text-[#1F1E1D] mb-1">
              {currentCase.title}
            </h3>
            <p className="text-sm text-[#6B655C] line-clamp-2">
              {currentCase.subtitle}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-[#9E978C]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />~{currentCase.estimatedTimeMinutes}{" "}
                min
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Caso {currentIndex + 1} de {cases.length}
              </span>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="mt-3 pt-3 border-t border-[#EDE8DE] grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-[#FAF8F5]">
              <p className="font-serif text-lg font-medium text-[#1F1E1D]">
                {analysis.selectedFocusAreas.length}
              </p>
              <p className="text-[10px] text-[#8C867D]">Áreas</p>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF8F5]">
              <p className="font-serif text-lg font-medium text-[#1F1E1D]">
                {formatTime(analysis.timeSpentSeconds)}
              </p>
              <p className="text-[10px] text-[#8C867D]">Tempo</p>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF8F5]">
              <p className="font-serif text-lg font-medium text-[#1F1E1D]">
                {analysis.reflectionNotes.length}
              </p>
              <p className="text-[10px] text-[#8C867D]">Caracteres</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0 || disabled}
          className="flex-1 sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#E3DFD5] text-[#4F4B44] text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F2ECE2] hover:border-[#D5CEBF] disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
          aria-label="Caso anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex-1 text-center text-sm text-[#7A7468]">
          Caso {currentIndex + 1} de {cases.length}
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === cases.length - 1 || disabled}
          className="flex-1 sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#E3DFD5] text-[#4F4B44] text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F2ECE2] hover:border-[#D5CEBF] disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
          aria-label="Próximo caso"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
