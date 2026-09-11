"use client";
import { useState } from "react";
export default function IntensidadeAgoraApp() {
  const [value, setValue] = useState(5);
  const [label, setLabel] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="flex h-full min-h-0 overflow-y-auto bg-paper p-6 text-center">
        <div className="m-auto">
          <h2 className="font-serif text-4xl text-primary">
            Obrigado por permanecer com isso.
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
    <div className="h-full min-h-0 overflow-y-auto bg-paper px-5 py-12 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          PERCEBER · INTENSIDADE AGORA
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary sm:text-5xl">
          Que intensidade você percebe?
        </h2>
        <p className="mt-4 text-text/70">
          Uma intensidade alta não é necessariamente ruim. Apenas note a posição
          em que você se encontra.
        </p>
        <label
          className="mt-8 block text-sm font-bold text-primary"
          htmlFor="intensidade-label"
        >
          Uma palavra, se quiser
        </label>
        <input
          id="intensidade-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-2 w-full rounded-xl border border-primary/20 bg-areia px-4 py-3"
          placeholder="ex.: presença, aperto, energia"
        />
        <div className="mt-10">
          <label
            htmlFor="intensidade"
            className="flex items-center justify-between text-sm font-bold text-primary"
          >
            <span>Intensidade percebida</span>
            <strong className="font-serif text-3xl">{value}</strong>
          </label>
          <input
            id="intensidade"
            type="range"
            min="0"
            max="10"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="mt-5 w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text/60">
            <span>0 · quase não noto</span>
            <span>10 · muito presente</span>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-primary">
            O que muda no seu corpo?
            <textarea className="mt-2 min-h-28 w-full rounded-xl border border-primary/20 bg-areia p-3 font-sans font-normal" />
          </label>
          <label className="text-sm font-bold text-primary">
            O que você precisa neste momento?
            <textarea className="mt-2 min-h-28 w-full rounded-xl border border-primary/20 bg-areia p-3 font-sans font-normal" />
          </label>
        </div>
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
