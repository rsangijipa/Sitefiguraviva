import React, { useState } from "react";
import { ArrowRight, Bookmark, Sparkles, Check, BookOpen } from "lucide-react";
import { ContactStage, LevelType } from "../types";

interface FreeModeProps {
  stages: ContactStage[];
  selectedStageSlug: string;
  onSelectStage: (slug: string) => void;
  savedStages: string[];
  onToggleSave: (slug: string) => void;
  reflections: Record<string, string>;
  onSaveReflection: (key: string, val: string) => void;
}

export function FreeMode({
  stages,
  selectedStageSlug,
  onSelectStage,
  savedStages,
  onToggleSave,
  reflections,
  onSaveReflection,
}: FreeModeProps) {
  const [level, setLevel] = useState<LevelType>("essential");
  const currentStage =
    stages.find((s) => s.slug === selectedStageSlug) || stages[0];
  const isSaved = savedStages.includes(currentStage.slug);
  const reflectionKey = `free-${currentStage.slug}`;
  const [textVal, setTextVal] = useState(reflections[reflectionKey] || "");

  React.useEffect(() => {
    setTextVal(reflections[reflectionKey] || "");
  }, [currentStage.slug, reflections]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Organic SVG Cycle Path (~60-65%) */}
        <div className="lg:col-span-7 rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96551F]">
                Exploração Livre
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#262B22]">
                O Percurso do Contato
              </h2>
            </div>
            <p className="text-xs text-[#6B6B63] max-w-[200px] text-right hidden sm:block">
              Toque em qualquer momento para focar na experiência.
            </p>
          </div>

          {/* Organic SVG Path Representation */}
          <div className="relative w-full py-4 flex flex-col items-center">
            <svg
              viewBox="0 0 600 420"
              className="w-full h-auto max-h-[380px] overflow-visible"
              aria-hidden="true"
            >
              {/* Confluência Gradient Def */}
              <defs>
                <linearGradient
                  id="confluenciaGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FE538B" />
                  <stop offset="50%" stopColor="#FED701" />
                  <stop offset="100%" stopColor="#01C94D" />
                </linearGradient>
              </defs>

              {/* Background field line / continuation */}
              <path
                d="M 50 80 Q 180 20, 300 120 T 550 140 Q 580 220, 500 320 Q 400 380, 250 350 Q 100 320, 70 400"
                fill="none"
                stroke="#D8CFBE"
                strokeWidth="4"
                strokeDasharray="6 6"
                opacity="0.6"
              />

              {/* Main organic active path */}
              <path
                d="M 60 90 C 180 20, 250 140, 310 130 C 380 120, 440 220, 500 210 C 530 200, 520 280, 450 320 C 380 360, 240 380, 160 340 C 100 310, 80 380, 70 410"
                fill="none"
                stroke="url(#confluenciaGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Stage coordinate map for 6 nodes */}
              {stages.map((st, index) => {
                // Approximate coordinates along the organic curve
                const coords = [
                  { x: 75, y: 95 }, // Sensação
                  { x: 230, y: 110 }, // Awareness
                  { x: 370, y: 170 }, // Mobilização
                  { x: 490, y: 220 }, // Ação
                  { x: 350, y: 345 }, // Contato (ponto de maior presença)
                  { x: 140, y: 360 }, // Retirada
                ][index] || { x: 100 + index * 80, y: 200 };

                const isSelected = st.slug === selectedStageSlug;

                return (
                  <g
                    key={st.slug}
                    className="cursor-pointer group"
                    onClick={() => onSelectStage(st.slug)}
                  >
                    {/* Outer pulse/ring if selected */}
                    {isSelected && (
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="28"
                        fill="none"
                        stroke="#005A1F"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isSelected ? 22 : 16}
                      fill={isSelected ? "#005A1F" : "#FDFAF4"}
                      stroke={isSelected ? "#FED701" : "#96551F"}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-300 group-hover:scale-110"
                    />

                    {/* Number / Label inside or beside */}
                    <text
                      x={coords.x}
                      y={coords.y + 5}
                      textAnchor="middle"
                      fill={isSelected ? "#FDFAF4" : "#262B22"}
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="var(--font-karla), sans-serif"
                    >
                      {index + 1}
                    </text>

                    {/* Stage Label */}
                    <foreignObject
                      x={coords.x - 65}
                      y={coords.y + (index === 4 || index === 5 ? 26 : -40)}
                      width="130"
                      height="35"
                    >
                      <button
                        type="button"
                        className={`w-full rounded-xl border-2 px-2 py-1 text-xs font-semibold shadow-none transition truncate ${
                          isSelected
                            ? "border-[#005A1F] bg-[#005A1F] text-[#FDFAF4]"
                            : "border-[#F1E9DB] bg-[#FDFAF4] text-[#262B22] hover:border-[#96551F]"
                        }`}
                      >
                        {st.label}
                      </button>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 border-t-2 border-[#F1E9DB] pt-4 flex flex-wrap items-center justify-between text-xs text-[#6B6B63]">
            <span>
              * O contato (5) é o ponto de maior presença, não um ponto final.
            </span>
            <span>A linha continua em direção ao fundo.</span>
          </div>
        </div>

        {/* Right Column: Contextual Panel (~35-40%) */}
        <div className="lg:col-span-5 rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#F1E9DB]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#96551F]">
                Momento Selecionado
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#262B22]">
                {currentStage.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onToggleSave(currentStage.slug)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-medium transition ${
                isSaved
                  ? "border-[#96551F] bg-[#96551F] text-[#FDFAF4]"
                  : "border-[#F1E9DB] bg-[#FDFAF4] text-[#4B4B49]"
              }`}
            >
              <Bookmark size={14} aria-hidden="true" />
              <span>{isSaved ? "Guardado" : "Guardar"}</span>
            </button>
          </div>

          <p className="mt-4 text-sm sm:text-base font-medium text-[#96551F]">
            {currentStage.shortDefinition}
          </p>

          <div className="mt-4 space-y-3 text-sm text-[#4B4B49] leading-relaxed">
            {currentStage.essentialContent.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border-2 border-[#D8CFBE] bg-[#F1E9DB]/40 p-4">
            <span className="block font-semibold text-xs uppercase tracking-wider text-[#96551F] mb-1">
              Exemplo cotidiano
            </span>
            <p className="text-sm italic">{currentStage.everydayExample}</p>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-[#005A1F]/20 bg-[#07614C]/5 p-4">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#005A1F] mb-1">
              <Sparkles size={14} aria-hidden="true" />
              Pergunta para observar
            </span>
            <p className="font-serif text-sm italic text-[#262B22] mb-3">
              “{currentStage.reflectionQuestion}”
            </p>
            <textarea
              value={textVal}
              onChange={(e) => {
                setTextVal(e.target.value);
                onSaveReflection(reflectionKey, e.target.value);
              }}
              placeholder="Reflexão privada..."
              rows={2}
              className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-xs text-[#262B22] placeholder:text-[#6B6B63]/60 focus:border-[#005A1F] focus:outline-none"
            />
          </div>

          <div className="mt-6">
            <span className="block text-xs font-semibold text-[#6B6B63] mb-2">
              Conceitos relacionados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentStage.relatedConcepts.map((rc, i) => (
                <span
                  key={i}
                  className="rounded-xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/40 px-2.5 py-1 text-xs text-[#4B4B49]"
                >
                  {rc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
