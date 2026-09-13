"use client";
import { useState } from "react";
export default function JardimPensamentosApp() {
  const [text, setText] = useState("");
  const [leaves, setLeaves] = useState<string[]>([]);
  return (
    <div className="flex h-full min-h-0 flex-col bg-areia">
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          REGULAR · JARDIM DE PENSAMENTOS
        </p>
        <h2 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
          Um pensamento pode ficar aqui.
        </h2>
        <p className="mt-3 text-text/70">
          Escreva uma frase curta e escolha como se relacionar com ela. Nada é
          salvo por padrão.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
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
        <div className="relative mt-6 min-h-[min(52dvh,30rem)] rounded-xl border-2 border-primary/10 bg-paper p-5">
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
      </div>
      <footer className="flex justify-end border-t border-primary/10 bg-areia px-5 py-3 sm:px-8">
        <button className="min-h-11 px-3 text-sm text-primary underline" onClick={() => setLeaves([])}>Limpar tudo sem salvar</button>
      </footer>
    </div>
  );
}
