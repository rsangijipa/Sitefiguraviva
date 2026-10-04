import React from "react";
import { Sparkles, Edit3, RotateCcw } from "lucide-react";
import { ContactCycleConfig } from "../types";

interface CompletionViewProps {
  config: ContactCycleConfig;
  onRestart: () => void;
  onGoToPractice: () => void;
}

export function CompletionView({
  config,
  onRestart,
  onGoToPractice,
}: CompletionViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
      <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-8 sm:p-12 shadow-none">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#005A1F] bg-[#005A1F]/10 text-[#005A1F] mx-auto mb-6">
          <Sparkles size={28} aria-hidden="true" />
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#96551F]">
          Fechando o Percurso
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#262B22] mt-2">
          Travessia Concluída
        </h2>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#4B4B49] max-w-xl mx-auto">
          {config.completionContent}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-6 py-3 text-sm font-semibold text-[#FDFAF4] transition hover:bg-[#07614C]"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Explorar novamente</span>
          </button>

          <button
            type="button"
            onClick={onGoToPractice}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#F1E9DB] bg-[#FDFAF4] px-6 py-3 text-sm font-semibold text-[#96551F] transition hover:border-[#96551F]"
          >
            <Edit3 size={16} aria-hidden="true" />
            <span>Aplicar em uma situação</span>
          </button>
        </div>
      </div>
    </div>
  );
}
