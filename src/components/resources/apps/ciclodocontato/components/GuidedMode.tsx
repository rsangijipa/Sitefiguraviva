import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Compass,
  Eye,
  Sparkles,
} from "lucide-react";
import { ContactStage, LevelType } from "../types";

interface GuidedModeProps {
  stages: ContactStage[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  savedStages: string[];
  onToggleSave: (slug: string) => void;
  onFinish: () => void;
  onSwitchToFree: () => void;
  reflections: Record<string, string>;
  onSaveReflection: (key: string, val: string) => void;
}

export function GuidedMode({
  stages,
  currentIndex,
  setCurrentIndex,
  savedStages,
  onToggleSave,
  onFinish,
  onSwitchToFree,
  reflections,
  onSaveReflection,
}: GuidedModeProps) {
  const [level, setLevel] = useState<LevelType>("essential");
  const stage = stages[currentIndex] || stages[0];
  const isSaved = savedStages.includes(stage.slug);
  const reflectionKey = `guided-${stage.slug}`;
  const [textVal, setTextVal] = useState(reflections[reflectionKey] || "");

  useEffect(() => {
    setTextVal(reflections[reflectionKey] || "");
  }, [stage.slug, reflections]);

  const handleNext = () => {
    if (currentIndex < stages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (currentIndex < stages.length - 1) setCurrentIndex(currentIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, stages.length, setCurrentIndex]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Progress & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#96551F]">
            Etapa {currentIndex + 1} de {stages.length}
          </span>
          <span className="text-xs text-[#6B6B63]">Percurso Guiado</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-1">
            <button
              type="button"
              onClick={() => setLevel("essential")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                level === "essential"
                  ? "bg-[#005A1F] text-[#FDFAF4]"
                  : "text-[#4B4B49] hover:text-[#262B22]"
              }`}
            >
              Essencial
            </button>
            <button
              type="button"
              onClick={() => setLevel("deep")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                level === "deep"
                  ? "bg-[#005A1F] text-[#FDFAF4]"
                  : "text-[#4B4B49] hover:text-[#262B22]"
              }`}
            >
              Aprofundar
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(stage.slug)}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-medium transition ${
              isSaved
                ? "border-[#96551F] bg-[#96551F] text-[#FDFAF4]"
                : "border-[#F1E9DB] bg-[#FDFAF4] text-[#4B4B49]"
            }`}
            title="Guardar conceito ou etapa"
          >
            <Bookmark size={14} aria-hidden="true" />
            <span>{isSaved ? "Guardado" : "Guardar"}</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 sm:p-10 shadow-none">
        <h2 className="font-serif text-3xl font-bold text-[#262B22]">
          {stage.label}
        </h2>
        <p className="mt-2 text-base font-medium text-[#96551F]">
          {stage.shortDefinition}
        </p>

        {/* Content */}
        <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-[#4B4B49]">
          {stage.essentialContent.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}

          {level === "deep" && (
            <div className="mt-6 border-t-2 border-[#F1E9DB] pt-6 space-y-4 text-sm text-[#4B4B49]">
              <h3 className="font-serif text-lg font-semibold text-[#262B22]">
                Aprofundamento teórico
              </h3>
              {stage.expandedContent.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}

              <div className="rounded-2xl border-2 border-[#D8CFBE] bg-[#F1E9DB]/40 p-4">
                <span className="block font-semibold text-xs uppercase tracking-wider text-[#96551F] mb-1">
                  Exemplo cotidiano
                </span>
                <p className="text-sm italic">{stage.everydayExample}</p>
              </div>

              {stage.clinicalExample && (
                <div className="rounded-2xl border-2 border-[#D8CFBE] bg-[#F1E9DB]/40 p-4">
                  <span className="block font-semibold text-xs uppercase tracking-wider text-[#96551F] mb-1">
                    Nota clínica (Gestalt)
                  </span>
                  <p className="text-sm italic">{stage.clinicalExample}</p>
                </div>
              )}

              {stage.references.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#F1E9DB]">
                  <span className="block font-semibold text-xs uppercase tracking-wider text-[#6B6B63] mb-2">
                    Referências
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#6B6B63]">
                    {stage.references.map((ref) => (
                      <li key={ref.id}>
                        {ref.author}. <i>{ref.title}</i> ({ref.year}).{" "}
                        {ref.publisher}.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reflection question */}
        <div className="mt-8 rounded-2xl border-2 border-[#005A1F]/20 bg-[#07614C]/5 p-5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#005A1F] mb-2">
            <Sparkles size={14} aria-hidden="true" />
            Pergunta para observar
          </span>
          <p className="font-serif text-base sm:text-lg italic text-[#262B22] mb-3">
            “{stage.reflectionQuestion}”
          </p>
          <textarea
            value={textVal}
            onChange={(e) => {
              setTextVal(e.target.value);
              onSaveReflection(reflectionKey, e.target.value);
            }}
            placeholder="Anote suas impressões (opcional e privado)..."
            rows={2}
            className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-3 text-sm text-[#262B22] placeholder:text-[#6B6B63]/60 focus:border-[#005A1F] focus:outline-none"
          />
          <span className="mt-1 block text-[11px] text-[#6B6B63]">
            Suas anotações são salvas localmente e permanecem privadas.
          </span>
        </div>

        {/* Navigation Controls */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#F1E9DB] pt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-semibold transition ${
              currentIndex === 0
                ? "border-[#F1E9DB] text-[#6B6B63]/40 cursor-not-allowed bg-[#FDFAF4]"
                : "border-[#F1E9DB] bg-[#FDFAF4] text-[#262B22] hover:border-[#96551F]"
            }`}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToFree}
              className="text-xs font-semibold text-[#96551F] hover:underline"
            >
              Explorar livremente
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-6 py-2.5 text-sm font-semibold text-[#FDFAF4] transition hover:bg-[#07614C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED701]"
            >
              <span>
                {currentIndex === stages.length - 1
                  ? "Encerrar percurso"
                  : "Continuar"}
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
