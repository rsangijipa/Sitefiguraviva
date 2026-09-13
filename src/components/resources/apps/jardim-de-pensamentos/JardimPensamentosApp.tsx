"use client";
import { useState } from "react";
export default function JardimPensamentosApp() {
  const [text, setText] = useState("");
  const [leaves, setLeaves] = useState<string[]>([]);
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-areia px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          REGULAR · JARDIM DE PENSAMENTOS
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Um pensamento pode ficar aqui.
        </h2>
        <p className="mt-3 text-text/70">
          Escreva uma frase curta e escolha como se relacionar com ela. Nada é
          salvo por padrão.
        </p>
        <div className="mt-8 flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                setLeaves((l) => [...l, text.trim()]);
                setText("");
              }
            }}
            className="min-h-12 flex-1 rounded-xl border border-primary/20 bg-paper px-4"
            placeholder="Um pensamento que está presente..."
          />
          <button
            className="resource-action bg-primary text-paper"
            onClick={() => {
              if (text.trim()) {
                setLeaves((l) => [...l, text.trim()]);
                setText("");
              }
            }}
          >
            Colocar no jardim
          </button>
        </div>
        <div className="relative mt-8 min-h-64 rounded-[24px] border-2 border-primary/10 bg-paper p-6">
          <div className="absolute bottom-5 left-5 right-5 h-1 rounded-full bg-igarape/40" />
          {leaves.length === 0 ? (
            <p className="py-20 text-center font-serif text-xl italic text-primary/55">
              O jardim está aberto.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-4">
              {leaves.map((leaf, i) => (
                <div
                  key={`${leaf}-${i}`}
                  className="max-w-xs rounded-[45%_45%_45%_12%] border-2 border-primary/20 bg-[#01C94D]/20 px-4 py-5 text-sm text-primary"
                >
                  <p>{leaf}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="text-xs underline"
                      onClick={() =>
                        setLeaves((l) => l.filter((_, j) => j !== i))
                      }
                    >
                      Soltar
                    </button>
                    <button
                      className="text-xs underline"
                      onClick={() =>
                        setLeaves((l) =>
                          l.map((v, j) => (j === i ? `${v} ` : v)),
                        )
                      }
                    >
                      Deixar aqui
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="mt-6 text-sm text-primary underline"
          onClick={() => setLeaves([])}
        >
          Limpar tudo sem salvar
        </button>
      </div>
    </div>
  );
}
