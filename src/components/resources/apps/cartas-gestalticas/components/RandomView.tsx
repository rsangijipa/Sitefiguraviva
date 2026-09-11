import React, { useState } from "react";
import { Sparkles, Shuffle, ArrowRight, Compass } from "lucide-react";
import { GestaltCard, CardCategory } from "../types";
import { GestaltCardView } from "./GestaltCardView";
import { CardDrawer } from "./CardDrawer";

interface RandomViewProps {
  cards: GestaltCard[];
  onExploreTheme: () => void;
  savedCardIds: string[];
  onToggleFavorite: (cardId: string) => void;
  onRecordExploration: (cardId: string) => void;
}

export const RandomView: React.FC<RandomViewProps> = ({
  cards,
  onExploreTheme,
  savedCardIds,
  onToggleFavorite,
  onRecordExploration,
}) => {
  const [selectedCard, setSelectedCard] = useState<GestaltCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deepenCard, setDeepenCard] = useState<GestaltCard | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories: CardCategory[] = [
    "Conceitos",
    "Autores",
    "Perguntas",
    "Clínica",
    "Campo",
    "Fenomenologia",
  ];

  const pool =
    selectedCategory === "ALL"
      ? cards
      : cards.filter((c) => c.category === selectedCategory);

  const drawRandomCard = () => {
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const card = pool[randomIndex];
    setSelectedCard(card);
    setIsFlipped(false);
    onRecordExploration(card.id);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Bar */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between text-xs font-sans text-[#6B6B63]">
        <span className="font-mono uppercase tracking-wider text-[#96551F]">
          Descoberta Aleatória
        </span>

        {/* Category Filter Selector for Theme */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedCard(null);
          }}
          className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg px-2.5 py-1 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
          title="Escolher outro tema"
        >
          <option value="ALL">Qualquer tema</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Center Zone */}
      <div className="flex-1 flex items-center justify-center py-6">
        {!selectedCard ? (
          /* Pre-draw Contemplative State */
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#FDFAF4] border border-[#E2D8CA]">
            <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] flex items-center justify-center text-[#005A1F] mx-auto">
              <Shuffle className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-normal tracking-tight">
                Uma carta por vez.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#6B6B63] leading-relaxed max-w-xs mx-auto">
                Permita que um conceito ou provocação se apresente sem
                planejamento prévio.
              </p>
            </div>

            <button
              onClick={drawRandomCard}
              className="px-6 py-3 bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>Sortear uma carta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Drawn Card View */
          <div className="flex flex-col items-center">
            <GestaltCardView
              card={selectedCard}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((prev) => !prev)}
              onToggleFavorite={onToggleFavorite}
              isFavorite={savedCardIds.includes(selectedCard.id)}
              onDeepen={(c) => setDeepenCard(c)}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls after drawing */}
      {selectedCard && (
        <div className="max-w-md mx-auto w-full flex items-center justify-between gap-3 pb-4">
          <button
            onClick={onExploreTheme}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2D8CA] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Escolher outro tema</span>
          </button>

          <button
            onClick={drawRandomCard}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Outra carta</span>
          </button>
        </div>
      )}

      {/* Deepen Drawer */}
      <CardDrawer
        card={deepenCard}
        isOpen={!!deepenCard}
        onClose={() => setDeepenCard(null)}
        allCards={cards}
        onSelectCard={(c) => {
          setSelectedCard(c);
          setIsFlipped(false);
        }}
        onToggleFavorite={onToggleFavorite}
        isFavorite={deepenCard ? savedCardIds.includes(deepenCard.id) : false}
      />
    </div>
  );
};
