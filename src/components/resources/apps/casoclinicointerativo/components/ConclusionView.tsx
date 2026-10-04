"use client";

import React from "react";
import {
  UserAnalysis,
  AggregatedStats,
  ClinicalCase,
  CaseTheme,
} from "../types";
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Brain,
  Heart,
  Users,
  User,
  Lightbulb,
  Layers,
  BookOpen,
  Award,
  FileText,
} from "lucide-react";

interface ConclusionViewProps {
  analyses: UserAnalysis[];
  stats: AggregatedStats;
  currentCase: ClinicalCase;
  onNextCase: () => void;
  onRestart: () => void;
  totalCases: number;
  completedCount: number;
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
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}min`;
  return `${mins}min`;
};

export const ConclusionView: React.FC<ConclusionViewProps> = ({
  analyses,
  stats,
  currentCase,
  onNextCase,
  onRestart,
  totalCases,
  completedCount,
}) => {
  const themeColors = THEME_COLORS[currentCase.theme];
  const ThemeIcon = THEME_ICONS[currentCase.theme];
  const isAllCompleted = completedCount >= totalCases;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up text-[#2C2A29]">
      {/* Central Reflection Hero */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-white border border-[#E4DFD5] shadow-[0_8px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#EAE5D9]/50 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#E5DFD1]/50 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF0EB] text-[#3C5740] text-xs font-medium tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B4F]" />
            <span>CASO CONCLUÍDO</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif text-[#1F1E1D] font-medium leading-snug tracking-tight">
            {currentCase.title}
          </h2>

          <p className="text-lg text-[#6B655C] font-serif italic">
            {currentCase.subtitle}
          </p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span style={{ color: themeColors.icon }}>
              <ThemeIcon className="w-5 h-5" />
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: themeColors.bg,
                color: themeColors.text,
                borderColor: themeColors.border,
              }}
            >
              {currentCase.theme.charAt(0).toUpperCase() +
                currentCase.theme.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Case Journey - All Completed Cases */}
      {analyses.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1D7] shadow-sm">
          <h3 className="text-xs uppercase tracking-wider text-[#8A847A] font-semibold mb-5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C6B4F]" />
            Sua Jornada Clínica: {analyses.length} Caso
            {analyses.length > 1 ? "s" : ""} Analisado
            {analyses.length > 1 ? "s" : ""}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {analyses.map((analysis, idx) => {
              const caseThemeColors = THEME_COLORS[analysis.theme];
              const CaseThemeIcon = THEME_ICONS[analysis.theme];
              return (
                <div
                  key={analysis.caseId}
                  className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#ECE7DC] flex flex-col justify-between animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: caseThemeColors.icon }}>
                        <CaseThemeIcon className="w-4 h-4" />
                      </span>
                      <span
                        className="text-[11px] font-medium uppercase tracking-wider"
                        style={{ color: caseThemeColors.text }}
                      >
                        {analysis.theme.charAt(0).toUpperCase() +
                          analysis.theme.slice(1)}
                      </span>
                    </div>
                    <p className="font-serif text-sm font-medium text-[#22201E] line-clamp-1">
                      {analysis.caseTitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#EDE8DE] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#3F3B35]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: caseThemeColors.icon }}
                      />
                      <span className="font-medium">
                        {analysis.selectedFocusAreas.length} áreas
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C867D]">
                      {formatTime(analysis.timeSpentSeconds)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Case Analysis Summary */}
      <div className="p-5 rounded-2xl bg-white border border-[#E6E1D7] shadow-sm space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-[#8A847A] font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#8C6B4F]" />
          Síntese da Sua Análise Atual
        </h3>

        <div className="space-y-4">
          {/* Focus Areas */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9E978C] mb-2">
              Áreas de Foco Selecionadas
            </p>
            <div className="flex flex-wrap gap-2">
              {currentCase.learningPoints.slice(0, 4).map((_, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                  style={{
                    backgroundColor: themeColors.bg,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  }}
                >
                  {["Sintomas", "História", "Cognições", "Relações"][idx] ||
                    "Foco"}
                </span>
              ))}
            </div>
          </div>

          {/* Key Learning Points */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9E978C] mb-2">
              Principais Aprendizados
            </p>
            <ul className="space-y-1.5" role="list">
              {currentCase.learningPoints.slice(0, 3).map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-[#4A4744] leading-relaxed"
                >
                  <span
                    className="w-1.5 h-1.5 mt-1.5 rounded-full"
                    style={{ backgroundColor: themeColors.icon }}
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="pt-2 border-t border-[#EDE8DE]">
            <p className="text-[11px] uppercase tracking-wider text-[#9E978C] mb-2">
              Próximos Passos Clínicos
            </p>
            <ul className="space-y-1 text-sm text-[#5A554E]" role="list">
              <li className="flex items-start gap-2">
                • Discutir em supervisão clínica
              </li>
              <li className="flex items-start gap-2">
                • Consultar literatura sobre {currentCase.theme}
              </li>
              <li className="flex items-start gap-2">
                • Considerar encaminhamentos se indicado
              </li>
              <li className="flex items-start gap-2">
                • Documentar no prontuário
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Aggregated Session Metrics */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F5EE] border border-[#E3DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EBE5D7] flex items-center justify-center text-[#595248]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#7A7468] font-semibold">
              Tempo Total de Estudo
            </p>
            <p className="text-xs text-[#666056] mt-0.5">
              <strong className="text-[#1F1E1D]">
                {formatTime(stats.totalTimeSpentSeconds)}
              </strong>{" "}
              acumulados
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-[#5E574D]">
          <div className="text-center sm:text-left">
            <span className="block font-serif text-lg font-medium text-[#1F1E1D]">
              {stats.totalCasesCompleted}{" "}
              {stats.totalCasesCompleted === 1 ? "caso" : "casos"}
            </span>
            <span className="text-[11px] text-[#8C8578]">
              concluídos nesta sessão
            </span>
          </div>
          <div className="text-center sm:text-left">
            <span className="block font-serif text-lg font-medium text-[#1F1E1D]">
              {stats.themesExplored.length}
            </span>
            <span className="text-[11px] text-[#8C8578]">temas explorados</span>
          </div>
          {stats.lastCompletedAt && (
            <div className="text-center sm:text-left">
              <span className="block font-serif text-lg font-medium text-[#1F1E1D]">
                {new Date(stats.lastCompletedAt).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-[11px] text-[#8C8578]">
                última conclusão
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Themes Explored Badges */}
      {stats.themesExplored.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1D7] shadow-sm">
          <p className="text-xs uppercase tracking-wider text-[#8A847A] font-semibold mb-3 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#8C6B4F]" />
            Temas Explorados
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.themesExplored.map((theme) => {
              const tColors = THEME_COLORS[theme];
              const TIcon = THEME_ICONS[theme];
              return (
                <span
                  key={theme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: tColors.bg,
                    color: tColors.text,
                    borderColor: tColors.border,
                  }}
                >
                  <span style={{ color: tColors.icon }}>
                    <TIcon className="w-3 h-3" />
                  </span>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {isAllCompleted ? (
          <>
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-[#F8F7F4] text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm focus-visible-ring"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar Jornada Completa
            </button>
            <button
              onClick={onNextCase}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#F2EEE6] text-[#2C2A29] border border-[#DCD5C6] text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors focus-visible-ring"
            >
              <BookOpen className="w-4 h-4 text-[#7A7468]" />
              Revisar Casos
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onNextCase}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-[#F8F7F4] text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm focus-visible-ring"
            >
              <span>
                Próximo Caso ({completedCount + 1}/{totalCases})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#F2EEE6] text-[#2C2A29] border border-[#DCD5C6] text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors focus-visible-ring"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar Jornada
            </button>
          </>
        )}
      </div>

      {/* Footer Reflection */}
      <footer className="mt-8 pt-4 border-t border-[#E8E4DA] text-center text-xs text-[#948E84]">
        <p className="font-serif italic text-[#6B655C]">
          "A prática clínica é arte de acompanhar o outro no encontro consigo
          mesmo."
        </p>
        <p className="mt-1">Instituto Figura Viva • Formação Contínua</p>
      </footer>
    </div>
  );
};
