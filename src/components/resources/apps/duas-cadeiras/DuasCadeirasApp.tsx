"use client";
import { useState } from "react";
export default function DuasCadeirasApp() {
  const [chair, setChair] = useState<"A" | "B">("A");
  const [nameA, setNameA] = useState("Cadeira A");
  const [nameB, setNameB] = useState("Cadeira B");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto bg-paper p-6 text-center">
        <div>
          <h2 className="font-serif text-4xl text-primary">
            O diálogo pode permanecer aberto.
          </h2>
          <p className="mt-3 text-text/70">
            Esta é uma reflexão, não substitui acompanhamento terapêutico.
          </p>
          <button
            className="resource-action mt-8 bg-primary text-paper"
            onClick={() => setDone(false)}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  const active = chair === "A" ? textA : textB;
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-paper px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          EXPERIMENTAR · DUAS CADEIRAS
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Dê espaço a duas perspectivas.
        </h2>
        <p className="mt-3 text-sm text-text/70">
          Recurso de reflexão. Não substitui acompanhamento terapêutico e não
          envia seu texto para IA.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-primary">
            Nome da cadeira A
            <input
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="mt-2 w-full rounded-xl border border-primary/20 bg-areia p-3 font-normal"
            />
          </label>
          <label className="text-sm font-bold text-primary">
            Nome da cadeira B
            <input
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="mt-2 w-full rounded-xl border border-primary/20 bg-areia p-3 font-normal"
            />
          </label>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setChair("A")}
            className={`min-h-28 rounded-[24px] border-2 p-5 text-left font-serif text-2xl ${chair === "A" ? "border-primary bg-primary text-paper" : "border-primary/15 bg-areia text-primary"}`}
          >
            {nameA}
          </button>
          <button
            onClick={() => setChair("B")}
            className={`min-h-28 rounded-[24px] border-2 p-5 text-left font-serif text-2xl ${chair === "B" ? "border-primary bg-primary text-paper" : "border-primary/15 bg-areia text-primary"}`}
          >
            {nameB}
          </button>
        </div>
        <label className="mt-8 block font-serif text-2xl text-primary">
          {chair === "A" ? `${nameA} diz...` : `${nameB} responde...`}
          <textarea
            value={active}
            onChange={(e) =>
              chair === "A"
                ? setTextA(e.target.value)
                : setTextB(e.target.value)
            }
            className="mt-3 min-h-40 w-full rounded-xl border border-primary/20 bg-areia p-4 font-sans text-base"
            placeholder="Escreva a partir desta cadeira..."
          />
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="resource-action bg-primary text-paper"
            onClick={() => setChair(chair === "A" ? "B" : "A")}
          >
            Trocar de cadeira
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={() => setDone(true)}
          >
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}
