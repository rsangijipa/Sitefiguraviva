"use client";
import { useState } from "react";
const needs = [
  "descanso",
  "espaço",
  "apoio",
  "contato",
  "clareza",
  "expressão",
  "autonomia",
  "movimento",
  "proteção",
  "outra",
];
export default function NeedsNowApp() {
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="flex h-full min-h-0 overflow-y-auto bg-paper p-6 text-center">
        <div className="m-auto">
          <h2 className="font-serif text-4xl text-primary">
            Você pode levar essa percepção consigo.
          </h2>
          <button
            className="resource-action mt-8 bg-primary text-paper"
            onClick={() => setDone(false)}
          >
            Recomeçar
          </button>
        </div>
      </div>
    );
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-paper px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          PERCEBER · NECESSIDADES AGORA
        </p>
        <h2 className="mt-5 font-serif text-4xl text-primary">
          O que se torna figura?
        </h2>
        <p className="mt-3 text-text/70">
          Escolha o que chama sua atenção. Não há quantidade certa.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {needs.map((need) => (
            <button
              key={need}
              onClick={() =>
                setSelected((s) =>
                  s.includes(need) ? s.filter((x) => x !== need) : [...s, need],
                )
              }
              aria-pressed={selected.includes(need)}
              className={`min-h-14 rounded-xl border-2 px-3 text-left text-primary transition ${selected.includes(need) ? "border-primary bg-primary text-paper" : "border-primary/15 bg-areia hover:border-terra"}`}
            >
              {need}
            </button>
          ))}
        </div>
        <label className="mt-8 block text-sm font-bold text-primary">
          Uma nota, se quiser
          <textarea className="mt-2 min-h-28 w-full rounded-xl border border-primary/20 bg-areia p-3 font-normal" />
        </label>
        <button
          className="resource-action mt-8 bg-primary text-paper"
          onClick={() => setDone(true)}
        >
          Encerrar sem registrar
        </button>
      </div>
    </div>
  );
}
