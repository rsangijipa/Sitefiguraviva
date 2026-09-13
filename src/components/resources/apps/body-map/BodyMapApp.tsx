"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";

type RegionId =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "left-arm"
  | "right-arm"
  | "left-leg"
  | "right-leg"
  | "feet";

type Sensation = "tensão" | "calor" | "peso" | "formigamento" | "leveza";

interface Region {
  id: RegionId;
  label: string;
  position: string;
}

const regions: Region[] = [
  { id: "head", label: "Cabeça", position: "left-[43%] top-[6%]" },
  { id: "neck", label: "Pescoço", position: "left-[46%] top-[18%]" },
  { id: "chest", label: "Peito", position: "left-[43%] top-[27%]" },
  { id: "abdomen", label: "Abdômen", position: "left-[43%] top-[42%]" },
  { id: "left-arm", label: "Braço esquerdo", position: "left-[22%] top-[34%]" },
  { id: "right-arm", label: "Braço direito", position: "left-[67%] top-[34%]" },
  { id: "left-leg", label: "Perna esquerda", position: "left-[34%] top-[65%]" },
  { id: "right-leg", label: "Perna direita", position: "left-[56%] top-[65%]" },
  { id: "feet", label: "Pés", position: "left-[45%] top-[88%]" },
];

const sensations: Sensation[] = [
  "tensão",
  "calor",
  "peso",
  "formigamento",
  "leveza",
];

export default function BodyMapApp() {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("chest");
  const [marks, setMarks] = useState<Partial<Record<RegionId, Sensation>>>({});
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const selected = regions.find((region) => region.id === selectedRegion)!;
  const markedRegions = useMemo(
    () => regions.filter((region) => marks[region.id]),
    [marks],
  );

  useEffect(() => {
    if (completed) headingRef.current?.focus();
  }, [completed]);

  const chooseSensation = (sensation: Sensation) => {
    setMarks((current) => ({ ...current, [selectedRegion]: sensation }));
  };

  const complete = () => {
    setCompleted(true);
  };

  const reset = () => {
    setMarks({});
    setNote("");
    setSelectedRegion("chest");
    setCompleted(false);
  };

  if (completed) {
    return (
      <section className="flex min-h-full items-center justify-center bg-paper px-5 py-12">
        <div className="w-full max-w-2xl border-y border-primary/15 py-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-terra" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-terra">
            Mapa concluído
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-serif text-4xl text-primary focus:outline-none"
          >
            O corpo que você percebe agora
          </h2>
          {markedRegions.length ? (
            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
              {markedRegions.map((region) => (
                <li
                  key={region.id}
                  className="flex items-center justify-between border-b border-primary/10 py-2 text-sm"
                >
                  <span className="font-medium text-primary">
                    {region.label}
                  </span>
                  <span className="text-text/65">{marks[region.id]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mx-auto mt-6 max-w-md text-text/70">
              Nenhuma região foi marcada. Observar sem nomear também é uma forma
              válida de presença.
            </p>
          )}
          {note ? (
            <p className="mx-auto mt-6 max-w-lg italic text-text/70">
              “{note}”
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="resource-action resource-action--secondary mt-8"
          >
            <RotateCcw size={16} aria-hidden="true" /> Recomeçar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="body-map-title"
      className="min-h-full bg-paper px-4 py-8 sm:px-7"
    >
      <header className="mx-auto max-w-5xl border-b border-primary/12 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Perceber
        </p>
        <h2
          id="body-map-title"
          className="mt-2 font-serif text-4xl text-primary"
        >
          Mapa Corporal
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text/70 sm:text-base">
          Escolha uma região e associe a sensação mais próxima do que você nota.
          Nada é salvo.
        </p>
      </header>

      <div className="mx-auto mt-7 grid max-w-5xl gap-7 lg:grid-cols-[15rem_1fr_16rem]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">
            1. Região
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {regions.map((region) => {
              const active = region.id === selectedRegion;
              return (
                <button
                  key={region.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active
                      ? "border-primary bg-primary text-paper"
                      : "border-primary/15 bg-surface text-primary hover:border-terra/40"
                  }`}
                >
                  {region.label}
                  {marks[region.id] ? (
                    <span className="mt-0.5 block text-[11px] opacity-75">
                      {marks[region.id]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="img"
          aria-label={`Silhueta corporal. ${markedRegions.length} regiões marcadas.`}
          className="relative mx-auto h-[31rem] w-full max-w-[18rem] rounded-[45%_45%_35%_35%] border border-primary/10 bg-areia/65"
        >
          <div className="absolute left-1/2 top-8 h-16 w-14 -translate-x-1/2 rounded-full border-2 border-primary/25" />
          <div className="absolute left-1/2 top-24 h-56 w-28 -translate-x-1/2 rounded-[45%] border-2 border-primary/25" />
          <div className="absolute left-[26%] top-28 h-52 w-8 rotate-6 rounded-full border-2 border-primary/25" />
          <div className="absolute right-[26%] top-28 h-52 w-8 -rotate-6 rounded-full border-2 border-primary/25" />
          <div className="absolute bottom-12 left-[36%] h-48 w-10 rotate-2 rounded-full border-2 border-primary/25" />
          <div className="absolute bottom-12 right-[36%] h-48 w-10 -rotate-2 rounded-full border-2 border-primary/25" />
          {regions.map((region) => (
            <button
              key={region.id}
              type="button"
              aria-label={`${region.label}${marks[region.id] ? `: ${marks[region.id]}` : ": sem marcação"}`}
              aria-pressed={region.id === selectedRegion}
              onClick={() => setSelectedRegion(region.id)}
              className={`absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${region.position} ${
                marks[region.id]
                  ? "border-paper bg-terra shadow-[0_0_0_3px_rgba(132,84,57,0.2)]"
                  : "border-primary/30 bg-paper/90 hover:border-terra"
              }`}
            >
              <span className="sr-only">{region.label}</span>
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">
            2. Sensação em {selected.label}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {sensations.map((sensation) => (
              <button
                key={sensation}
                type="button"
                aria-pressed={marks[selectedRegion] === sensation}
                onClick={() => chooseSensation(sensation)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  marks[selectedRegion] === sensation
                    ? "border-terra bg-terra/10 font-semibold text-primary"
                    : "border-primary/15 text-primary hover:border-terra/45"
                }`}
              >
                {sensation}
              </button>
            ))}
          </div>
          <label
            htmlFor="body-map-note"
            className="mt-6 block text-xs font-bold uppercase tracking-widest text-primary/60"
          >
            Uma frase, se quiser
          </label>
          <textarea
            id="body-map-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-xl border border-primary/15 bg-surface p-3 text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            placeholder="O que chama sua atenção?"
          />
          <button
            type="button"
            onClick={complete}
            className="resource-action mt-5 w-full bg-primary text-paper"
          >
            <Check size={16} aria-hidden="true" /> Concluir mapa
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {marks[selectedRegion]
          ? `${selected.label}: ${marks[selectedRegion]}`
          : `${selected.label} selecionado`}
      </p>
    </section>
  );
}
