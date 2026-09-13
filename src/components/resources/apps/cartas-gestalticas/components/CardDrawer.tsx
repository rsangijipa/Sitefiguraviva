import React from "react";
import {
  X,
  ArrowRight,
  BookOpen,
  Layers,
  Bookmark,
  Sparkles,
  Compass,
} from "lucide-react";
import { GestaltCard } from "../types";
import { CategoryGlyph } from "./CategoryGlyph";

interface CardDrawerProps {
  card: GestaltCard | null;
  isOpen: boolean;
  onClose: () => void;
  allCards: GestaltCard[];
  onSelectCard: (card: GestaltCard) => void;
  onToggleFavorite: (cardId: string) => void;
  isFavorite: boolean;
}

export const CardDrawer: React.FC<CardDrawerProps> = ({
  card,
  isOpen,
  onClose,
  allCards,
  onSelectCard,
  onToggleFavorite,
  isFavorite,
}) => {
  if (!isOpen || !card) return null;

  // Find related cards by IDs
  const relatedCards = card.relatedCardIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is GestaltCard => !!c)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#262B22]/30 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aprofundamento de ${card.title}`}
        className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#FDFAF4] border-l border-[#E2D8CA] h-full flex flex-col shadow-none overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2D8CA] flex items-center justify-between bg-[#FDFAF4]">
          <div className="flex items-center gap-3">
            <CategoryGlyph category={card.category} size={24} />
            <div>
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#96551F] uppercase block">
                {card.type} · {card.code}
              </span>
              <h2 className="font-serif text-xl font-normal text-[#005A1F] tracking-tight">
                {card.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(card.id)}
              className={`p-2 rounded-lg transition-colors ${
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

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] transition-colors focus:outline-none"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto custom-card-scroll p-5 sm:p-6 space-y-6">
          {/* Definição Síntese */}
          <section className="space-y-2">
            <h3 className="text-xs font-sans font-semibold tracking-wider text-[#6B6B63] uppercase">
              Definição Clínica e Epistemológica
            </h3>
            <p className="font-sans text-base leading-relaxed text-[#262B22]">
              {card.body}
            </p>
          </section>

          {/* Explicação Expandida */}
          {card.expandedNotes && (
            <section className="space-y-2 bg-[#F1E9DB]/60 p-4 rounded-xl border border-[#E2D8CA]/70">
              <h3 className="text-xs font-sans font-semibold tracking-wider text-[#005A1F] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#96551F]" />
                Comentário de Aprofundamento
              </h3>
              <p className="font-sans text-sm leading-relaxed text-[#262B22]">
                {card.expandedNotes}
              </p>
            </section>
          )}

          {/* Para ficar com isso */}
          {card.reflection && (
            <section className="space-y-2 bg-[#F1E9DB] p-4 rounded-xl border border-[#E2D8CA]">
              <span className="text-[11px] font-sans font-semibold tracking-wider text-[#96551F] uppercase block">
                Para ficar com isso
              </span>
              <p className="font-serif text-base italic text-[#262B22] leading-snug">
                “{card.reflection}”
              </p>
            </section>
          )}

          {/* Referências Bibliográficas */}
          <section className="space-y-2 pt-2 border-t border-[#E2D8CA]/60">
            <h3 className="text-xs font-sans font-semibold tracking-wider text-[#6B6B63] uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#96551F]" />
              Fontes & Citações
            </h3>
            <div className="space-y-1.5 text-xs font-sans text-[#262B22]">
              {card.author && (
                <p>
                  <strong className="text-[#6B6B63] font-medium">
                    Autoria:
                  </strong>{" "}
                  {card.author}
                </p>
              )}
              {card.work && (
                <p>
                  <strong className="text-[#6B6B63] font-medium">Obra:</strong>{" "}
                  <em>{card.work}</em> ({card.year || "s/d"})
                </p>
              )}
              {card.reference && (
                <p className="text-[#6B6B63] font-mono text-[11px]">
                  {card.reference}
                </p>
              )}
              {card.portalReference && (
                <p className="pt-1 text-[#005A1F] font-medium">
                  {card.portalReference}
                </p>
              )}
            </div>
          </section>

          {/* Hipertexto Gestaltista: Continue explorando (Relacionada a) */}
          {relatedCards.length > 0 && (
            <section className="space-y-3 pt-2 border-t border-[#E2D8CA]/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-semibold tracking-wider text-[#6B6B63] uppercase">
                  Continue explorando · Relacionada a
                </h3>
                <span className="text-[11px] font-sans text-[#6B6B63]">
                  Rede de conceitos
                </span>
              </div>

              <div className="space-y-2">
                {relatedCards.map((relCard) => (
                  <button
                    key={relCard.id}
                    onClick={() => {
                      onSelectCard(relCard);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-sans tracking-wider text-[#96551F] uppercase block">
                        {relCard.type} · {relCard.code}
                      </span>
                      <h4 className="font-serif text-sm font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                        {relCard.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6B6B63] group-hover:text-[#005A1F] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="pt-2 border-t border-[#E2D8CA]/60 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[11px] font-sans bg-[#F1E9DB] text-[#6B6B63]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
