import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowLeft, Bookmark } from "lucide-react";
import { GestaltCard, CardCategory, FilterState } from "../types";
import { CATEGORIES_DATA } from "../data/cards";
import { CategoryGlyph } from "./CategoryGlyph";
import { FilterDrawer } from "./FilterDrawer";

interface ExploreViewProps {
  cards: GestaltCard[];
  onOpenCard: (card: GestaltCard) => void;
  savedCardIds: string[];
  reviewCardIds: string[];
  exploredCardIds: string[];
  onToggleFavorite: (cardId: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  cards,
  onOpenCard,
  savedCardIds,
  reviewCardIds,
  exploredCardIds,
  onToggleFavorite,
}) => {
  const [selectedTerritory, setSelectedTerritory] =
    useState<CardCategory | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "ALL",
    type: "ALL",
    author: "ALL",
    deck: "ALL",
    filterBy: "all",
  });

  // Extract unique authors and decks
  const authors = useMemo(() => {
    const list = Array.from(
      new Set(cards.map((c) => c.author).filter(Boolean) as string[]),
    );
    return list.sort();
  }, [cards]);

  const decks = useMemo(() => {
    const list = Array.from(
      new Set(cards.map((c) => c.deck).filter(Boolean) as string[]),
    );
    return list.sort();
  }, [cards]);

  // Active filter counter
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "ALL") count++;
    if (filters.type !== "ALL") count++;
    if (filters.author !== "ALL") count++;
    if (filters.deck !== "ALL") count++;
    if (filters.filterBy !== "all") count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "ALL",
      type: "ALL",
      author: "ALL",
      deck: "ALL",
      filterBy: "all",
    });
    setSelectedTerritory(null);
  };

  // Filter logic
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Territory click or filter drawer category
      const targetCategory =
        selectedTerritory ||
        (filters.category !== "ALL" ? filters.category : null);
      if (targetCategory && card.category !== targetCategory) {
        return false;
      }

      // Type filter
      if (filters.type !== "ALL" && card.type !== filters.type) {
        return false;
      }

      // Author filter
      if (filters.author !== "ALL" && card.author !== filters.author) {
        return false;
      }

      // Deck filter
      if (filters.deck !== "ALL" && card.deck !== filters.deck) {
        return false;
      }

      // Status filter
      if (filters.filterBy === "favorites" && !savedCardIds.includes(card.id)) {
        return false;
      }
      if (filters.filterBy === "review" && !reviewCardIds.includes(card.id)) {
        return false;
      }
      if (filters.filterBy === "unseen" && exploredCardIds.includes(card.id)) {
        return false;
      }
      if (
        filters.filterBy === "explored" &&
        !exploredCardIds.includes(card.id)
      ) {
        return false;
      }

      // Search query (title, body, author, tags)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesBody = card.body.toLowerCase().includes(query);
        const matchesAuthor =
          card.author?.toLowerCase().includes(query) || false;
        const matchesTags = card.tags.some((t) =>
          t.toLowerCase().includes(query),
        );
        const matchesCode = card.code.toLowerCase().includes(query);

        if (
          !matchesTitle &&
          !matchesBody &&
          !matchesAuthor &&
          !matchesTags &&
          !matchesCode
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    cards,
    selectedTerritory,
    filters,
    savedCardIds,
    reviewCardIds,
    exploredCardIds,
  ]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Editorial Top Bar: Search & Compact Filter Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input with clean editorial styling */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B63]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Buscar conceito, autor ou palavra…"
              className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#262B22] placeholder-[#6B6B63] focus:outline-none focus:border-[#005A1F] transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6B63] hover:text-[#262B22]"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filter button that opens drawer */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-sans font-medium flex items-center gap-2 transition-colors ${
                activeFilterCount > 0
                  ? "bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]"
                  : "bg-[#FDFAF4] border-[#E2D8CA] text-[#262B22] hover:bg-[#F1E9DB]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Filtrar</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#005A1F] text-[#FDFAF4] text-[10px] flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#6B6B63] hover:text-[#262B22] underline underline-offset-2 px-1"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Territórios Editoriais (Visible when no category is drilled into, or as pill bar) */}
        {!selectedTerritory ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase block">
                  Territórios da Abordagem
                </span>
                <h2 className="font-serif text-2xl text-[#005A1F] font-normal tracking-tight">
                  Seis Portas de Entrada
                </h2>
              </div>
              <span className="text-xs font-sans text-[#6B6B63]">
                {cards.length} cartas no acervo
              </span>
            </div>

            {/* 6 Category Structural Cards (identical base, distinct abstract glyph & label) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {CATEGORIES_DATA.map((cat) => {
                const count = cards.filter(
                  (c) => c.category === cat.name,
                ).length;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedTerritory(cat.name)}
                    className="text-left p-5 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex items-start justify-between"
                  >
                    <div className="space-y-1.5 pr-3">
                      <span className="text-[10px] font-sans font-bold tracking-widest text-[#96551F] uppercase block">
                        {cat.type}
                      </span>
                      <h3 className="font-serif text-lg font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs font-sans text-[#6B6B63] leading-relaxed">
                        {cat.description}
                      </p>
                      <span className="inline-block pt-1 text-[11px] font-mono text-[#6B6B63]">
                        {count} cartas disponíveis
                      </span>
                    </div>

                    <div className="shrink-0 pt-0.5 text-[#262B22]/70 group-hover:text-[#005A1F] transition-colors">
                      <CategoryGlyph category={cat.name} size={30} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Territory Active Breadcrumb / Header */
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F1E9DB]/70 border border-[#E2D8CA]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTerritory(null)}
                className="w-8 h-8 rounded-full bg-[#FDFAF4] border border-[#E2D8CA] flex items-center justify-center text-[#262B22] hover:bg-[#E2D8CA] transition-colors"
                title="Voltar a todos os territórios"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-sans font-bold tracking-widest text-[#96551F] uppercase block">
                  Território Selecionado
                </span>
                <h2 className="font-serif text-xl text-[#005A1F] font-normal">
                  {selectedTerritory}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-[#6B6B63] font-mono">
                {filteredCards.length}{" "}
                {filteredCards.length === 1 ? "carta" : "cartas"}
              </span>
              <button
                onClick={() => setSelectedTerritory(null)}
                className="text-xs font-sans text-[#96551F] hover:underline"
              >
                Ver todos
              </button>
            </div>
          </div>
        )}

        {/* Collection Grid: 3-4 Desktop, 2-3 Tablet, 1-2 Mobile */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#E2D8CA]/80 pb-2">
            <span className="text-xs font-sans font-medium text-[#6B6B63]">
              Exibindo {filteredCards.length}{" "}
              {filteredCards.length === 1 ? "carta" : "cartas"}
            </span>
          </div>

          {filteredCards.length === 0 ? (
            /* Empty State according to spec: "Nenhuma carta encontrada com esses filtros." */
            <div className="text-center py-16 px-4 bg-[#FDFAF4] rounded-2xl border border-dashed border-[#E2D8CA]">
              <p className="font-serif text-lg text-[#262B22]">
                Nenhuma carta encontrada com esses filtros.
              </p>
              <p className="mt-1 text-xs font-sans text-[#6B6B63]">
                Tente ajustar os termos de busca ou remover as restrições
                selecionadas.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-[#F1E9DB] text-[#005A1F] rounded-lg text-xs font-sans font-medium hover:bg-[#E2D8CA] transition-colors"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.map((card) => {
                const isFav = savedCardIds.includes(card.id);
                const isRev = reviewCardIds.includes(card.id);
                const isExplored = exploredCardIds.includes(card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => onOpenCard(card)}
                    className="group relative text-left p-5 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors cursor-pointer flex flex-col justify-between h-[210px]"
                  >
                    {/* Top line: Code & Favorite */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wider text-[#96551F]">
                        {card.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isRev && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#96551F]"
                            title="Marcada para rever"
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(card.id);
                          }}
                          className={`p-1 rounded-full transition-colors ${
                            isFav
                              ? "text-[#96551F]"
                              : "text-[#6B6B63]/40 group-hover:text-[#6B6B63]"
                          }`}
                          title={isFav ? "Guardada" : "Guardar"}
                        >
                          <Bookmark
                            className="w-3.5 h-3.5"
                            strokeWidth={2}
                            fill={isFav ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Title in Fraunces */}
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

                    {/* Bottom: Type & Category icon */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2D8CA]/60 text-[10px] font-sans text-[#6B6B63]">
                      <span className="font-medium tracking-wider uppercase text-[#96551F]">
                        {card.type}
                      </span>
                      <div className="text-[#262B22]/60">
                        <CategoryGlyph category={card.category} size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        authors={authors}
        decks={decks}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
};
