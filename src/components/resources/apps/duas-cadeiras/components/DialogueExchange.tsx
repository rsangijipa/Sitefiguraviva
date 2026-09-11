import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { DialogueTurn, ChairConfig } from "../types";
import { Trash2, MessageSquare } from "lucide-react";

interface DialogueExchangeProps {
  turns: DialogueTurn[];
  chairA: ChairConfig;
  chairB: ChairConfig;
  onDeleteTurn?: (turnId: string) => void;
}

export const DialogueExchange: React.FC<DialogueExchangeProps> = ({
  turns,
  chairA,
  chairB,
  onDeleteTurn,
}) => {
  if (turns.length === 0) {
    return (
      <div
        id="empty-dialogue-guide"
        className="w-full max-w-2xl mx-auto rounded-xl border border-stone-200/70 bg-stone-50/50 p-6 sm:p-8 text-center"
      >
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-500">
          <MessageSquare className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">
          O diálogo ainda não começou
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
          Selecione a primeira cadeira acima, escreva o que essa perspectiva
          quer expressar e clique em &ldquo;Registrar e Trocar de Lugar&rdquo;.
          Deixe a conversa fluir de forma honesta e espontânea.
        </p>

        <div className="mt-4 pt-4 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="bg-white/80 p-3 rounded-lg border border-stone-200/50 text-xs text-stone-600">
            <span className="font-semibold text-stone-900 block mb-0.5">
              Cadeira A: {chairA.name}
            </span>
            <span className="text-stone-500 text-[11px]">
              Expresse suas necessidades, sentimentos ou argumentos imediatos.
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-stone-200/50 text-xs text-stone-600">
            <span className="font-semibold text-stone-900 block mb-0.5">
              Cadeira B: {chairB.name}
            </span>
            <span className="text-stone-500 text-[11px]">
              Troque de cadeira e sinta como é responder a partir deste outro
              ponto de vista.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="dialogue-turns-container"
      className="w-full max-w-2xl mx-auto space-y-3.5 my-2"
    >
      <div className="flex items-center justify-between px-1 text-xs text-stone-500">
        <span className="font-medium tracking-wide uppercase text-[11px]">
          Histórico do Diálogo ({turns.length}{" "}
          {turns.length === 1 ? "intervenção" : "intervenções"})
        </span>
        <span className="text-[11px] text-stone-400">
          Perspectivas alternadas
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {turns.map((turn, index) => {
            const isA = turn.chairId === "A";
            const speakerConfig = isA ? chairA : chairB;
            const timeStr = new Date(turn.timestamp).toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                id={`turn-${turn.id}`}
                className={`relative rounded-xl p-4 transition-all border ${
                  isA
                    ? "bg-white border-stone-200/90 sm:mr-8 shadow-2xs"
                    : "bg-stone-50/90 border-stone-200/90 sm:ml-8 shadow-2xs"
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isA
                          ? "bg-stone-900 text-stone-100"
                          : "bg-amber-950 text-amber-100"
                      }`}
                    >
                      Cadeira {turn.chairId}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {turn.speakerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400 font-mono">
                      #{index + 1} &bull; {timeStr}
                    </span>
                    {onDeleteTurn && (
                      <button
                        type="button"
                        onClick={() => onDeleteTurn(turn.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-600 text-stone-400 p-1 rounded transition-opacity"
                        title="Remover esta fala"
                        aria-label="Remover fala"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {turn.text}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
