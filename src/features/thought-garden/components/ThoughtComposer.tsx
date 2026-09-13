import { useState, useRef } from "react";

interface ThoughtComposerProps {
  onAdd: (text: string) => void;
  placeholder?: string;
  helpText?: string;
}

export function ThoughtComposer({
  onAdd,
  placeholder = "Escreva uma frase, se quiser...",
  helpText = "Um pensamento que est\u00e1 presente...",
}: ThoughtComposerProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isTruncated = text.length > 500;

  const handlePlace = () => {
    if (text.trim()) {
      onAdd(text);
      setText("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#96551F]">
        REGULAR \u00B7 JARDIM DE PENSAMENTOS
      </p>
      <h2 className="font-serif text-3xl sm:text-4xl text-[#005A1F]">
        Um pensamento pode ficar aqui.
      </h2>
      <p className="text-sm text-[#6B6B63] mt-1">{helpText}</p>
      <p className="text-xs text-[#6B6B63]/70">
        Escreva se quiser. Voc\u00ea pode guardar, observar ou deixar a folha
        sair desta experi\u00eancia.
      </p>

      <div className="mt-6 flex gap-3">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              handlePlace();
            }
          }}
          maxLength={501}
          className="flex-1 min-h-[48px] rounded-xl border border-[#D8CFBE] bg-[#FDFAF4] px-4 py-3 text-sm text-[#262B22] placeholder:text-[#6B6B63]/50 focus:outline-none focus:ring-2 focus:ring-[#005A1F]/30"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handlePlace}
          disabled={!text.trim()}
          className="min-h-[48px] min-w-[140px] rounded-xl bg-[#005A1F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#07614C] disabled:opacity-40 disabled:hover:bg-[#005A1F]"
        >
          Colocar no jardim
        </button>
      </div>
      <div className="flex justify-end items-center gap-2">
        {isTruncated && (
          <span className="text-xs text-red-600">
            Pr\u00f3ximo do limite de caracteres.
          </span>
        )}
        <span
          className={`text-xs ${text.length > 500 ? "text-red-600" : "text-muted"}`}
        >
          {text.length}/500
        </span>
      </div>
    </div>
  );
}
