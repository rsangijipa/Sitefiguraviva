import React, { useState, useMemo } from "react";
import { Bookmark, Trash2, ArrowRight, BookOpen, Layers } from "lucide-react";
import { GestaltCard } from "../types";
import { CategoryGlyph } from "./CategoryGlyph";

interface FavoritesViewProps {
  cards: GestaltCard[];
  savedCardIds: string[];
  onOpenCard: (card: GestaltCard) => void;
  onRemoveFavorite: (cardId: string) => void;
  onBatchRemoveFavorites: (cardIds: string[]) => void;
  onExplore: () => void;
}

type SortOption = "recentes" | "tipo" | "autor" | "alfabetica";

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  cards,
  savedCardIds,
  onOpenCard,
  onRemoveFavorite,
  onBatchRemoveFavorites,
  onExplore,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("recentes");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter saved cards
  const savedCards = useMemo(() => {
    return cards.filter((c) => savedCardIds.includes(c.id));
  }, [cards, savedCardIds]);

  // Sort logic
  const sortedCards = useMemo(() => {
    const list = [...savedCards];
    if (sortBy === "tipo") {
      return list.sort((a, b) => a.type.localeCompare(b.type));
    }
    if (sortBy === "autor") {
      return list.sort((a, b) =>
        (a.author || "").localeCompare(b.author || ""),
      );
    }
    if (sortBy === "alfabetica") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    // 'recentes' preserves the order of savedCardIds
    return list.sort((a, b) => {
      const idxA = savedCardIds.indexOf(a.id);
      const idxB = savedCardIds.indexOf(b.id);
      return idxB - idxA;
    });
  }, [savedCards, sortBy, savedCardIds]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBatchRemove = () => {
    if (selectedIds.length > 0) {
      onBatchRemoveFavorites(selectedIds);
      setSelectedIds([]);
      setIsOrganizing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2D8CA] pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase block">
              Biblioteca Pessoal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-normal tracking-tight">
              Cartas guardadas
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#262B22] max-w-lg">
              “Conceitos e provocações que você quis manter por perto.”
            </p>
          </div>

          {/* Controls: Sort & Organizar */}
          {savedCards.length > 0 && (
            <div className="flex items-center gap-3 text-xs font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B6B63]">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg px-2.5 py-1.5 text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="tipo">Tipo</option>
                  <option value="autor">Autor</option>
                  <option value="alfabetica">Ordem alfabética</option>
                </select>
              </div>

              {/* Organizar (Batch select) */}
              <button
                onClick={() => {
                  setIsOrganizing(!isOrganizing);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  isOrganizing
                    ? "bg-[#F1E9DB] border-[#96551F] text-[#96551F] font-medium"
                    : "bg-[#FDFAF4] border-[#E2D8CA] text-[#262B22] hover:bg-[#F1E9DB]"
                }`}
              >
                {isOrganizing ? "Cancelar" : "Organizar"}
              </button>
            </div>
          )}
        </div>

        {/* Batch Action Bar if organizing */}
        {isOrganizing && (
          <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#E2D8CA] flex items-center justify-between text-xs font-sans">
            <span className="text-[#262B22] font-medium">
              {selectedIds.length}{" "}
              {selectedIds.length === 1
                ? "carta selecionada"
                : "cartas selecionadas"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedIds.length === savedCards.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(savedCards.map((c) => c.id));
                  }
                }}
                className="px-2.5 py-1 rounded bg-[#FDFAF4] border border-[#E2D8CA] text-[#262B22]"
              >
                {selectedIds.length === savedCards.length
                  ? "Desmarcar todas"
                  : "Selecionar todas"}
              </button>
              <button
                onClick={handleBatchRemove}
                disabled={selectedIds.length === 0}
                className="px-3 py-1 rounded bg-[#96551F] text-[#FDFAF4] disabled:opacity-40 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover dos favoritos</span>
              </button>
            </div>
          </div>
        )}

        {/* Saved Cards Grid or Empty State */}
        {sortedCards.length === 0 ? (
          /* Empty State according to spec:
             “Você ainda não guardou nenhuma carta.”
             “Quando alguma quiser ficar com você, escolha Guardar.” */
          <div className="text-center py-20 px-4 bg-[#FDFAF4] rounded-3xl border border-dashed border-[#E2D8CA] max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] flex items-center justify-center text-[#96551F] mx-auto">
              <Bookmark className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl text-[#005A1F] font-normal">
                Você ainda não guardou nenhuma carta.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
                Quando alguma quiser ficar com você, escolha Guardar.
              </p>
            </div>
            <button
              onClick={onExplore}
              className="mt-4 px-5 py-2.5 bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium rounded-xl inline-flex items-center gap-2 transition-colors"
            >
              <span>Explorar a coleção</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedCards.map((card) => {
              const isSelected = selectedIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    if (isOrganizing) {
                      handleSelectToggle(card.id);
                    } else {
                      onOpenCard(card);
                    }
                  }}
                  className={`group relative text-left p-5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between h-[210px] ${
                    isSelected
                      ? "bg-[#F1E9DB] border-[#96551F]"
                      : "bg-[#FDFAF4] hover:bg-[#F1E9DB] border-[#E2D8CA]"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider text-[#96551F]">
                      {card.code}
                    </span>

                    {isOrganizing ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectToggle(card.id)}
                        className="rounded accent-[#005A1F] w-4 h-4 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFavorite(card.id);
                        }}
                        className="p-1 text-[#96551F] hover:text-[#6B6B63] transition-colors"
                        title="Remover dos favoritos (seu histórico de estudo permanece)"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>

                  {/* Title in Fraunces */}
                  <div className="my-auto py-2">
                    <h4 className="font-serif text-base font-normal text-[#262B22] group-hover:text-[#005A1F] leading-snug line-clamp-3 transition-colors">
                      {card.title}
                    </h4>
                    {card.author && (
                      <span className="text-[11px] font-sans text-[#6B6B63] block mt-1 truncate">
                        {card.author}
                      </span>
                    )}
                  </div>

                  {/* Bottom Line */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2D8CA]/60 text-[10px] font-sans text-[#6B6B63]">
                    <span className="font-medium tracking-wider uppercase text-[#96551F]">
                      {card.type}
                    </span>
                    <CategoryGlyph category={card.category} size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
