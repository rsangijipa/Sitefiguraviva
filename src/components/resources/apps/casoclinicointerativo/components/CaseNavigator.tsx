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
                    ? `border-2 `
                    : isDone
                      ? "bg-[#F1E9DB] border-[#D8CFBE] hover:border-[#D8CFBE]"
                      : "bg-[#FDFAF4] border-[#F1E9DB] hover:border-[#D8CFBE] hover:bg-[#F1E9DB]"
                } ${themeColors.border}`}
                style={{
                  borderColor: isCurrent ? themeColors.icon : undefined,
                  boxShadow: "none",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: isCurrent ? "white" : undefined }}>
                    <ThemeIcon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isCurrent ? "text-paper" : "text-[#6B6B63]"
                      }`}
                    />
                  </span>
                  <span className="font-medium text-sm text-[#262B22] line-clamp-1 flex-1">
                    {caseItem.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#6B6B63]">
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
                      className="w-3.5 h-3.5 text-[#4B4B49]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {caseAnalysis && (
                  <div className="mt-2 pt-2 border-t border-current/20 text-[10px] text-[#6B6B63]">
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
      <div className="p-4 rounded-xl bg-paper border border-[#F1E9DB]  animate-fade-in-up">
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
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#4B4B49]">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluído
                </span>
              )}
            </div>
            <h3 className="font-serif text-base font-medium text-[#262B22] mb-1">
              {currentCase.title}
            </h3>
            <p className="text-sm text-[#6B6B63] line-clamp-2">
              {currentCase.subtitle}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-[#6B6B63]">
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
          <div className="mt-3 pt-3 border-t border-[#F1E9DB] grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-[#FDFAF4]">
              <p className="font-serif text-lg font-medium text-[#262B22]">
                {analysis.selectedFocusAreas.length}
              </p>
              <p className="text-[10px] text-[#6B6B63]">Áreas</p>
            </div>
            <div className="p-2 rounded-lg bg-[#FDFAF4]">
              <p className="font-serif text-lg font-medium text-[#262B22]">
                {formatTime(analysis.timeSpentSeconds)}
              </p>
              <p className="text-[10px] text-[#6B6B63]">Tempo</p>
            </div>
            <div className="p-2 rounded-lg bg-[#FDFAF4]">
              <p className="font-serif text-lg font-medium text-[#262B22]">
                {analysis.reflectionNotes.length}
              </p>
              <p className="text-[10px] text-[#6B6B63]">Caracteres</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0 || disabled}
          className="flex-1 sm:w-auto px-4 py-2.5 rounded-xl bg-paper border border-[#F1E9DB] text-[#4B4B49] text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F1E9DB] hover:border-[#D8CFBE] disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
          aria-label="Caso anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="flex-1 text-center text-sm text-[#6B6B63]">
          Caso {currentIndex + 1} de {cases.length}
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === cases.length - 1 || disabled}
          className="flex-1 sm:w-auto px-4 py-2.5 rounded-xl bg-paper border border-[#F1E9DB] text-[#4B4B49] text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F1E9DB] hover:border-[#D8CFBE] disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
          aria-label="Próximo caso"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
