import React from "react";
import {
  History,
  BookOpen,
  Bookmark,
  Clock,
  ArrowRight,
  Compass,
} from "lucide-react";
import { GestaltCard, StudyStats } from "../types";
import { CategoryGlyph } from "./CategoryGlyph";

interface HistoryViewProps {
  stats: StudyStats;
  allCards: GestaltCard[];
  onOpenCard: (card: GestaltCard) => void;
  onNavigateExplore: () => void;
  onNavigateReview: () => void;
  onNavigateFavorites: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  stats,
  allCards,
  onOpenCard,
  onNavigateExplore,
  onNavigateReview,
  onNavigateFavorites,
}) => {
  // Recent explored cards
  const recentlyExploredCards = stats.history
    .slice(-8)
    .reverse()
    .map((item) => allCards.find((c) => c.id === item.cardId))
    .filter((c): c is GestaltCard => !!c);

  // Category counts
  const categoryCounts = allCards.reduce(
    (acc, card) => {
      if (stats.history.some((h) => h.cardId === card.id)) {
        acc[card.category] = (acc[card.category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Editorial Header */}
        <div className="space-y-2 border-b border-[#E2D8CA] pb-6">
          <span className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase block">
            Registro Pessoal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-normal tracking-tight">
            Minha exploração
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#262B22] max-w-xl">
            Um olhar silencioso sobre seus caminhos de leitura e permanência na
            Gestalt-terapia.
          </p>
        </div>

        {/* 4 Discrete Metric Blocks (No gamification, no "percentual dominado") */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#FDFAF4] border border-[#E2D8CA] flex flex-col justify-between h-28">
            <span className="text-[11px] font-sans font-medium text-[#6B6B63] uppercase tracking-wider">
              Cartas Exploradas
            </span>
            <span className="font-serif text-3xl text-[#005A1F] font-normal">
              {stats.exploredCardsCount}
            </span>
            <span className="text-[11px] font-sans text-[#6B6B63]">
              de {allCards.length} no acervo
            </span>
          </div>

          <div
            onClick={onNavigateFavorites}
            className="p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors cursor-pointer flex flex-col justify-between h-28"
          >
            <span className="text-[11px] font-sans font-medium text-[#6B6B63] uppercase tracking-wider">
              Favoritos
            </span>
            <span className="font-serif text-3xl text-[#96551F] font-normal">
              {stats.favoriteCardIds.length}
            </span>
            <span className="text-[11px] font-sans text-[#6B6B63] flex items-center justify-between">
              <span>cartas mantidas</span>
              <ArrowRight className="w-3 h-3 text-[#96551F]" />
            </span>
          </div>

          <div
            onClick={onNavigateReview}
            className="p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors cursor-pointer flex flex-col justify-between h-28"
          >
            <span className="text-[11px] font-sans font-medium text-[#6B6B63] uppercase tracking-wider">
              Para Rever
            </span>
            <span className="font-serif text-3xl text-[#262B22] font-normal">
              {stats.reviewCardIds.length}
            </span>
            <span className="text-[11px] font-sans text-[#6B6B63] flex items-center justify-between">
              <span>reencontros</span>
              <ArrowRight className="w-3 h-3 text-[#262B22]" />
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDFAF4] border border-[#E2D8CA] flex flex-col justify-between h-28">
            <span className="text-[11px] font-sans font-medium text-[#6B6B63] uppercase tracking-wider">
              Tempo de Estudo
            </span>
            <span className="font-serif text-3xl text-[#005A1F] font-normal">
              ~{stats.totalMinutesExplored}
            </span>
            <span className="text-[11px] font-sans text-[#6B6B63]">
              minutos de leitura
            </span>
          </div>
        </div>

        {/* Categorias Mais Visitadas */}
        <div className="p-6 rounded-3xl bg-[#FDFAF4] border border-[#E2D8CA] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#005A1F] font-normal">
              Categorias Visitadas
            </h2>
            <span className="text-xs font-sans text-[#6B6B63]">
              Presença por território
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryCounts).length === 0 ? (
              <p className="text-xs font-sans text-[#6B6B63] col-span-full py-4 text-center">
                Ainda não há registros de exploração em nenhuma categoria.
              </p>
            ) : (
              Object.entries(categoryCounts).map(([catName, visitedCount]) => {
                const totalInCat = allCards.filter(
                  (c) => c.category === catName,
                ).length;
                return (
                  <div
                    key={catName}
                    className="p-3 rounded-xl bg-[#F1E9DB]/50 border border-[#E2D8CA] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <CategoryGlyph category={catName as any} size={20} />
                      <span className="font-serif text-sm text-[#262B22]">
                        {catName}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#6B6B63]">
                      {visitedCount} de {totalInCat}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recentes Exploradas */}
        {recentlyExploredCards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-[#005A1F] font-normal">
                Últimas Cartas em Contato
              </h2>
              <button
                onClick={onNavigateExplore}
                className="text-xs font-sans text-[#96551F] hover:underline"
              >
                Explorar acervo completo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {recentlyExploredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onOpenCard(card)}
                  className="p-4 rounded-xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors cursor-pointer flex flex-col justify-between h-32"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#96551F]">
                    <span>{card.code}</span>
                    <span>{card.category}</span>
                  </div>
                  <h4 className="font-serif text-sm font-medium text-[#262B22] line-clamp-2">
                    {card.title}
                  </h4>
                  <span className="text-[11px] font-sans text-[#6B6B63]">
                    Toque para reler
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
