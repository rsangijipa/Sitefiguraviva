"use client";
import { useState } from "react";
const shapes = [
  {
    label: "forma circular",
    className: "left-[18%] top-[25%] h-24 w-24 rounded-full bg-[#FE538B]/70",
  },
  {
    label: "linha curva",
    className:
      "right-[18%] top-[20%] h-40 w-8 rotate-45 rounded-full bg-[#01C94D]/60",
  },
  {
    label: "campo amarelo",
    className:
      "bottom-[22%] left-[35%] h-28 w-36 rounded-[45%] bg-[#FED701]/65",
  },
  {
    label: "pequeno ponto",
    className: "right-[30%] bottom-[25%] h-10 w-10 rounded-full bg-terra/70",
  },
];
export default function FiguraEFundoApp() {
  const [selected, setSelected] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-areia px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          EXPERIMENTAR · FIGURA E FUNDO
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Observe sem procurar nada.
        </h2>
        <p className="mt-3 text-text/70">O que apareceu primeiro para você?</p>
        <div
          className="relative mt-8 h-[min(55vh,420px)] overflow-hidden rounded-[24px] border-2 border-primary/15 bg-paper"
          role="group"
          aria-label="Campo visual interativo"
        >
          {shapes.map((shape, i) => (
            <button
              key={shape.label}
              aria-label={shape.label}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={`absolute ${shape.className} border-2 border-transparent transition-transform duration-500 ${selected === i ? "z-10 scale-125 border-primary" : "hover:scale-110"}`}
            />
          ))}
        </div>
        {selected !== null && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="font-serif text-xl text-primary">
              Você notou a {shapes[selected].label}.
            </p>
            <button
              className="resource-action bg-primary text-paper"
              onClick={() => {
                setSelected(null);
                setRound((r) => r + 1);
              }}
            >
              {round < 1 ? "Observar novamente" : "Encerrar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
