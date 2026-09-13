import React from "react";
import { X, RotateCcw } from "lucide-react";
import { FilterState, CardType, CardCategory } from "../types";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  authors: string[];
  decks: string[];
  activeFilterCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  authors,
  decks,
  activeFilterCount,
}) => {
  if (!isOpen) return null;

  const categories: CardCategory[] = [
    "Conceitos",
    "Autores",
    "Perguntas",
    "Clínica",
    "Campo",
    "Fenomenologia",
  ];

  const types: CardType[] = [
    "CONCEITO",
    "AUTOR",
    "CLÍNICA",
    "CAMPO",
    "FENOMENOLOGIA",
    "PERGUNTA",
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#262B22]/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros da coleção"
        className="relative z-10 w-full max-w-sm bg-[#FDFAF4] border-l border-[#E2D8CA] h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2D8CA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-normal text-[#005A1F]">
              Filtros da Coleção
            </h2>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-mono bg-[#96551F] text-[#FDFAF4] px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B63] hover:text-[#262B22] rounded-lg hover:bg-[#F1E9DB] transition-colors"
            aria-label="Fechar filtros"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Filters Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-card-scroll p-5 space-y-6 text-xs font-sans">
          {/* Status / Progresso */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block">
              Exploração & Estado
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "all", label: "Todas as cartas" },
                { id: "favorites", label: "Favoritos" },
                { id: "review", label: "Para rever" },
                { id: "unseen", label: "Não vistas" },
                { id: "explored", label: "Já exploradas" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      filterBy: opt.id as FilterState["filterBy"],
                    })
                  }
                  className={`px-3 py-2 rounded-lg text-left transition-colors border ${
                    filters.filterBy === opt.id
                      ? "bg-[#005A1F] text-[#FDFAF4] border-[#005A1F] font-medium"
                      : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block">
              Categoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onFilterChange({ ...filters, category: "ALL" })}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  filters.category === "ALL"
                    ? "bg-[#005A1F] text-[#FDFAF4] border-[#005A1F] font-medium"
                    : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onFilterChange({ ...filters, category: cat })}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                    filters.category === cat
                      ? "bg-[#005A1F] text-[#FDFAF4] border-[#005A1F] font-medium"
                      : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Carta */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block">
              Tipo
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onFilterChange({ ...filters, type: "ALL" })}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  filters.type === "ALL"
                    ? "bg-[#96551F] text-[#FDFAF4] border-[#96551F] font-medium"
                    : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
                }`}
              >
                Todos
              </button>
              {types.map((tp) => (
                <button
                  key={tp}
                  onClick={() => onFilterChange({ ...filters, type: tp })}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                    filters.type === tp
                      ? "bg-[#96551F] text-[#FDFAF4] border-[#96551F] font-medium"
                      : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {/* Autor */}
          {authors.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block">
                Autor ou Tradição
              </label>
              <select
                value={filters.author}
                onChange={(e) =>
                  onFilterChange({ ...filters, author: e.target.value })
                }
                className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
              >
                <option value="ALL">Todos os autores</option>
                {authors.map((auth) => (
                  <option key={auth} value={auth}>
                    {auth}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Decks / Formações */}
          {decks.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block">
                Deck / Formação
              </label>
              <select
                value={filters.deck}
                onChange={(e) =>
                  onFilterChange({ ...filters, deck: e.target.value })
                }
                className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
              >
                <option value="ALL">Todos os decks</option>
                {decks.map((dk) => (
                  <option key={dk} value={dk}>
                    {dk}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E2D8CA] flex items-center justify-between bg-[#FDFAF4]">
          <button
            onClick={onResetFilters}
            className="text-xs text-[#6B6B63] hover:text-[#262B22] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar todos os filtros
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#005A1F] text-[#FDFAF4] text-xs font-medium rounded-lg hover:bg-[#004317] transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
