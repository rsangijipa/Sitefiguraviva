import type { ClientThought } from "../types";

interface ThoughtLeafProps {
  leaf: ClientThought;
  onRemove: () => void;
  onSave: () => void;
  onFloat: () => void;
  isSaved: boolean;
  onClick?: () => void;
}

export function ThoughtLeaf({
  leaf,
  onRemove,
  onSave,
  onFloat,
  isSaved,
  onClick,
}: ThoughtLeafProps) {
  const displayText =
    leaf.thoughtText.length > 120
      ? leaf.thoughtText.slice(0, 120) + "..."
      : leaf.thoughtText;

  return (
    <div
      role="article"
      aria-label={`Pensamento: ${leaf.thoughtText}`}
      className={`group relative max-w-xs rounded-[24px] border-2 p-5 transition-transform duration-200 ${
        isSaved
          ? "border-[#005A1F]/30 bg-[#FDFAF4]"
          : "border-[#96551F]/20 bg-[#01C94D]/15"
      }`}
      style={{
        transformOrigin: "center bottom",
      }}
    >
      <div className="space-y-3">
        <p className="font-serif text-sm leading-relaxed text-[#262B22]">
          {leaf.thoughtText}
        </p>
        {isSaved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#005A1F]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#005A1F]">
            Guardado
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-[#D8CFBE]/50">
        {!isSaved && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className="text-xs font-bold text-[#005A1F] underline hover:no-underline min-h-[44px] inline-flex items-center"
            >
              Guardar no meu histórico
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFloat();
              }}
              className="text-xs text-[#6B6B63] underline hover:no-underline min-h-[44px] inline-flex items-center"
            >
              Observar flutuar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-red-600 underline hover:no-underline min-h-[44px] inline-flex items-center"
            >
              Retirar desta sessão
            </button>
          </>
        )}
        {isSaved && (
          <span className="text-xs text-[#6B6B63]">
            A cópia guardada permanece no hist\u00f3rico.
          </span>
        )}
      </div>
    </div>
  );
}
