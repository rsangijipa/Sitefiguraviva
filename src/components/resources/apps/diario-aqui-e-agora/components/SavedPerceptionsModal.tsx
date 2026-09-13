import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Calendar,
  ShieldCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { SavedPerception } from "../types";

interface SavedPerceptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedPerception[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const SavedPerceptionsModal: React.FC<SavedPerceptionsModalProps> = ({
  isOpen,
  onClose,
  savedList,
  onDelete,
  onClearAll,
}) => {
  const [selectedItem, setSelectedItem] = useState<SavedPerception | null>(
    null,
  );

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleExportAll = () => {
    const jsonString = JSON.stringify(savedList, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `minhas-percepcoes-aqui-e-agora-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div
        id="saved-perceptions-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1918]/45 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="saved-perceptions-modal"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#fbf9f5] border border-[#e8dfd2] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#eee6da]">
            <div>
              <h3 className="font-serif-awareness text-2xl text-[#2b2724]">
                Percepções Guardadas
              </h3>
              <p className="text-xs text-[#78716c] mt-0.5">
                Armazenamento 100% pessoal no seu navegador
              </p>
            </div>
            <button
              id="btn-close-saved-modal"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#eee5d8] text-[#6b645c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-[#f0eae0] flex items-center justify-center mx-auto mb-3 text-[#8a8177]">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-base font-serif-awareness text-[#3a3531] mb-1">
                  Nenhuma percepção guardada ainda
                </p>
                <p className="text-xs text-[#7a7269] max-w-xs mx-auto">
                  Ao concluir um ciclo de awareness, você pode optar por salvar
                  sua percepção neste dispositivo.
                </p>
              </div>
            ) : (
              savedList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffffff]/85 border border-[#e8dfd3] rounded-2xl p-4 shadow-2xs transition-all hover:border-[#cfc4b4]"
                >
                  <div className="flex items-center justify-between text-xs text-[#8c827a] mb-2 pb-2 border-b border-[#f2ebe1]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-[#a89e93] hover:text-red-600 rounded-md transition-colors"
                      title="Excluir percepção"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    {item.attention && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8e857b] font-medium block">
                          Atenção
                        </span>
                        <p className="text-[#332f2b]">{item.attention}</p>
                      </div>
                    )}
                    {item.body && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8e857b] font-medium block">
                          Corpo
                        </span>
                        <p className="text-[#332f2b]">{item.body}</p>
                      </div>
                    )}
                    {item.feeling && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8e857b] font-medium block">
                          Sensação
                        </span>
                        <p className="text-[#332f2b]">{item.feeling}</p>
                      </div>
                    )}
                    {item.need && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8e857b] font-medium block">
                          Necessidade (Figura)
                        </span>
                        <p className="text-[#332f2b]">{item.need}</p>
                      </div>
                    )}
                    {item.reflection && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#8e857b] font-medium block">
                          Permanência
                        </span>
                        <p className="text-[#332f2b]">{item.reflection}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with privacy reassurance & batch actions */}
          {savedList.length > 0 && (
            <div className="px-6 py-4 border-t border-[#eee6da] bg-[#f7f3ec] flex flex-wrap items-center justify-between gap-3 text-xs text-[#78716c]">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Nenhum dado é enviado a servidores externos</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportAll}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#d8cdbf] hover:bg-[#ebe2d5] text-[#4a4540] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar todas ({savedList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e8d7d7] text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar histórico</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
