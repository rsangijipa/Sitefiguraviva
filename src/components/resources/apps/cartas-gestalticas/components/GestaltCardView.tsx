import React, { useState } from "react";
import {
  Bookmark,
  Sparkles,
  BookOpen,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { GestaltCard } from "../types";
import { CategoryGlyph } from "./CategoryGlyph";

interface GestaltCardViewProps {
  card: GestaltCard;
  isFlipped: boolean;
  onFlip: () => void;
  onToggleFavorite?: (cardId: string) => void;
  isFavorite?: boolean;
  onDeepen?: (card: GestaltCard) => void;
  className?: string;
  size?: "standard" | "preview" | "compact";
}

export const GestaltCardView: React.FC<GestaltCardViewProps> = ({
  card,
  isFlipped,
  onFlip,
  onToggleFavorite,
  isFavorite = false,
  onDeepen,
  className = "",
  size = "standard",
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard navigation for card flip
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
    }
  };

  // Touch drag gesture with subtle physical resistance
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    // Apply soft damping resistance: max 30px offset
    const damped = Math.sign(diff) * Math.min(Math.abs(diff) * 0.25, 30);
    setDragOffset(damped);
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  // Dimensions based on size
  const dimensionClasses =
    size === "preview"
      ? "w-[320px] h-[450px]"
      : size === "compact"
        ? "w-full h-[480px]"
        : "w-full max-w-[420px] h-[540px] sm:h-[570px]";

  // Title typography scale adaptation
  const isQuestion = card.type === "PERGUNTA" || card.title.length > 35;
  const isAuthor = card.type === "AUTOR";

  return (
    <div
      className={`relative select-none perspective-1000 ${dimensionClasses} ${className}`}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? "none" : "transform 200ms ease-out",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {isFlipped
          ? `Verso da carta ${card.title}`
          : `Frente da carta ${card.title}`}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Carta ${card.title}. ${isFlipped ? "Verso visível" : "Frente visível"}. Pressione Enter ou Espaço para virar.`}
        onKeyDown={handleKeyDown}
        onClick={onFlip}
        className={`w-full h-full relative preserve-3d transition-transform duration-500 ease-out cursor-pointer rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#005A1F] focus:ring-offset-4 focus:ring-offset-[#FDFAF4] ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* ================= FRENTE DA CARTA ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-[#FDFAF4] border border-[#E2D8CA] rounded-[24px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden"
          style={{
            backgroundColor: "#FDFAF4",
          }}
        >
          {/* Subtle Confluência Organic Tint Accent (Watercolor touch on edge/corner, never covering text) */}
          <div
            className="absolute top-0 right-0 w-36 h-36 pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(circle at 100% 0%, #FED701 0%, #01C94D 40%, #FE538B 75%, transparent 100%)",
              filter: "blur(28px)",
            }}
          />

          {/* Top: Type Label + Editorial Index */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase">
                {card.type}
              </span>
              <span className="text-[12px] font-mono tracking-wider text-[#6B6B63]">
                {card.code}
              </span>
            </div>

            <div className="text-[#262B22]/70">
              <CategoryGlyph category={card.category} size={26} />
            </div>
          </div>

          {/* Center: Main Figure in Fraunces */}
          <div className="relative z-10 my-auto flex flex-col items-center text-center px-2 py-4">
            {isQuestion ? (
              <h2 className="font-serif text-xl sm:text-2xl text-[#262B22] font-normal leading-relaxed italic max-w-sm">
                “{card.title}”
              </h2>
            ) : isAuthor ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-sans uppercase tracking-widest text-[#6B6B63] mb-2">
                  Figura Fundadora
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-normal tracking-tight">
                  {card.title}
                </h2>
                {card.year && (
                  <span className="mt-3 font-sans text-xs text-[#6B6B63]">
                    {card.year}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-[#005A1F] font-normal tracking-wide uppercase leading-tight">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="mt-3 font-sans text-sm text-[#6B6B63] max-w-xs">
                    {card.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom: Discreet instruction */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#E2D8CA]/60">
            <span className="text-xs font-sans text-[#6B6B63] flex items-center gap-1.5">
              <RotateCcw
                className="w-3.5 h-3.5 text-[#96551F]"
                strokeWidth={1.75}
              />
              Toque para virar
            </span>

            <span className="text-[11px] font-sans text-[#6B6B63]/80">
              {card.category}
            </span>
          </div>
        </div>

        {/* ================= VERSO DA CARTA ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#FDFAF4] border border-[#E2D8CA] rounded-[24px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden"
          style={{
            backgroundColor: "#FDFAF4",
          }}
        >
          {/* Top Header: Reduced Type and Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E2D8CA]/80">
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold tracking-[0.14em] text-[#96551F] uppercase">
                {card.type} · {card.code}
              </span>
              <h3 className="font-serif text-base font-medium text-[#005A1F] tracking-tight truncate max-w-[240px]">
                {card.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(card.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    isFavorite
                      ? "text-[#96551F] bg-[#F1E9DB]"
                      : "text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB]"
                  }`}
                  title={isFavorite ? "Remover dos favoritos" : "Guardar carta"}
                  aria-label={
                    isFavorite ? "Remover dos favoritos" : "Guardar carta"
                  }
                >
                  <Bookmark
                    className="w-4 h-4"
                    strokeWidth={2}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Center Body: Definition, Metadata and Reflection with Internal Scroll */}
          <div
            className="my-3 flex-1 overflow-y-auto custom-card-scroll pr-1 flex flex-col gap-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Definition / Commentary in Karla */}
            <p className="font-sans text-[14px] sm:text-[15px] leading-[1.65] text-[#262B22]">
              {card.body}
            </p>

            {/* Metadata Zone */}
            {(card.author || card.work || card.reference) && (
              <div className="pt-2 border-t border-[#E2D8CA]/60 flex flex-col gap-1 text-[12px] font-sans">
                {card.author && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#6B6B63] font-medium w-14 shrink-0">
                      Autor:
                    </span>
                    <span className="text-[#262B22]">{card.author}</span>
                  </div>
                )}
                {card.work && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#6B6B63] font-medium w-14 shrink-0">
                      Obra:
                    </span>
                    <span className="text-[#262B22] italic">{card.work}</span>
                  </div>
                )}
                {card.year && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#6B6B63] font-medium w-14 shrink-0">
                      Ano:
                    </span>
                    <span className="text-[#262B22] font-mono">
                      {card.year}
                    </span>
                  </div>
                )}
                {card.reference && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#6B6B63] font-medium w-14 shrink-0">
                      Referência:
                    </span>
                    <span className="text-[#6B6B63]">{card.reference}</span>
                  </div>
                )}
              </div>
            )}

            {/* Block Areia: Para ficar com isso */}
            {card.reflection && (
              <div className="bg-[#F1E9DB] p-3.5 rounded-xl border border-[#E2D8CA]/60">
                <span className="block text-[11px] font-sans font-semibold tracking-wider text-[#96551F] uppercase mb-1">
                  Para ficar com isso
                </span>
                <p className="font-serif text-[13px] sm:text-[14px] italic text-[#262B22] leading-snug">
                  {card.reflection}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions of the Back: Aprofundar + Virar de volta */}
          <div
            className="pt-3 border-t border-[#E2D8CA]/80 flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onFlip}
              className="text-xs font-sans text-[#6B6B63] hover:text-[#262B22] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Virar frente
            </button>

            {onDeepen && (
              <button
                type="button"
                onClick={() => onDeepen(card)}
                className="px-3 py-1.5 bg-[#F1E9DB] hover:bg-[#E2D8CA] text-[#005A1F] text-xs font-sans font-medium rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                <span>Aprofundar</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
