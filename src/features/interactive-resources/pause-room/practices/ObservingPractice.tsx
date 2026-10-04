"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

interface PracticeProps {
  isActive: boolean;
  reducedMotion: boolean;
  onPhaseChange?: (phase: string) => void;
}

const steps = ["Uma cor", "Uma forma", "Uma textura"];

export function ObservingPractice({
  isActive,
  reducedMotion,
  onPhaseChange,
}: PracticeProps) {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!started || !isActive) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Eye size={36} className="text-primary/40" aria-hidden="true" />
        <p className="max-w-lg text-center font-serif text-xl text-primary sm:text-2xl">
          Encontre uma cor ao seu redor. Depois, perceba uma forma ou uma
          textura.
        </p>
        <button
          onClick={() => {
            setStarted(true);
            onPhaseChange?.("observar");
          }}
          className="min-h-[44px] rounded-xl border border-border bg-paper px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-areia focus:ring-gold focus:ring-offset-2"
        >
          Começar
        </button>
      </div>
    );
  }

  const current = steps[stepIndex];

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="font-serif text-lg text-primary">{current}</p>

      <div className="flex h-px w-full max-w-xs items-stretch">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i === stepIndex ? "bg-primary" : "bg-border"} transition-colors duration-500`}
            aria-hidden="true"
          />
        ))}
      </div>

      <svg
        viewBox="0 0 200 160"
        className="w-full max-w-xs"
        role="img"
        aria-label={`Ilustração para o passo: ${current}`}
      >
        <g>
          <circle
            cx="50"
            cy="60"
            r="30"
            className="fill-terra/15 stroke-terra/30"
            strokeWidth="1"
          />
          <rect
            x="90"
            y="30"
            width="50"
            height="50"
            rx="4"
            className="fill-igarape/10 stroke-igarape/25"
            strokeWidth="1"
          />
          <polygon
            points="140,100 165,55 190,100"
            className="fill-muted/10 stroke-muted/25"
            strokeWidth="1"
          />
          <line
            x1="10"
            y1="130"
            x2="180"
            y2="130"
            className="stroke-border/40"
            strokeWidth="1"
          />
          {stepIndex >= 1 && (
            <ellipse
              cx="100"
              cy="90"
              rx="20"
              ry="12"
              className="fill-primary/8 stroke-primary/20"
              strokeWidth="0.5"
            />
          )}
          {stepIndex >= 2 && (
            <>
              <circle cx="30" cy="120" r="3" className="fill-terra/30" />
              <circle cx="55" cy="118" r="3" className="fill-terra/25" />
              <circle cx="80" cy="122" r="3" className="fill-terra/20" />
            </>
          )}
        </g>
      </svg>

      <p className="max-w-md text-center text-muted">
        {stepIndex === 0 && "Observe a cor com detalhes."}
        {stepIndex === 1 && "Acompanhe o contorno da forma."}
        {stepIndex === 2 && "Note a superfície, ruga ou suavidade."}
      </p>

      <div className="flex gap-3">
        {stepIndex > 0 && (
          <button
            onClick={() => setStepIndex((v) => v - 1)}
            className="min-h-[44px] rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-terra hover:text-terra focus:ring-gold focus:ring-offset-2"
          >
            Voltar
          </button>
        )}
        <button
          onClick={() => {
            if (stepIndex < steps.length - 1) setStepIndex((v) => v + 1);
            else onPhaseChange?.("finalizar");
          }}
          className="min-h-[44px] rounded-xl border border-border bg-paper px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-areia focus:ring-gold focus:ring-offset-2"
        >
          {stepIndex < steps.length - 1 ? "Avançar" : "Concluir"}
        </button>
      </div>

      <button
        onClick={() => {
          setStarted(false);
          setStepIndex(0);
        }}
        className="mt-2 text-sm text-muted underline-offset-4 hover:text-terra hover:underline"
      >
        Não sei / Encerrar
      </button>
    </div>
  );
}
