import React from "react";
import { Compass, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { ContactCycleConfig } from "../types";

interface OpeningScreenProps {
  config: ContactCycleConfig;
  onStartGuided: () => void;
  onStartFree: () => void;
  onStartPractice: () => void;
}

export function OpeningScreen({
  config,
  onStartGuided,
  onStartFree,
  onStartPractice,
}: OpeningScreenProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 sm:p-10 shadow-none">
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#F1E9DB] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#96551F]">
          <Sparkles size={14} aria-hidden="true" />
          Aprender · Gestalt-terapia
        </div>

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#262B22]">
          {config.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#4B4B49]">
          {config.description}
        </p>

        {/* Pedagogical Notice */}
        <div className="mt-6 rounded-2xl border-2 border-[#D8CFBE] bg-[#F1E9DB]/60 p-4 text-xs sm:text-sm text-[#4B4B49]">
          <p className="font-semibold text-[#262B22] mb-1">
            Aviso pedagógico importante:
          </p>
          <p>{config.introContent}</p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onStartGuided}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-6 py-3 text-sm font-semibold text-[#FDFAF4] transition hover:bg-[#07614C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED701]"
          >
            <Compass size={18} aria-hidden="true" />
            <span>Começar percurso guiado</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onStartFree}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#F1E9DB] bg-[#FDFAF4] px-6 py-3 text-sm font-semibold text-[#262B22] transition hover:border-[#96551F] hover:bg-[#F1E9DB]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED701]"
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>Explorar livremente</span>
          </button>

          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#F1E9DB] bg-[#FDFAF4] px-6 py-3 text-sm font-semibold text-[#96551F] transition hover:border-[#96551F] hover:bg-[#F1E9DB]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED701]"
          >
            <span>Aplicar em situação</span>
          </button>
        </div>

        {/* Metadata */}
        <div className="mt-10 border-t-2 border-[#F1E9DB] pt-6 flex flex-wrap items-center justify-between text-xs text-[#6B6B63]">
          <span>Duração estimada: ~{config.estimatedMinutes} min</span>
          <span>Conteúdo didático interativo</span>
          <span>Instituto Figura Viva</span>
        </div>
      </div>
    </div>
  );
}
