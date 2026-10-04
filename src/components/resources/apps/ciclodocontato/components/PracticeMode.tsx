import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { ScenarioItem, ContactStage } from "../types";

interface PracticeModeProps {
  scenarios: ScenarioItem[];
  stages: ContactStage[];
}

export function PracticeMode({ scenarios, stages }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const scenario = scenarios[currentIndex] || scenarios[0];
  if (!scenario) {
    return (
      <div className="p-8 text-center text-[#4B4B49]">
        Nenhum cenário cadastrado no momento.
      </div>
    );
  }

  const handleSelect = (stageSlug: string) => {
    setSelectedAnswer(stageSlug);
    setShowDiscussion(true);
  };

  const handleNextScenario = () => {
    setSelectedAnswer(null);
    setShowDiscussion(false);
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96551F]">
            Modo Aplicar · Cenário {currentIndex + 1} de {scenarios.length}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#262B22]">
            {scenario.title}
          </h2>
        </div>
        <span className="rounded-xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/50 px-3 py-1 text-xs font-semibold text-[#4B4B49] capitalize">
          {scenario.difficulty}
        </span>
      </div>

      <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 sm:p-10 shadow-none">
        <div className="rounded-2xl border-2 border-[#D8CFBE] bg-[#F1E9DB]/40 p-5 mb-6">
          <span className="block font-semibold text-xs uppercase tracking-wider text-[#96551F] mb-1">
            Situação
          </span>
          <p className="text-base sm:text-lg text-[#262B22] leading-relaxed">
            {scenario.context}
          </p>
        </div>

        <p className="font-serif text-lg font-semibold text-[#262B22] mb-4">
          {scenario.content.prompt}
        </p>

        {scenario.activityType === "position_on_cycle" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {stages.map((st) => {
              const isChosen = selectedAnswer === st.slug;
              const isTarget = scenario.content.targetStageSlug === st.slug;
              let btnStyle =
                "border-[#F1E9DB] bg-[#FDFAF4] text-[#262B22] hover:border-[#96551F]";
              if (showDiscussion) {
                if (isTarget)
                  btnStyle =
                    "border-[#005A1F] bg-[#005A1F]/10 text-[#005A1F] font-bold";
                else if (isChosen)
                  btnStyle = "border-[#FE538B] bg-[#FE538B]/10 text-[#FE538B]";
              }

              return (
                <button
                  key={st.slug}
                  type="button"
                  onClick={() => !showDiscussion && handleSelect(st.slug)}
                  disabled={showDiscussion}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition text-center ${btnStyle}`}
                >
                  <span className="text-xs uppercase tracking-wider text-[#6B6B63] mb-1">
                    Etapa {st.position}
                  </span>
                  <span className="font-serif font-semibold text-base">
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {scenario.activityType === "reflection" && !showDiscussion && (
          <div className="mb-6">
            <textarea
              placeholder="Escreva sua reflexão sobre esta situação..."
              rows={3}
              className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-3 text-sm text-[#262B22] placeholder:text-[#6B6B63]/60 focus:border-[#005A1F] focus:outline-none mb-3"
            />
            <button
              type="button"
              onClick={() => setShowDiscussion(true)}
              className="rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-5 py-2.5 text-xs font-semibold text-[#FDFAF4] hover:bg-[#07614C]"
            >
              Ver leitura pedagógica
            </button>
          </div>
        )}

        {showDiscussion && (
          <div className="mt-6 rounded-2xl border-2 border-[#005A1F]/20 bg-[#07614C]/5 p-5 animate-fadeIn">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#005A1F] mb-2">
              <Sparkles size={14} aria-hidden="true" />
              Discussão pedagógica (Uma leitura possível)
            </span>
            <p className="text-sm sm:text-base text-[#262B22] leading-relaxed mb-3">
              {scenario.feedback.discussion}
            </p>
            {scenario.feedback.alternativeReadings &&
              scenario.feedback.alternativeReadings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#005A1F]/15">
                  <span className="block text-xs font-semibold text-[#96551F] mb-1">
                    Outras perspectivas:
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#4B4B49]">
                    {scenario.feedback.alternativeReadings.map((ar, i) => (
                      <li key={i}>{ar}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t-2 border-[#F1E9DB] pt-6">
          <span className="text-xs text-[#6B6B63]">
            Exercício formativo sem caráter punitivo ou diagnóstico.
          </span>
          <button
            type="button"
            onClick={handleNextScenario}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-6 py-2.5 text-sm font-semibold text-[#FDFAF4] transition hover:bg-[#07614C]"
          >
            <span>Próximo cenário</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
