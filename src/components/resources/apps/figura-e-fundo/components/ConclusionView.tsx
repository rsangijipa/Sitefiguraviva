import React from "react";
import { UserSelection, AggregatedStats } from "../types";
import {
  Sparkles,
  RotateCcw,
  Sliders,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ConclusionViewProps {
  selections: UserSelection[];
  stats: AggregatedStats;
  onRestart: () => void;
  onEnterPlayground: () => void;
}

export const ConclusionView: React.FC<ConclusionViewProps> = ({
  selections,
  stats,
  onRestart,
  onEnterPlayground,
}) => {
  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in text-[#262B22]">
      {/* Central Reflection Hero */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-[#FDFAF4] border border-[#F1E9DB] -[0_8px_30px_rgb(38 43 34 / 0.03)] relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F1E9DB]/50 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#F1E9DB]/50 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1E9DB] text-xs text-[#6B6B63] font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#6B6B63]" />
            <span>SÍNTESE DA EXPERIÊNCIA</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif text-[#262B22] font-medium leading-snug tracking-tight">
            “Quando algo se torna figura, o restante não desaparece:{" "}
            <span className="italic font-normal text-[#4B4B49]">
              permanece como fundo.”
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#6B6B63] leading-relaxed max-w-lg mx-auto">
            A cada olhar, uma nova realidade se organiza. A figura destaca-se
            não por apagar o que a cerca, mas por se apoiar na presença
            silenciosa do campo que a acolhe.
          </p>
        </div>
      </div>

      {/* Trajectory across rounds */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFAF4] border border-[#F1E9DB] ">
        <h3 className="text-xs uppercase tracking-wider text-[#6B6B63] font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#4B4B49]" />
          Seu Percurso Perceptivo Único
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {selections.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB] flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B63]">
                  Rodada {item.roundId} • {item.theme}
                </span>
                <p className="font-serif text-sm font-medium text-[#262B22] mt-0.5">
                  {item.roundTitle}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F1E9DB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#4B4B49]">
                  <span className="w-2 h-2 rounded-full bg-[#6B6B63]" />
                  <span className="font-medium">
                    {item.selectedElementName}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B6B63]">
                  {item.secondsElapsed}s
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregated Session Metrics (Requirement: Registrar somente conclusão e tempo agregado) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FDFAF4] border border-[#F1E9DB] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F1E9DB] flex items-center justify-center text-[#4B4B49]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6B6B63] font-semibold">
              Registro de Conclusão e Tempo Agregado
            </p>
            <p className="text-xs text-[#6B6B63] mt-0.5">
              Tempo total acumulado de contemplação:{" "}
              <strong className="text-[#262B22]">
                {formatSeconds(stats.totalTimeSpentSeconds)}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#4B4B49]">
          <div className="text-right">
            <span className="block font-serif text-lg font-medium text-[#262B22]">
              {stats.totalCompletions}{" "}
              {stats.totalCompletions === 1 ? "conclusão" : "conclusões"}
            </span>
            <span className="text-[11px] text-[#6B6B63]">
              registradas nesta sessão
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          id="btn-restart-experience"
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#262B22] hover:bg-[#262B22] text-[#FDFAF4] text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors "
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar Experiência
        </button>

        <button
          id="btn-enter-playground"
          onClick={onEnterPlayground}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] border border-[#D8CFBE] text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors"
        >
          <Sliders className="w-4 h-4 text-[#6B6B63]" />
          Laboratório de Parâmetros Livres
        </button>
      </div>
    </div>
  );
};
