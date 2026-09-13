"use client";
import { useState } from "react";
const prompts = [
  "Uma palavra ou sensação que aparece",
  "A energia que percebo",
  "No meu corpo",
  "Algo que precisa de atenção",
];
export default function CheckInApp() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const finish = () => setStep(4);
  if (step === 4)
    return (
      <div className="flex h-full min-h-0 overflow-y-auto bg-paper p-6 text-center">
        <div className="m-auto">
          <h2 className="font-serif text-4xl text-primary">
            Você pode seguir no seu ritmo.
          </h2>
          <p className="mt-3 text-text/70">
            Este check-in não é uma avaliação clínica.
          </p>
          <button
            className="resource-action mt-8 bg-primary text-paper"
            onClick={() => setStep(0)}
          >
            Recomeçar
          </button>
        </div>
      </div>
    );
  return (
    <div className="flex h-full min-h-0 overflow-y-auto bg-paper px-6 py-12">
      <div className="m-auto w-full max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          PERCEBER · CHECK-IN
        </p>
        <h2 className="mt-5 font-serif text-4xl text-primary">
          Como você chega agora?
        </h2>
        <p className="mt-3 text-text/70">
          Tudo é opcional. Você pode apenas continuar.
        </p>
        <label className="mt-10 block font-serif text-2xl text-primary">
          {prompts[step]}
          <textarea
            autoFocus
            value={answers[step]}
            onChange={(e) =>
              setAnswers((a) =>
                a.map((v, i) => (i === step ? e.target.value : v)),
              )
            }
            className="mt-3 min-h-32 w-full rounded-xl border border-primary/20 bg-areia p-4 font-sans text-base"
          />
        </label>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="resource-action bg-primary text-paper"
            onClick={() => (step < 3 ? setStep(step + 1) : finish())}
          >
            {step < 3 ? "Continuar" : "Encerrar"}
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={() => (step < 3 ? setStep(step + 1) : finish())}
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}
