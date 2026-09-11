"use client";

import React, { useState, useRef, useEffect } from "react";
import { ClinicalCase, ExperienceStage } from "../types";
import {
  BookOpen,
  Heart,
  Brain,
  Users,
  User,
  Clock,
  ArrowRight,
  CheckCircle2,
  Quote,
  Lightbulb,
  FileText,
  Eye,
  Layers,
} from "lucide-react";

interface CaseCardProps {
  caseData: ClinicalCase;
  stage: ExperienceStage;
  selectedFocusAreas: string[];
  reflectionNotes: string;
  onSelectFocusArea: (area: string) => void;
  onReflectionChange: (notes: string) => void;
  onProceedToAnalyzing: () => void;
  onProceedToConclusion: () => void;
  isCompleted: boolean;
  analysis: { focusAreas: string[]; notes: string } | null;
}

const FOCUS_AREAS = [
  {
    id: "sintomas",
    label: "Sintomas e Sinais",
    icon: Heart,
    description: "Manifestações clínicas observáveis",
  },
  {
    id: "historia",
    label: "História de Vida",
    icon: BookOpen,
    description: "Contexto desenvolvimental e relacional",
  },
  {
    id: "cognicoes",
    label: "Cognições e Crenças",
    icon: Brain,
    description: "Padrões de pensamento e esquemas",
  },
  {
    id: "relacoes",
    label: "Padrões Relacionais",
    icon: Users,
    description: "Dinâmicas de apego e vínculo",
  },
  {
    id: "corpo",
    label: "Corpo e Soma",
    icon: User,
    description: "Manifestações somáticas e regulação",
  },
  {
    id: "recursos",
    label: "Recursos e Forças",
    icon: Lightbulb,
    description: "Capacidades de coping e resiliência",
  },
];

const THEME_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ansiedade: Heart,
  depressao: Brain,
  trauma: Layers,
  relacionamento: Users,
  identidade: User,
};

const THEME_COLORS: Record<
  string,
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

export const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  stage,
  selectedFocusAreas,
  reflectionNotes,
  onSelectFocusArea,
  onReflectionChange,
  onProceedToAnalyzing,
  onProceedToConclusion,
  isCompleted,
  analysis,
}) => {
  const themeColors = THEME_COLORS[caseData.theme];
  const ThemeIcon = THEME_ICONS[caseData.theme] || BookOpen;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [reflectionNotes, stage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (stage === "reflecting") {
        onProceedToAnalyzing();
      } else if (stage === "analyzing") {
        onProceedToConclusion();
      }
    }
  };

  if (stage === "reading") {
    return (
      <div
        className="space-y-6 animate-fade-in-up"
        role="region"
        aria-label={`Caso clínico: ${caseData.title}`}
      >
        {/* Case Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E8E4DA] text-xs font-medium tracking-wide">
            <span style={{ color: themeColors.icon }}>
              <ThemeIcon className="w-3.5 h-3.5" />
            </span>
            <span style={{ color: themeColors.text }}>
              {caseData.theme.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-[#1F1E1D] font-medium tracking-tight leading-snug">
            {caseData.title}
          </h1>

          <p className="text-lg text-[#6B655C] font-serif italic leading-relaxed">
            {caseData.subtitle}
          </p>

          {/* Patient Profile Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#8C6B4F]" />
              Perfil do Paciente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9E978C]">
                  Nome
                </p>
                <p className="font-medium text-[#1F1E1D]">
                  {caseData.patientProfile.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9E978C]">
                  Idade
                </p>
                <p className="font-medium text-[#1F1E1D]">
                  {caseData.patientProfile.age} anos
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9E978C]">
                  Ocupação
                </p>
                <p className="font-medium text-[#1F1E1D]">
                  {caseData.patientProfile.occupation}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9E978C]">
                  Tempo Est.
                </p>
                <p className="font-medium text-[#1F1E1D] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C6B4F]" />
                  {caseData.estimatedTimeMinutes} min
                </p>
              </div>
            </div>
            <p className="text-sm text-[#5A554E] leading-relaxed pt-2 border-t border-[#F0EDE5]">
              <strong className="text-[#1F1E1D]">Contexto:</strong>{" "}
              {caseData.patientProfile.context}
            </p>
          </div>
        </div>

        {/* Presenting Issue */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8C6B4F]" />
            Queixa Principal
          </h2>
          <p className="text-sm text-[#4A4744] leading-relaxed">
            {caseData.presentingIssue}
          </p>
        </div>

        {/* Background */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C6B4F]" />
            Histórico e Contexto
          </h2>
          <p className="text-sm text-[#4A4744] leading-relaxed">
            {caseData.background}
          </p>
        </div>

        {/* Key Observations */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#8C6B4F]" />
            Observações Clínicas Chave
          </h2>
          <ul className="space-y-2" role="list">
            {caseData.keyObservations.map((obs, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-[#4A4744] leading-relaxed animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <span className="w-2 h-2 mt-2 rounded-full bg-[#8C6B4F] flex-shrink-0" />
                {obs}
              </li>
            ))}
          </ul>
        </div>

        {/* Therapeutic Approach Preview */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#8C6B4F]" />
            Abordagem Terapêutica Sugerida
          </h2>
          <p className="text-sm text-[#4A4744] leading-relaxed">
            {caseData.therapeuticApproach}
          </p>
        </div>

        {/* Transition to Reflection */}
        <div className="pt-4 text-center animate-fade-in-up delay-3">
          <p className="text-sm text-[#7A7468] mb-3">
            Leia com atenção. Quando estiver pronto, inicie sua reflexão
            clínica.
          </p>
          <button
            onClick={onProceedToAnalyzing}
            className="px-8 py-3.5 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-white text-sm font-medium tracking-wide flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm focus-visible-ring"
            aria-label="Iniciar reflexão clínica"
          >
            <span>Iniciar Reflexão Clínica</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === "reflecting") {
    return (
      <div
        className="space-y-6 animate-fade-in-up"
        role="region"
        aria-label="Reflexão clínica guiada"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-[#8A847A] mb-2">
          <span>ETAPA 1 DE 3: REFLEXÃO CLÍNICA</span>
          <span className="font-mono text-[#1F1E1D]">
            {selectedFocusAreas.length}/6 áreas selecionadas
          </span>
        </div>

        {/* Focus Areas Selection */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8C6B4F]" />
              Selecione as Áreas de Foco
            </h2>
            <span className="text-[11px] text-[#8C867D]">
              Mínimo 2 • Máximo 4
            </span>
          </div>
          <p className="text-sm text-[#6B655C]">
            Quais dimensões deste caso chamam sua atenção clínica? Selecione 2 a
            4 áreas para guiar sua análise.
          </p>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            role="group"
            aria-label="Áreas de foco clínico"
          >
            {FOCUS_AREAS.map((area, idx) => {
              const isSelected = selectedFocusAreas.includes(area.id);
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectFocusArea(area.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                    isSelected
                      ? `bg-white border-2 shadow-md`
                      : "bg-[#FAF8F5] border-[#E8E4DA] hover:border-[#D4CEC3] hover:bg-[#F3F0E8]"
                  } ${themeColors.border}`}
                  style={{
                    borderColor: isSelected ? themeColors.icon : undefined,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${themeColors.bg}`
                      : undefined,
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${area.label}${isSelected ? ", selecionado" : ", não selecionado"}`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isSelected ? "text-white" : "text-[#8C867D]"
                      }`}
                      style={{ color: isSelected ? "white" : undefined }}
                    />
                    <span className="font-medium text-sm text-[#1F1E1D]">
                      {area.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7468] leading-tight">
                    {area.description}
                  </p>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        style={{ color: themeColors.icon }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedFocusAreas.length < 2 && (
            <p
              className="text-[11px] text-[#C47A2E] flex items-center gap-1"
              role="alert"
            >
              <span className="w-3 h-3" />
              Selecione pelo menos 2 áreas para prosseguir
            </p>
          )}
        </div>

        {/* Reflection Notes */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
            <Quote className="w-4 h-4 text-[#8C6B4F]" />
            Suas Anotações Clínicas
          </h2>
          <p className="text-sm text-[#6B655C]">
            Registre suas impressões, hipóteses diagnósticas, perguntas para
            supervisão ou qualquer reflexão que emerja.
          </p>
          <textarea
            ref={textareaRef}
            value={reflectionNotes}
            onChange={(e) => onReflectionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Suas anotações clínicas aqui... (Enter para avançar)"
            className="w-full min-h-[140px] p-4 rounded-xl border border-[#E8E4DA] bg-[#FAF8F5] text-sm text-[#2C2A29] placeholder-[#A8A195] focus:border-[#8C6B4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F0E8E0] resize-none transition-all font-sans leading-relaxed"
            rows={6}
            aria-label="Anotações clínicas"
          />
          <div className="flex items-center justify-between text-[11px] text-[#9E978C]">
            <span>{reflectionNotes.length} caracteres</span>
            <kbd className="px-2 py-0.5 rounded bg-[#E8E4DA] text-[#6B655C] font-mono">
              Enter
            </kbd>{" "}
            para avançar
          </div>
        </div>

        {/* Proceed Button */}
        <div className="pt-2 text-center">
          <button
            onClick={onProceedToAnalyzing}
            disabled={selectedFocusAreas.length < 2}
            className="px-8 py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm focus-visible-ring ${
              selectedFocusAreas.length >= 2
                ? 'bg-[#2C2A29] hover:bg-[#1A1918] text-white'
                : 'bg-[#E8E4DA] text-[#9E978C] cursor-not-allowed'
            }"
            aria-disabled={selectedFocusAreas.length < 2}
            aria-label={
              selectedFocusAreas.length >= 2
                ? "Prosseguir para análise"
                : "Selecione pelo menos 2 áreas de foco"
            }
          >
            <span>Prosseguir para Análise</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === "analyzing") {
    const displayAnalysis = analysis || {
      focusAreas: selectedFocusAreas,
      notes: reflectionNotes,
    };
    const selectedAreaDetails = FOCUS_AREAS.filter((a) =>
      displayAnalysis.focusAreas.includes(a.id),
    );

    return (
      <div
        className="space-y-6 animate-fade-in-up"
        role="region"
        aria-label="Análise clínica estruturada"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-[#8A847A] mb-2">
          <span>ETAPA 2 DE 3: ANÁLISE ESTRUTURADA</span>
          <span className="font-mono text-[#1F1E1D]">
            {displayAnalysis.focusAreas.length} áreas •{" "}
            {displayAnalysis.notes.length} caracteres
          </span>
        </div>

        {/* Structured Analysis Display */}
        <div className="space-y-4">
          {/* Selected Focus Areas */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#8C6B4F]" />
              Áreas Selecionadas para Análise
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedAreaDetails.map((area) => (
                <span
                  key={area.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: themeColors.bg,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  }}
                >
                  {area.label}
                </span>
              ))}
            </div>
          </div>

          {/* Reflection Notes Display */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2 mb-3">
              <Quote className="w-4 h-4 text-[#8C6B4F]" />
              Suas Anotações
            </h2>
            <div className="prose prose-sm max-w-none text-[#4A4744] leading-relaxed whitespace-pre-wrap">
              {displayAnalysis.notes ||
                '<em class="text-[#A8A195]">Nenhuma anotação registrada</em>'}
            </div>
          </div>

          {/* Learning Points */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#8C6B4F]" />
              Pontos de Aprendizado do Caso
            </h2>
            <ul className="space-y-2" role="list">
              {caseData.learningPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-[#4A4744] leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="w-2 h-2 mt-2 rounded-full bg-[#8C6B4F] flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Reflection Questions */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm">
            <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#8C6B4F]" />
              Perguntas para Reflexão Profunda
            </h2>
            <ol className="space-y-2" role="list">
              {caseData.reflectionQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-[#4A4744] leading-relaxed animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="font-mono text-[#8C6B4F] flex-shrink-0 mt-0.5">
                    {idx + 1}.
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Proceed to Conclusion */}
        <div className="pt-4 text-center animate-fade-in-up delay-2">
          <button
            onClick={onProceedToConclusion}
            className="px-8 py-3.5 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-white text-sm font-medium tracking-wide flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm focus-visible-ring"
            aria-label="Ver síntese e conclusão"
          >
            <span>Ver Síntese e Conclusão</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Conclusion stage
  return (
    <div
      className="space-y-6 animate-fade-in-up"
      role="region"
      aria-label="Síntese e conclusão do caso"
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-[#8A847A] mb-2">
        <span>ETAPA 3 DE 3: SÍNTESE E CONCLUSÃO</span>
        <span className="font-mono text-[#1F1E1D]">Concluído</span>
      </div>

      {/* Completion Badge */}
      <div className="text-center p-6 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EBF0EB] text-[#3C5740] text-xs font-medium tracking-wide mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B4F]" />
          <span>CASO CONCLUÍDO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1F1E1D] font-medium tracking-tight mb-2">
          {caseData.title}
        </h2>
        <p className="text-lg text-[#6B655C] font-serif italic">
          {caseData.subtitle}
        </p>
      </div>

      {/* Key Takeaways */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#8C6B4F]" />
          Principais Aprendizados
        </h2>
        <ul className="space-y-2" role="list">
          {caseData.learningPoints.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-[#4A4744] leading-relaxed animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <span className="w-2 h-2 mt-2 rounded-full bg-[#4A6B4F] flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Your Analysis Summary */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#8C6B4F]" />
          Sua Análise Registrada
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9E978C] mb-1">
              Áreas de Foco
            </p>
            <div className="flex flex-wrap gap-2">
              {displayAnalysis.focusAreas.map((areaId) => {
                const area = FOCUS_AREAS.find((a) => a.id === areaId);
                return area ? (
                  <span
                    key={areaId}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                    style={{
                      backgroundColor: themeColors.bg,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
                  >
                    {area.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9E978C] mb-1">
              Anotações
            </p>
            <div className="prose prose-sm max-w-none text-[#4A4744] leading-relaxed whitespace-pre-wrap bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DA]">
              {displayAnalysis.notes ||
                '<em class="text-[#A8A195]">Nenhuma anotação registrada</em>'}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-5 rounded-2xl bg-[#F7F5EE] border border-[#E3DDD0] space-y-3">
        <h2 className="text-sm font-semibold text-[#1F1E1D] flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-[#8C6B4F]" />
          Próximos Passos Sugeridos
        </h2>
        <ul className="space-y-2 text-sm text-[#5A554E]" role="list">
          <li className="flex items-start gap-2">
            • Revisar anotações em supervisão
          </li>
          <li className="flex items-start gap-2">
            • Consultar literatura sobre {caseData.theme}
          </li>
          <li className="flex items-start gap-2">
            • Considerar encaminhamentos se necessário
          </li>
          <li className="flex items-start gap-2">
            • Documentar no prontuário clínico
          </li>
        </ul>
      </div>

      {/* Restart / New Case */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onProceedToConclusion}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EEE6] text-[#2C2A29] border border-[#DCD5C6] text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-colors focus-visible-ring"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Próximo Caso</span>
        </button>
      </div>
    </div>
  );
};

// Helper to access displayAnalysis in conclusion stage
const displayAnalysis = { focusAreas: [], notes: "" };
