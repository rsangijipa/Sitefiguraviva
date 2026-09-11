import React, { useState, useEffect } from "react";
import { INITIAL_CARDS } from "./data/cards";
import { GestaltCard, ViewMode, StudyStats, StudyHistoryEntry } from "./types";
import { HomeView } from "./components/HomeView";
import { ExploreView } from "./components/ExploreView";
import { SessionView } from "./components/SessionView";
import { ReviewView } from "./components/ReviewView";
import { RandomView } from "./components/RandomView";
import { FavoritesView } from "./components/FavoritesView";
import { HistoryView } from "./components/HistoryView";
import { AdminView } from "./components/AdminView";
import { useAuth } from "@/context/AuthContext";
import { useResourceWindowScrollReset } from "../../ResourceWindow";

interface AppProps {
  activeSection: ViewMode;
  onSectionChange: (view: ViewMode) => void;
}

export default function App({
  activeSection: viewMode,
  onSectionChange: setViewMode,
}: AppProps) {
  const { isAdmin, loading: isAuthLoading } = useAuth();
  const canAdmin = isAdmin && !isAuthLoading;
  const resetWindowScroll = useResourceWindowScrollReset();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const announce = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(
      () =>
        setStatusMessage((current) => (current === message ? null : current)),
      2600,
    );
  };

  const handleClearLocalStudy = () => {
    if (
      !window.confirm(
        "Apagar favoritos, revisões e histórico de estudo deste navegador? A coleção de cartas permanece.",
      )
    ) {
      return;
    }
    try {
      [
        "gestalt_cards_favorites_v1",
        "gestalt_cards_review_v1",
        "gestalt_cards_explored_v1",
        "gestalt_cards_stats_v1",
      ].forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Falha ao apagar dados locais:", error);
    }
    setSavedCardIds([]);
    setReviewCardIds([]);
    setExploredCardIds([]);
    setStats({
      exploredCardsCount: 0,
      favoriteCardIds: [],
      reviewCardIds: [],
      knownCardIds: [],
      totalMinutesExplored: 0,
      history: [],
    });
    announce("Seu estudo local foi apagado.");
  };
  // Load saved state or default
  const [cards, setCards] = useState<GestaltCard[]>(() => {
    try {
      const saved = localStorage.getItem("gestalt_cards_collection_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CARDS;
  });

  const [savedCardIds, setSavedCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("gestalt_cards_favorites_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [reviewCardIds, setReviewCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("gestalt_cards_review_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [exploredCardIds, setExploredCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("gestalt_cards_explored_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    try {
      const saved = localStorage.getItem("gestalt_cards_stats_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      exploredCardsCount: 0,
      favoriteCardIds: [],
      reviewCardIds: [],
      knownCardIds: [],
      totalMinutesExplored: 0,
      history: [],
    };
  });

  const [previousView, setPreviousView] = useState<ViewMode>("home");

  useEffect(() => {
    if (!canAdmin && viewMode === "admin") {
      setViewMode("home");
    }
  }, [canAdmin, viewMode]);

  // Active Session deck & index
  const [sessionDeck, setSessionDeck] = useState<GestaltCard[]>(INITIAL_CARDS);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionType, setSessionType] = useState<
    "session" | "review" | "random" | "favorites"
  >("session");

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(
        "gestalt_cards_collection_v1",
        JSON.stringify(cards),
      );
    } catch {
      // ignored
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "gestalt_cards_favorites_v1",
        JSON.stringify(savedCardIds),
      );
    } catch {
      // ignored
    }
  }, [savedCardIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "gestalt_cards_review_v1",
        JSON.stringify(reviewCardIds),
      );
    } catch {
      // ignored
    }
  }, [reviewCardIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "gestalt_cards_explored_v1",
        JSON.stringify(exploredCardIds),
      );
    } catch {
      // ignored
    }
  }, [exploredCardIds]);

  useEffect(() => {
    try {
      localStorage.setItem("gestalt_cards_stats_v1", JSON.stringify(stats));
    } catch {
      // ignored
    }
  }, [stats]);

  // Navigate with history tracking
  const navigateTo = (newView: ViewMode) => {
    if (newView === "admin" && !canAdmin) return;
    setPreviousView(viewMode);
    setViewMode(newView);
    resetWindowScroll();
  };

  // Open a specific card in focused session
  const handleOpenCard = (card: GestaltCard) => {
    const idx = cards.findIndex((c) => c.id === card.id);
    setSessionDeck(cards);
    setSessionIndex(idx !== -1 ? idx : 0);
    setSessionType("session");
    navigateTo("session");
  };

  // Start Review Session
  const handleStartReview = () => {
    const reviewDeck = cards.filter((c) => reviewCardIds.includes(c.id));
    if (reviewDeck.length === 0) return;
    setSessionDeck(reviewDeck);
    setSessionIndex(0);
    setSessionType("review");
    navigateTo("session");
  };

  // Toggle favorite
  const handleToggleFavorite = (cardId: string) => {
    const willAdd = !savedCardIds.includes(cardId);
    announce(
      willAdd
        ? "Carta adicionada aos favoritos."
        : "Carta removida dos favoritos.",
    );
    setSavedCardIds((prev) => {
      const exists = prev.includes(cardId);
      const next = exists
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId];
      setStats((s) => ({
        ...s,
        favoriteCardIds: next,
      }));
      return next;
    });
  };

  // Batch remove favorites
  const handleBatchRemoveFavorites = (cardIdsToRemove: string[]) => {
    announce("Favoritos removidos.");
    setSavedCardIds((prev) => {
      const next = prev.filter((id) => !cardIdsToRemove.includes(id));
      setStats((s) => ({
        ...s,
        favoriteCardIds: next,
      }));
      return next;
    });
  };

  // Mark for review
  const handleMarkReview = (cardId: string, shouldReview: boolean) => {
    announce(
      shouldReview
        ? "Carta marcada para revisão."
        : "Carta removida da revisão.",
    );
    setReviewCardIds((prev) => {
      const next = shouldReview
        ? Array.from(new Set([...prev, cardId]))
        : prev.filter((id) => id !== cardId);
      setStats((s) => ({
        ...s,
        reviewCardIds: next,
      }));
      return next;
    });
  };

  // Mark as known
  const handleMarkKnown = (cardId: string) => {
    announce("Carta marcada como conhecida.");
    setReviewCardIds((prev) => prev.filter((id) => id !== cardId));
    setStats((s) => ({
      ...s,
      knownCardIds: Array.from(new Set([...s.knownCardIds, cardId])),
    }));
  };

  // Record exploration
  const handleRecordExploration = (cardId: string) => {
    setExploredCardIds((prev) => {
      if (prev.includes(cardId)) return prev;
      const next = [...prev, cardId];
      setStats((s) => ({
        ...s,
        exploredCardsCount: next.length,
        totalMinutesExplored: s.totalMinutesExplored + 1,
        history: [
          ...s.history,
          {
            cardId,
            viewedAt: new Date().toISOString().split("T")[0],
            status: "explored",
          },
        ],
      }));
      return next;
    });
  };

  // Admin Card Save
  const handleSaveCard = (updatedCard: GestaltCard) => {
    if (!canAdmin) return;
    announce("Carta salva na coleção local.");
    setCards((prev) => {
      const index = prev.findIndex((c) => c.id === updatedCard.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = updatedCard;
        return next;
      }
      return [updatedCard, ...prev];
    });
  };

  // Admin Card Delete
  const handleDeleteCard = (cardId: string) => {
    if (!canAdmin) return;
    announce("Carta removida da coleção.");
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setSavedCardIds((prev) => prev.filter((id) => id !== cardId));
    setReviewCardIds((prev) => prev.filter((id) => id !== cardId));
  };

  // Admin Batch Import
  const handleBatchImport = (importedCards: GestaltCard[]) => {
    if (!canAdmin) return;
    announce(`${importedCards.length} cartas importadas para a coleção local.`);
    setCards((prev) => [...importedCards, ...prev]);
  };

  const cardsToReview = cards.filter((c) => reviewCardIds.includes(c.id));

  return (
    <div className="relative min-h-full bg-[#FDFAF4] text-[#262B22] flex flex-col font-sans selection:bg-[#F1E9DB] selection:text-[#005A1F]">
      {/* Main View Router */}
      <main className="flex-1">
        {viewMode === "home" && (
          <HomeView
            cards={cards}
            onNavigate={navigateTo}
            onOpenCard={handleOpenCard}
            savedCount={savedCardIds.length}
            reviewCount={reviewCardIds.length}
          />
        )}

        {viewMode === "explore" && (
          <ExploreView
            cards={cards}
            onOpenCard={handleOpenCard}
            savedCardIds={savedCardIds}
            reviewCardIds={reviewCardIds}
            exploredCardIds={exploredCardIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {viewMode === "session" && (
          <SessionView
            cards={sessionDeck}
            initialIndex={sessionIndex}
            mode={sessionType}
            onExit={() =>
              navigateTo(previousView === "session" ? "explore" : previousView)
            }
            onNavigate={navigateTo}
            savedCardIds={savedCardIds}
            onToggleFavorite={handleToggleFavorite}
            reviewCardIds={reviewCardIds}
            onMarkReview={handleMarkReview}
            onMarkKnown={handleMarkKnown}
            onRecordExploration={handleRecordExploration}
          />
        )}

        {viewMode === "review" && (
          <ReviewView
            cardsToReview={cardsToReview}
            onStartReview={handleStartReview}
            onExploreCards={() => navigateTo("explore")}
          />
        )}

        {viewMode === "random" && (
          <RandomView
            cards={cards}
            onExploreTheme={() => navigateTo("explore")}
            savedCardIds={savedCardIds}
            onToggleFavorite={handleToggleFavorite}
            onRecordExploration={handleRecordExploration}
          />
        )}

        {viewMode === "favorites" && (
          <FavoritesView
            cards={cards}
            savedCardIds={savedCardIds}
            onOpenCard={handleOpenCard}
            onRemoveFavorite={handleToggleFavorite}
            onBatchRemoveFavorites={handleBatchRemoveFavorites}
            onExplore={() => navigateTo("explore")}
          />
        )}

        {viewMode === "history" && (
          <HistoryView
            stats={stats}
            allCards={cards}
            onOpenCard={handleOpenCard}
            onNavigateExplore={() => navigateTo("explore")}
            onNavigateReview={() => navigateTo("review")}
            onNavigateFavorites={() => navigateTo("favorites")}
          />
        )}

        {viewMode === "admin" && canAdmin && (
          <AdminView
            cards={cards}
            onSaveCard={handleSaveCard}
            onDeleteCard={handleDeleteCard}
            onBatchImport={handleBatchImport}
            onCloseAdmin={() => navigateTo("home")}
          />
        )}
      </main>

      <footer className="border-t border-[#E2D8CA]/70 px-4 py-4 text-center">
        <p className="text-[11px] leading-relaxed text-[#6B6B63]">
          Favoritos, revisões e histórico de estudo ficam somente neste
          navegador.
        </p>
        <button
          type="button"
          onClick={handleClearLocalStudy}
          className="mt-2 text-[11px] font-semibold text-[#005A1F] underline underline-offset-2 hover:text-[#262B22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005A1F]/40"
        >
          Limpar meu estudo local
        </button>
      </footer>

      {statusMessage ? (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[#005A1F]/25 bg-[#FDFAF4] px-4 py-2 text-xs font-medium text-[#005A1F] shadow-lg"
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
