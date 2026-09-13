"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Ear, Footprints, Pause, Wind } from "lucide-react";

const pauses = [
  {
    id: "body",
    title: "Sentir apoio",
    duration: "1 minuto",
    icon: Footprints,
    instruction:
      "Note três pontos em que seu corpo encontra apoio. Não precisa mudar nada.",
  },
  {
    id: "breath",
    title: "Acompanhar o ar",
    duration: "2 minutos",
    icon: Wind,
    instruction:
      "Perceba uma inspiração e uma expiração completas, no ritmo que já está presente.",
  },
  {
    id: "listen",
    title: "Escutar o entorno",
    duration: "1 minuto",
    icon: Ear,
    instruction:
      "Encontre o som mais próximo e depois o mais distante que consegue perceber.",
  },
  {
    id: "still",
    title: "Apenas permanecer",
    duration: "Sem tempo definido",
    icon: Pause,
    instruction:
      "Permaneça alguns instantes sem tarefa. Quando quiser, encerre a pausa.",
  },
] as const;

export default function SalaDePausaApp() {
  const [selectedId, setSelectedId] = useState<
    (typeof pauses)[number]["id"] | null
  >(null);
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selected = pauses.find((pause) => pause.id === selectedId);

  useEffect(() => {
    if (selectedId || completed) headingRef.current?.focus();
  }, [completed, selectedId]);

  const start = (id: (typeof pauses)[number]["id"]) => {
    setSelectedId(id);
    setCompleted(false);
  };
  const finish = () => {
    setCompleted(true);
  };

  if (completed) {
    return (
      <section className="flex min-h-full items-center justify-center bg-paper px-5 py-12 text-center">
        <div className="max-w-xl border-y border-primary/15 py-10">
          <Check className="mx-auto text-terra" aria-hidden="true" />
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 font-serif text-4xl text-primary focus:outline-none"
          >
            A pausa pode terminar aqui.
          </h2>
          <p className="mt-4 leading-relaxed text-text/70">
            Leve consigo apenas o que percebeu. Esta experiência não foi
            armazenada.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setCompleted(false);
              }}
              className="resource-action resource-action--secondary"
            >
              Escolher outra pausa
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (selected) {
    const Icon = selected.icon;
    return (
      <section className="flex min-h-full items-center justify-center bg-paper px-5 py-10">
        <div className="w-full max-w-2xl">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Voltar às opções
          </button>
          <div className="mt-8 border-y border-primary/15 py-10 text-center">
            <Icon className="mx-auto h-9 w-9 text-terra" aria-hidden="true" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-terra">
              {selected.duration}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-3 font-serif text-4xl text-primary focus:outline-none"
            >
              {selected.title}
            </h2>
            <p className="mx-auto mt-6 max-w-lg font-serif text-2xl leading-relaxed text-primary/85">
              {selected.instruction}
            </p>
            <button
              type="button"
              onClick={finish}
              className="resource-action mt-9 bg-primary text-paper"
            >
              Concluir esta pausa
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="pause-room-title"
      className="min-h-full bg-paper px-4 py-10 sm:px-7"
    >
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Regular
        </p>
        <h2
          id="pause-room-title"
          className="mt-3 font-serif text-4xl text-primary sm:text-5xl"
        >
          Sala de Pausa
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-text/70">
          Escolha somente o apoio que cabe neste momento. Nenhuma opção é
          obrigatória.
        </p>
      </header>
      <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
        {pauses.map((pause) => {
          const Icon = pause.icon;
          return (
            <button
              key={pause.id}
              type="button"
              onClick={() => start(pause.id)}
              className="group min-h-32 rounded-xl border border-primary/15 bg-surface p-5 text-left transition hover:border-terra/45 hover:bg-areia/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="flex items-start justify-between gap-4">
                <Icon className="text-terra" size={22} aria-hidden="true" />
                <span className="text-xs text-primary/55">
                  {pause.duration}
                </span>
              </span>
              <span className="mt-5 block font-serif text-2xl text-primary">
                {pause.title}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
