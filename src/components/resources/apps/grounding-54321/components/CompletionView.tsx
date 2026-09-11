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
        <div className="w-16 h-16 rounded-full bg-[#EAE7DE] flex items-center justify-center text-[#2F3740] mb-6">
          <Heart className="w-7 h-7 stroke-[1.75]" />
        </div>

        {/* Serif title */}
        <h2
          id="completion-title"
          className="font-fraunces text-3xl sm:text-4xl text-[#1E2328] font-medium tracking-tight mb-3"
        >
          Você está ancorado no agora.
        </h2>

        {/* Instruction in Karla */}
        <p className="font-karla text-base text-[#404852] leading-relaxed max-w-sm mb-6">
          Seus sentidos se conectaram com o ambiente presente ao seu redor.
          Inspire profundamente e solte o ar com suavidade.
        </p>

        {/* Calming breathing guide */}
        <div
          className={`p-5 rounded-2xl bg-[#F0EFEB] border border-[#DDD9CE] w-full max-w-xs mb-6 ${
            !settings.reducedMotion ? "animate-subtle-breathe" : ""
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-[#666D77] font-semibold block mb-1">
            Respiração de ancoragem
          </span>
          <p className="font-fraunces text-lg text-[#20252B] italic">
            Inspire a presença. Solte as tensões.
          </p>
        </div>

        {/* Duration badge */}
        <div className="flex items-center gap-2 text-xs text-[#5D6570] font-karla bg-[#EDEAE2] px-3.5 py-1.5 rounded-full mb-3">
          <span>Tempo de prática:</span>
          <strong className="font-semibold text-[#20252B]">
            {formatDuration(durationSeconds)}
          </strong>
        </div>

        {/* Privacy note as specified in prompt */}
        <div className="flex items-center gap-1.5 text-xs text-[#6F7782] max-w-xs">
          <ShieldCheck className="w-4 h-4 text-[#4A535E] flex-shrink-0" />
          <span>Nada desta prática é armazenado ou enviado.</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-[#E8E6DF]/80 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="restart-exercise-btn"
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-karla text-sm font-semibold bg-[#21272E] hover:bg-[#161A1F] active:bg-[#0E1114] text-[#F8F7F4] shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#21272E]/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Fazer novamente</span>
        </button>
      </div>
    </main>
  );
};
