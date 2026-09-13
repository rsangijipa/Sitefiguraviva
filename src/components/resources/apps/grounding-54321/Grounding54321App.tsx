"use client";
import { useState } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
const steps = [
  "coisas que você vê",
  "coisas que pode sentir pelo toque",
  "sons que percebe",
  "cheiros",
  "sabor ou sensação da boca",
];
export default function Grounding54321App() {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [muted, setMuted] = useState(true);
  const total = 5 - step;
  const reset = () => {
    setStep(0);
    setCount(0);
  };
  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setCount(0);
    } else setStep(steps.length);
  };
  if (step === steps.length)
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto bg-paper px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Travessia concluída
        </p>
        <h2 className="mt-3 font-serif text-4xl text-primary">
          Você pode permanecer por aqui.
        </h2>
        <p className="mt-4 max-w-md text-text/70">
          Não é preciso registrar o que percebeu.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            className="resource-action bg-primary text-paper"
            onClick={reset}
          >
            <RotateCcw size={16} />
            Recomeçar
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={reset}
          >
            Fazer sem registrar
          </button>
        </div>
      </div>
    );
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-paper px-5 py-12 sm:px-10">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          5 · 4 · 3 · 2 · 1
        </p>
        <div
          className="mt-4 font-serif text-[8rem] leading-none text-primary"
          aria-live="polite"
        >
          {total}
        </div>
        <h2 className="mt-4 max-w-lg font-serif text-3xl text-primary sm:text-4xl">
          {total} {steps[step]}
        </h2>
        <p className="mt-4 max-w-md text-text/70">
          Olhe, escute e sinta o que existe ao seu redor. Toque uma marca a cada
          coisa percebida.
        </p>
        <div
          className="mt-8 flex flex-wrap justify-center gap-3"
          aria-label={`Marcas: ${count} de ${total}`}
        >
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Marcar item ${i + 1}`}
              aria-pressed={i < count}
              onClick={() => setCount((c) => Math.min(total, c + 1))}
              className={`h-12 w-12 rounded-full border-2 transition ${i < count ? "border-primary bg-primary text-paper" : "border-névoa bg-areia text-primary"}`}
            >
              {i < count ? "✓" : i + 1}
            </button>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            className="resource-action bg-primary text-paper disabled:opacity-40"
            disabled={count < total}
            onClick={next}
          >
            {step === steps.length - 1 ? "Encerrar" : "Próxima etapa"}
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={next}
          >
            Pular
          </button>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 px-4 text-sm text-primary"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}{" "}
            {muted ? "Áudio desligado" : "Áudio ligado"}
          </button>
        </div>
        <button
          className="mt-8 text-sm text-primary underline underline-offset-4"
          onClick={reset}
        >
          Fazer sem registrar
        </button>
      </div>
    </div>
  );
}
