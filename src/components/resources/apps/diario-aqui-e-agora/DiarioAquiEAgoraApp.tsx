"use client";
import { useState } from "react";
const prompts = [
  "Agora eu percebo...",
  "No meu corpo...",
  "Algo que se torna figura...",
  "Neste momento eu quero...",
];
export default function DiarioAquiEAgoraApp() {
  const [mode, setMode] = useState<"guided" | "free" | "quick">("guided");
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<string[]>(["", "", "", ""]);
  if (saved)
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto bg-paper p-6 text-center">
        <div>
          <h2 className="font-serif text-4xl text-primary">
            Registro guardado localmente nesta sessão.
          </h2>
          <p className="mt-3 text-text/70">
            O salvamento no diário será conectado à sua conta.
          </p>
          <button
            className="resource-action mt-8 bg-primary text-paper"
            onClick={() => setSaved(false)}
          >
            Novo registro
          </button>
        </div>
      </div>
    );
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-paper px-5 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          DIÁRIO · AQUI E AGORA
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Um espaço para notar.
        </h2>
        <p className="mt-3 text-sm text-text/65">
          Este registro é pessoal. Nada é enviado ao painel administrativo.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["guided", "Perguntas guiadas"],
              ["free", "Escrita livre"],
              ["quick", "Registro rápido"],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`min-h-11 rounded-xl border px-4 text-sm ${mode === key ? "border-primary bg-primary text-paper" : "border-primary/20 text-primary"}`}
            >
              {text}
            </button>
          ))}
        </div>
        {mode === "free" ? (
          <textarea
            aria-label="Escrita livre"
            className="mt-8 min-h-64 w-full rounded-xl border border-primary/20 bg-areia p-4"
            placeholder="Escreva o que quiser guardar..."
          />
        ) : mode === "quick" ? (
          <textarea
            aria-label="Registro rápido"
            className="mt-8 min-h-32 w-full rounded-xl border border-primary/20 bg-areia p-4"
            placeholder="O que se apresenta agora?"
          />
        ) : (
          <div className="mt-8 space-y-5">
            {prompts.map((prompt, i) => (
              <label
                key={prompt}
                className="block font-serif text-xl text-primary"
              >
                {prompt}
                <textarea
                  value={values[i]}
                  onChange={(e) =>
                    setValues((v) =>
                      v.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  className="mt-2 min-h-24 w-full rounded-xl border border-primary/20 bg-areia p-3 font-sans text-base"
                />
              </label>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="resource-action bg-primary text-paper"
            onClick={() => setSaved(true)}
          >
            Guardar esta percepção
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={() => setSaved(false)}
          >
            Finalizar sem salvar
          </button>
        </div>
      </div>
    </div>
  );
}
