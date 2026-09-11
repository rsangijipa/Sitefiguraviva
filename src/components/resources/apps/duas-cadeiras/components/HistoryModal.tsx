import React from "react";
import { ReflectionSession } from "../types";
import { X, Trash2, ExternalLink, Calendar, MessageSquare } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ReflectionSession[];
  onSelectSession: (session: ReflectionSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div>
            <h3
              id="history-modal-title"
              className="text-base font-semibold text-stone-900"
            >
              Reflexões Salvas
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Armazenadas exclusivamente na memória privada do seu dispositivo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Fechar histórico"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              Nenhuma reflexão salva ainda.
            </div>
          ) : (
            sessions.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-200/80 p-3.5 hover:border-stone-300 transition-colors flex items-start justify-between gap-3 bg-stone-50/40"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectSession(item);
                      onClose();
                    }}
                  >
                    <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                      {item.title || "Diálogo sem título"}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.turns.length} falas
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1.5 line-clamp-1">
                      <span className="font-medium text-stone-700">
                        {item.chairA.name}
                      </span>{" "}
                      &times;{" "}
                      <span className="font-medium text-stone-700">
                        {item.chairB.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(item);
                        onClose();
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-200/60 transition-colors"
                      title="Abrir sessão"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSession(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
