import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  LogOut,
  Compass,
} from "lucide-react";
import { GestaltCard, ViewMode } from "../types";
import { GestaltCardView } from "./GestaltCardView";
import { CardDrawer } from "./CardDrawer";

interface SessionViewProps {
  cards: GestaltCard[];
  initialIndex?: number;
  mode: "session" | "review" | "random" | "favorites";
  onExit: () => void;
  onNavigate: (view: ViewMode) => void;
  savedCardIds: string[];
  onToggleFavorite: (cardId: string) => void;
  reviewCardIds: string[];
  onMarkReview: (cardId: string, shouldReview: boolean) => void;
  onMarkKnown: (cardId: string) => void;
  onRecordExploration: (cardId: string) => void;
}

export const SessionView: React.FC<SessionViewProps> = ({
  cards,
  initialIndex = 0,
  mode,
  onExit,
  onNavigate,
  savedCardIds,
  onToggleFavorite,
  reviewCardIds,
  onMarkReview,
  onMarkKnown,
  onRecordExploration,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deepenCard, setDeepenCard] = useState<GestaltCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);

  // Session metrics tracking
  const [sessionStartTime] = useState<number>(Date.now());
  const [cardsSeenIds, setCardsSeenIds] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex] || cards[0];

  // Record exploration of current card
  useEffect(() => {
    if (currentCard) {
      setCardsSeenIds((prev) => new Set(prev).add(currentCard.id));
      onRecordExploration(currentCard.id);
      setIsFlipped(false);
    }
  }, [currentIndex, currentCard?.id]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!currentCard) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="font-serif text-lg text-[#262B22]">
            Nenhuma carta disponível para este modo.
          </p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-[#005A1F] text-[#FDFAF4] rounded-lg text-xs font-sans"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = savedCardIds.includes(currentCard.id);
  const isMarkedForReview = reviewCardIds.includes(currentCard.id);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummaryScreen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFavoriteToggle = (id: string) => {
    const willBeFav = !savedCardIds.includes(id);
    onToggleFavorite(id);
    if (willBeFav) {
      setToastMessage("Carta adicionada aos favoritos.");
    } else {
      setToastMessage("Carta removida dos favoritos.");
    }
  };

  const handleReviewToggle = () => {
    const nextState = !isMarkedForReview;
    onMarkReview(currentCard.id, nextState);
    if (nextState) {
      setToastMessage("Guardada para rever.");
    }
  };

  const handleKnown = () => {
    onMarkKnown(currentCard.id);
    setToastMessage("Registrada como conhecida.");
    handleNext();
  };

  // Top Indicator text
  const getIndicatorText = () => {
    if (mode === "random") return "Descoberta aleatória";
    if (mode === "favorites")
      return `${currentIndex + 1} de ${cards.length} favoritos`;
    if (mode === "review")
      return `${currentIndex + 1} de ${cards.length} para rever`;
    return `Carta ${currentIndex + 1} · ${cards.length} disponíveis`;
  };

  // Duration in minutes
  const elapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - sessionStartTime) / 60000),
  );

  // ================= SUMMARY SCREEN (Final Editorial Screen) =================
  if (showSummaryScreen) {
    const savedInSession = Array.from(cardsSeenIds).filter((id) =>
      savedCardIds.includes(id),
    ).length;
    const reviewInSession = Array.from(cardsSeenIds).filter((id) =>
      reviewCardIds.includes(id),
    ).length;

    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl bg-[#FDFAF4] border border-[#E2D8CA]">
          <div className="space-y-3">
            <span className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase block">
              Fim da Exploração
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-normal tracking-tight">
              Você passou por {cardsSeenIds.size}{" "}
              {cardsSeenIds.size === 1 ? "carta" : "cartas"}.
            </h2>
            <p className="font-sans text-sm text-[#262B22] leading-relaxed italic max-w-sm mx-auto">
              “Algumas talvez tenham ficado mais claras. Outras podem ter aberto
              novas perguntas.”
            </p>
          </div>

          {/* Stats without gamification */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#E2D8CA]/80">
            <div className="flex flex-col items-center p-2">
              <span className="font-serif text-2xl text-[#262B22]">
                {savedInSession}
              </span>
              <span className="text-[11px] font-sans text-[#6B6B63]">
                guardadas
              </span>
            </div>
            <div className="flex flex-col items-center p-2 border-x border-[#E2D8CA]/60">
              <span className="font-serif text-2xl text-[#96551F]">
                {reviewInSession}
              </span>
              <span className="text-[11px] font-sans text-[#6B6B63]">
                para rever
              </span>
            </div>
            <div className="flex flex-col items-center p-2">
              <span className="font-serif text-2xl text-[#005A1F]">
                {elapsedMinutes}
              </span>
              <span className="text-[11px] font-sans text-[#6B6B63]">
                min de foco
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => {
                setShowSummaryScreen(false);
                setCurrentIndex(0);
              }}
              className="w-full py-3 bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium rounded-xl transition-colors"
            >
              Continuar explorando
            </button>
            <button
              onClick={() => onNavigate("favorites")}
              className="w-full py-3 bg-[#F1E9DB] hover:bg-[#E2D8CA] text-[#262B22] text-xs font-sans font-medium rounded-xl transition-colors"
            >
              Ver cartas guardadas
            </button>
            <button
              onClick={onExit}
              className="w-full py-2.5 text-[#6B6B63] hover:text-[#262B22] text-xs font-sans transition-colors"
            >
              Voltar aos recursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] flex flex-col justify-between py-4 px-4 sm:px-6 relative">
      {/* Toast Notification (Discreet confirmation, no confetti) */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#262B22] text-[#FDFAF4] px-4 py-2 rounded-full text-xs font-sans shadow-none flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#01C94D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Session Bar: Exit action + Discrete Collection Indicator + Favorite Action */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between py-2 text-xs font-sans">
        <button
          onClick={() => setShowExitModal(true)}
          className="text-[#6B6B63] hover:text-[#262B22] flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F1E9DB] transition-colors"
          title="Encerrar exploração"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Encerrar</span>
        </button>

        <span className="font-mono text-[11px] sm:text-xs text-[#6B6B63] tracking-wide">
          {getIndicatorText()}
        </span>

        <button
          onClick={() => handleFavoriteToggle(currentCard.id)}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-colors ${
            isFavorite
              ? "bg-[#F1E9DB] text-[#96551F] border-[#E2D8CA]"
              : "bg-[#FDFAF4] text-[#6B6B63] hover:text-[#262B22] border-transparent hover:border-[#E2D8CA]"
          }`}
        >
          <Bookmark
            className="w-3.5 h-3.5"
            strokeWidth={2}
            fill={isFavorite ? "currentColor" : "none"}
          />
          <span className="text-xs font-medium">
            {isFavorite ? "Guardada" : "Guardar"}
          </span>
        </button>
      </div>

      {/* Center Zone: The Card in Generous Negative Space ("Figura precisa de fundo") */}
      <div className="flex-1 flex items-center justify-center py-4">
        <GestaltCardView
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          onToggleFavorite={handleFavoriteToggle}
          isFavorite={isFavorite}
          onDeepen={(c) => setDeepenCard(c)}
        />
      </div>

      {/* Bottom Session Controls */}
      <div className="max-w-xl mx-auto w-full pb-4 sm:pb-6 space-y-3">
        {/* Mode Review Extra Actions: Já conheço / Quero rever / Guardar */}
        {mode === "review" && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-2">
            <button
              onClick={handleKnown}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] text-[#005A1F] transition-colors"
            >
              Já conheço
            </button>
            <button
              onClick={handleReviewToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium border transition-colors ${
                isMarkedForReview
                  ? "bg-[#F1E9DB] text-[#96551F] border-[#96551F]"
                  : "bg-[#FDFAF4] text-[#262B22] border-[#E2D8CA] hover:bg-[#F1E9DB]"
              }`}
            >
              {isMarkedForReview ? "Marcada para rever" : "Quero rever"}
            </button>
            <button
              onClick={() => handleFavoriteToggle(currentCard.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] text-[#262B22] transition-colors"
            >
              {isFavorite ? "Guardada" : "Guardar"}
            </button>
          </div>
        )}

        {/* Primary 3 Controls: Anterior, Virar carta (center with more weight), Próxima */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex-1 sm:flex-initial sm:min-w-[120px] py-2.5 px-4 rounded-xl border text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors ${
              currentIndex === 0
                ? "opacity-35 cursor-not-allowed border-[#E2D8CA] text-[#6B6B63]"
                : "bg-[#FDFAF4] hover:bg-[#F1E9DB] border-[#E2D8CA] text-[#262B22]"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          {/* Central Button with slightly more visual weight */}
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            className="flex-1 sm:flex-initial sm:min-w-[160px] py-2.5 px-5 rounded-xl bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#005A1F]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Virar carta</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 sm:flex-initial sm:min-w-[120px] py-2.5 px-4 rounded-xl border border-[#E2D8CA] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>
              {currentIndex === cards.length - 1 ? "Concluir" : "Próxima"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal ("Encerrar esta exploração?") */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#262B22]/30 backdrop-blur-[1px]"
            onClick={() => setShowExitModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#FDFAF4] border border-[#E2D8CA] rounded-2xl p-6 space-y-4 text-center">
            <h3 className="font-serif text-xl text-[#005A1F] font-normal">
              Encerrar esta exploração?
            </h3>
            <p className="font-sans text-xs text-[#6B6B63] leading-relaxed">
              Seu histórico até aqui já foi salvo.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-lg border border-[#E2D8CA] text-xs font-sans text-[#262B22] hover:bg-[#F1E9DB] transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setShowSummaryScreen(true);
                }}
                className="flex-1 py-2 rounded-lg bg-[#005A1F] text-[#FDFAF4] text-xs font-sans font-medium hover:bg-[#004317] transition-colors"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deepen Expanded Drawer */}
      <CardDrawer
        card={deepenCard}
        isOpen={!!deepenCard}
        onClose={() => setDeepenCard(null)}
        allCards={cards}
        onSelectCard={(c) => {
          const idx = cards.findIndex((item) => item.id === c.id);
          if (idx !== -1) {
            setCurrentIndex(idx);
          }
        }}
        onToggleFavorite={handleFavoriteToggle}
        isFavorite={deepenCard ? savedCardIds.includes(deepenCard.id) : false}
      />
    </div>
  );
};
