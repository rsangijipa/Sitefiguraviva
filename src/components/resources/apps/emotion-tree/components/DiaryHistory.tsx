import React, { useState } from "react";
import {
  Bookmark,
  Calendar,
  Compass,
  Download,
  Search,
  Trash2,
  X,
  Sparkles,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { DiaryEntry } from "../types";

interface DiaryHistoryProps {
  entries: DiaryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  entries,
  isOpen,
  onClose,
  onDeleteEntry,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamilyFilter, setSelectedFamilyFilter] =
    useState<string>("all");

  if (!isOpen) return null;

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesFamily =
      selectedFamilyFilter === "all" ||
      entry.emotion_family === selectedFamilyFilter;
    const matchesSearch =
      searchTerm === "" ||
      entry.emotion_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.custom_label &&
        entry.custom_label.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.body_note &&
        entry.body_note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.reflection &&
        entry.reflection.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFamily && matchesSearch;
  });

  // Unique families from entries
  const availableFamilies = Array.from(
    new Set(entries.map((e) => e.emotion_family)),
  );

  // Export JSON / Text
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `roda_emocoes_diario_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs"
      id="modal-diary-history"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-modal-title"
    >
      <div className="bg-[#FAF8F5] border border-[#DDD1C2] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl text-[#2B2520] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8DFD3] flex items-center justify-between bg-[#F5EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAE1D3] border border-[#D5C7B6] flex items-center justify-center text-[#705844]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="diary-modal-title"
                className="font-display text-base font-semibold text-[#251F1B]"
              >
                Meu Diário de Percepções
              </h2>
              <p className="text-xs text-[#7A6F64]">
                Registro cronológico de nuances afetivas e notas somáticas (sem
                julgamento de valor)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6A5E53] hover:text-[#231E1B] hover:bg-[#EAE1D4] transition-colors"
            aria-label="Fechar diário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Actions bar */}
        <div className="p-4 border-b border-[#E8DFD3] bg-[#F8F4EE] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7E72]" />
              <input
                type="text"
                placeholder="Buscar por palavra, sensação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D5C8B8] rounded-lg text-[#26201B] placeholder-[#9C8F83] focus:outline-none focus:border-[#38312B]"
              />
            </div>

            {/* Family filter */}
            {availableFamilies.length > 0 && (
              <select
                value={selectedFamilyFilter}
                onChange={(e) => setSelectedFamilyFilter(e.target.value)}
                className="text-xs py-1.5 px-2 bg-[#FFFFFF] border border-[#D5C8B8] rounded-lg text-[#3B322B] focus:outline-none focus:border-[#38312B]"
              >
                <option value="all">
                  Todas as famílias ({entries.length})
                </option>
                {availableFamilies.map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Export & count */}
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#EAE2D4] hover:bg-[#DFD5C6] border border-[#D0C2B0] rounded-lg text-[#40352D] transition-colors"
                  title="Exportar notas em formato JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Deseja realmente limpar todo o histórico do diário?",
                      )
                    ) {
                      onClearAll();
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1.5 text-[#8A4A40] hover:text-[#5E2B23] hover:bg-[#F4E3E0] rounded-lg transition-colors"
                  title="Apagar todas as entradas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content list */}
        <div
          className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3"
          id="diary-entries-list"
        >
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-[#7E7368]">
              <Compass className="w-8 h-8 mx-auto mb-2 text-[#ABA094]" />
              <p className="font-display text-sm font-medium text-[#3A332D]">
                {entries.length === 0
                  ? "Nenhuma percepção guardada ainda."
                  : "Nenhum registro encontrado com estes filtros."}
              </p>
              <p className="text-xs text-[#8F8376] mt-1 max-w-sm mx-auto">
                {entries.length === 0
                  ? 'Explore a roda ou use "Não encontrei uma palavra" para registrar como você percebe o momento presente.'
                  : "Tente alterar o termo de busca ou o filtro de família."}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#FFFFFF] border border-[#E4D9CC] rounded-xl p-4 transition-all hover:border-[#CFC0AE] shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EDE5DA] text-[#4A3E34] border border-[#D2C5B4]">
                        {entry.emotion_family}
                      </span>
                      {entry.intensity_label && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F4EDE4] text-[#635548] border border-[#DDD0C0]">
                          Intensidade: {entry.intensity_label} (
                          {entry.intensity}/5)
                        </span>
                      )}
                      <span className="text-[11px] text-[#918579] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#241E1A]">
                      {entry.custom_label ? (
                        <span className="italic">“{entry.custom_label}”</span>
                      ) : (
                        entry.emotion_label
                      )}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-[#9E9084] hover:text-[#80382E] p-1.5 rounded-md hover:bg-[#F7EFEF] transition-colors"
                    title="Excluir este registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Somatic location & note */}
                {(entry.body_location || entry.body_note) && (
                  <div className="mt-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] rounded-lg p-2.5 text-[#4A4036]">
                    <span className="font-semibold text-[#302822]">
                      No corpo:{" "}
                    </span>
                    {entry.body_location && (
                      <span className="font-medium text-[#574B40]">
                        [{entry.body_location}]{" "}
                      </span>
                    )}
                    {entry.body_note && <span>{entry.body_note}</span>}
                  </div>
                )}

                {/* Reflection */}
                {entry.reflection && (
                  <div className="mt-2 text-xs text-[#52463C] italic leading-relaxed pl-2.5 border-l-2 border-[#C9B9A6]">
                    “{entry.reflection}”
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-[#E8DFD3] bg-[#F6F0E7] text-[11px] text-[#786D62] flex items-center justify-between">
          <span>
            Este diário não classifica seus sentimentos. Toda experiência
            afetiva é legítima.
          </span>
          <span className="font-medium text-[#4D4238]">
            {entries.length} registros
          </span>
        </div>
      </div>
    </div>
  );
};
