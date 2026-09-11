"use client";
import { useState } from "react";
export default function PolaridadesApp() {
  const [a, setA] = useState("aproximar");
  const [b, setB] = useState("afastar");
  const [position, setPosition] = useState(50);
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="flex h-full min-h-0 overflow-y-auto bg-paper p-6 text-center">
        <div className="m-auto">
          <h2 className="font-serif text-4xl text-primary">
            Você pode permanecer com essa tensão.
          </h2>
          <p className="mt-3 text-text/70">
            Não há resultado ou posição correta.
          </p>
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
          EXPERIMENTAR · POLARIDADES
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Duas tendências podem coexistir.
        </h2>
        <p className="mt-3 text-text/70">
          Crie dois polos e perceba onde você se encontra agora.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-primary">
            Polo A
            <input
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="mt-2 w-full rounded-xl border border-primary/20 bg-areia p-3 font-normal"
            />
          </label>
          <label className="text-sm font-bold text-primary">
            Polo B
            <input
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-2 w-full rounded-xl border border-primary/20 bg-areia p-3 font-normal"
            />
          </label>
        </div>
        <div className="mt-12">
          <div className="flex justify-between font-serif text-xl text-primary">
            <span>{a || "Polo A"}</span>
            <span>{b || "Polo B"}</span>
          </div>
          <input
            aria-label="Posição atual entre os polos"
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-5 w-full accent-primary"
          />
          <p className="mt-3 text-center text-sm text-text/65">
            Onde você se percebe agora?
          </p>
        </div>
        <label className="mt-8 block text-sm font-bold text-primary">
          Uma reflexão, se quiser
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
