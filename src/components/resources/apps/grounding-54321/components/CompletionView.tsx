import React from "react";
import { RotateCcw, ShieldCheck, Heart } from "lucide-react";
import { AppSettings } from "../types";

interface CompletionViewProps {
  durationSeconds: number;
  settings: AppSettings;
  onRestart: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  durationSeconds,
  settings,
  onRestart,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} segundos`;
    return `${mins} min ${secs} s`;
  };

  return (
    <main
      id="completion-view"
      className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-between px-6 py-8 select-none"
    >
      <div className="my-auto flex flex-col items-center text-center px-4">
        {/* Soft icon indicator */}
        <div className="w-16 h-16 rounded-full bg-[#F1E9DB] flex items-center justify-center text-[#262B22] mb-6">
          <Heart className="w-7 h-7 stroke-[1.75]" />
        </div>

        {/* Serif title */}
        <h2
          id="completion-title"
          className="font-fraunces text-3xl sm:text-4xl text-[#262B22] font-medium tracking-tight mb-3"
        >
          Você está ancorado no agora.
        </h2>

        {/* Instruction in Karla */}
        <p className="font-karla text-base text-[#4B4B49] leading-relaxed max-w-sm mb-6">
          Seus sentidos se conectaram com o ambiente presente ao seu redor.
          Inspire profundamente e solte o ar com suavidade.
        </p>

        {/* Calming breathing guide */}
        <div
          className={`p-5 rounded-2xl bg-[#F0EFEB] border border-[#DDD9CE] w-full max-w-xs mb-6 ${
            !settings.reducedMotion ? "animate-subtle-breathe" : ""
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-[#6B6B63] font-semibold block mb-1">
            Respiração de ancoragem
          </span>
          <p className="font-fraunces text-lg text-[#262B22] italic">
            Inspire a presença. Solte as tensões.
          </p>
        </div>

        {/* Duration badge */}
        <div className="flex items-center gap-2 text-xs text-[#6B6B63] font-karla bg-[#F1E9DB] px-3.5 py-1.5 rounded-full mb-3">
          <span>Tempo de prática:</span>
          <strong className="font-semibold text-[#262B22]">
            {formatDuration(durationSeconds)}
          </strong>
        </div>

        {/* Privacy note as specified in prompt */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] max-w-xs">
          <ShieldCheck className="w-4 h-4 text-[#4B4B49] flex-shrink-0" />
          <span>Nada desta prática é armazenado ou enviado.</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-[#F1E9DB]/80 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="restart-exercise-btn"
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-karla text-sm font-semibold bg-[#262B22] hover:bg-[#262B22] active:bg-[#262B22] text-[#FDFAF4]  transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#262B22]/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Fazer novamente</span>
        </button>
      </div>
    </main>
  );
};
