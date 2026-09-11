import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { StageData, AppSettings } from "../types";
import { SensoryMarks } from "./SensoryMarks";

interface StageViewProps {
  stage: StageData;
  currentIndex: number;
  totalStages: number;
  checkedMarks: boolean[];
  settings: AppSettings;
  onToggleMark: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StageView: React.FC<StageViewProps> = ({
  stage,
  currentIndex,
  totalStages,
  checkedMarks,
  settings,
  onToggleMark,
  onNext,
  onPrev,
}) => {
  const isLastStage = currentIndex === totalStages - 1;
  const allCurrentMarksDone =
    checkedMarks.length === stage.number && checkedMarks.every(Boolean);

  return (
    <main
      id="stage-main-view"
      className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-between px-6 py-6 sm:py-8 select-none"
    >
      {/* Top stage sense label */}
      <div className="flex items-center justify-between text-xs text-[#7B828B] font-karla uppercase tracking-widest pt-2">
        <span id="stage-sense-badge" className="font-semibold text-[#485058]">
          Etapa {currentIndex + 1} de {totalStages} · {stage.sense}
        </span>
        <span className="text-[#8E959E]">Ritmo livre</span>
      </div>

      {/* Main Focus Area: Big Fraunces number & Karla instruction */}
      <div className="my-auto flex flex-col items-center text-center px-2 py-4">
        {/* Large Fraunces numeral */}
        <div
          id="stage-number-display"
          className="font-fraunces text-8xl sm:text-9xl font-light text-[#191E23] leading-none mb-2 tracking-tight select-none"
        >
          {stage.number}
        </div>

        {/* Title */}
        <h2
          id="stage-title"
          className="font-fraunces text-2xl sm:text-3xl text-[#1E2328] font-medium tracking-tight mb-3"
        >
          {stage.title}
        </h2>

        {/* Instruction in Karla */}
        <p
          id="stage-instruction"
          className="font-karla text-base sm:text-lg text-[#373F47] leading-relaxed max-w-md font-normal mb-3"
        >
          {stage.instruction}
        </p>

        {/* Grounding tip focused on the real surroundings */}
        <p
          id="stage-grounding-tip"
          className="font-karla text-xs sm:text-sm text-[#666E78] max-w-sm italic leading-normal"
        >
          {stage.groundingTip}
        </p>

        {/* Interactive sensory marks */}
        <SensoryMarks
          total={stage.number}
          checked={checkedMarks}
          onToggle={onToggleMark}
          reducedMotion={settings.reducedMotion}
          senseLabel={stage.sense}
        />
      </div>

      {/* Footer Navigation: Manual advance, free pace, progress tracker */}
      <div className="pt-4 border-t border-[#E8E6DF]/80 flex flex-col gap-4">
        {/* Step dots indicator */}
        <div
          className="flex items-center justify-center gap-2"
          aria-label="Progresso do exercício"
        >
          {Array.from({ length: totalStages }).map((_, idx) => {
            const stepNum = 5 - idx;
            const isCurrent = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            return (
              <div
                key={`step-dot-${stepNum}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-7 bg-[#232A31]"
                    : isCompleted
                      ? "w-2 bg-[#707882]"
                      : "w-2 bg-[#D8D5CD]"
                }`}
                title={`Etapa ${stepNum}`}
              />
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            id="prev-step-btn"
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-karla text-sm font-medium transition-all ${
              currentIndex === 0
                ? "opacity-0 pointer-events-none"
                : "text-[#485059] hover:bg-[#ECEAE3] active:scale-98"
            }`}
            aria-label="Voltar para etapa anterior"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            id="next-step-btn"
            type="button"
            onClick={onNext}
            className="flex-1 sm:flex-initial sm:min-w-[170px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-karla text-sm font-semibold tracking-wide bg-[#21272E] hover:bg-[#161A1F] active:bg-[#0E1114] text-[#F8F7F4] shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#21272E]/40"
            aria-label={isLastStage ? "Concluir exercício" : "Próxima etapa"}
          >
            {isLastStage ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#A7B4C4]" />
                <span>Concluir</span>
              </>
            ) : (
              <>
                <span>{allCurrentMarksDone ? "Continuar" : "Próximo"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};
