import React from "react";
import { Clock, Play, BookOpen, RotateCcw } from "lucide-react";
import { GestaltCard } from "../types";

interface ReviewViewProps {
  cardsToReview: GestaltCard[];
  onStartReview: () => void;
  onExploreCards: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  cardsToReview,
  onStartReview,
  onExploreCards,
}) => {
  const count = cardsToReview.length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full text-center space-y-8 p-8 sm:p-10 rounded-3xl bg-[#FDFAF4] border border-[#E2D8CA]">
        {/* Top Tag & Icon */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] flex items-center justify-center text-[#96551F]">
            <Clock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#96551F] uppercase block">
            Revisão Contemplativa
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-normal tracking-tight">
            Para rever
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#262B22] leading-relaxed">
            “Cartas que você escolheu reencontrar.”
          </p>
        </div>

        {/* Count & Actions */}
        {count > 0 ? (
          <div className="space-y-6 pt-2">
            <div className="p-4 rounded-2xl bg-[#F1E9DB]/70 border border-[#E2D8CA] inline-block w-full">
              <span className="font-serif text-3xl text-[#262B22] block font-normal">
                {count} {count === 1 ? "carta" : "cartas"}
              </span>
              <span className="text-xs font-sans text-[#6B6B63]">
                prontas para reencontro e ressonância
              </span>
            </div>

            <button
              onClick={onStartReview}
              className="w-full py-3.5 px-6 rounded-xl bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Começar revisão</span>
            </button>
          </div>
        ) : (
          /* Empty state according to spec: "Nenhuma carta está marcada para revisão." */
          <div className="space-y-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#F1E9DB]/50 border border-dashed border-[#E2D8CA]">
              <p className="font-serif text-base text-[#262B22]">
                Nenhuma carta está marcada para revisão.
              </p>
              <p className="mt-1 text-xs font-sans text-[#6B6B63] leading-relaxed">
                Ao explorar as cartas, você pode escolher “Quero rever” no verso
                para guardá-las aqui.
              </p>
            </div>

            <button
              onClick={onExploreCards}
              className="w-full py-3 px-6 rounded-xl bg-[#F1E9DB] hover:bg-[#E2D8CA] text-[#005A1F] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar o acervo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
