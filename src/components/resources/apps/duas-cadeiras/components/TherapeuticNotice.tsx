import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export const TherapeuticNotice: React.FC = () => {
  return (
    <div
      id="therapeutic-disclaimer-banner"
      className="w-full max-w-2xl mx-auto rounded-lg bg-stone-100/90 border border-stone-200/80 px-4 py-2.5 text-xs text-stone-600 flex items-start gap-2.5 shadow-2xs"
    >
      <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-0.5">
        <p className="font-medium text-stone-800">
          Recurso de auto-observação e reflexão dialógica.
        </p>
        <p className="leading-relaxed">
          Esta ferramenta é um experimento de escrita expressiva e{" "}
          <strong className="font-semibold text-stone-900">
            não substitui acompanhamento terapêutico ou suporte profissional de
            saúde mental
          </strong>
          .
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-[11px] text-stone-500 border-l border-stone-200 pl-2.5 self-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">100% Privado</span>
      </div>
    </div>
  );
};
