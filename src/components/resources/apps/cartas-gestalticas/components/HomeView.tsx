import React from "react";
import { Compass, Clock, Shuffle, Bookmark, ArrowRight } from "lucide-react";
import { ViewMode, GestaltCard } from "../types";
import { CategoryGlyph } from "./CategoryGlyph";

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onOpenCard: (card: GestaltCard) => void;
  cards: GestaltCard[];
  savedCount: number;
  reviewCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenCard,
  cards,
  savedCount,
  reviewCount,
}) => {
  // Select 3 or 4 representative cards for the subtle overlapping deck on the right
  const sampleCards = [
    cards.find((c) => c.id === "c-awareness") || cards[0],
    cards.find((c) => c.id === "c-figura-fundo") || cards[1],
    cards.find((c) => c.id === "a-laura-perls") || cards[3],
    cards.find((c) => c.id === "p-permanecer") || cards[6],
  ].filter(Boolean) as GestaltCard[];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Main Two-Zone Composition on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Zone: Editorial Text & 4 Navigation Blocks (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            {/* Editorial Title & Subtitle */}
            <div className="space-y-3">
              <span className="text-xs font-sans font-semibold tracking-[0.18em] text-[#96551F] uppercase block">
                Biblioteca Viva de Conceitos
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] text-[#005A1F] font-normal leading-tight tracking-tight">
                Cartas Gestálticas
              </h1>
              <p className="font-sans text-base sm:text-lg text-[#262B22] leading-relaxed max-w-xl">
                Conceitos, autores, perguntas e provocações para explorar a
                Gestalt-terapia em diferentes caminhos.
              </p>
            </div>

            {/* 4 Main Entry Navigation Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* 1. Explorar */}
              <button
                onClick={() => onNavigate("explore")}
                className="text-left p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex flex-col justify-between h-[120px]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#F1E9DB] group-hover:bg-[#FDFAF4] flex items-center justify-center text-[#005A1F] transition-colors">
                    <Compass className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6B6B63] group-hover:text-[#005A1F] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                    Explorar
                  </h3>
                  <p className="text-xs font-sans text-[#6B6B63] line-clamp-1 mt-0.5">
                    Percorrer as cartas organizadas por tema e categoria.
                  </p>
                </div>
              </button>

              {/* 2. Revisar */}
              <button
                onClick={() => onNavigate("review")}
                className="text-left p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex flex-col justify-between h-[120px]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#F1E9DB] group-hover:bg-[#FDFAF4] flex items-center justify-center text-[#96551F] transition-colors">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                  </div>
                  {reviewCount > 0 ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E2D8CA] text-[#262B22]">
                      {reviewCount} para rever
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#6B6B63] group-hover:text-[#005A1F] group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                    Revisar
                  </h3>
                  <p className="text-xs font-sans text-[#6B6B63] line-clamp-1 mt-0.5">
                    Reencontrar conteúdos que o usuário marcou para rever.
                  </p>
                </div>
              </button>

              {/* 3. Aleatório */}
              <button
                onClick={() => onNavigate("random")}
                className="text-left p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex flex-col justify-between h-[120px]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#F1E9DB] group-hover:bg-[#FDFAF4] flex items-center justify-center text-[#005A1F] transition-colors">
                    <Shuffle className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6B6B63] group-hover:text-[#005A1F] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                    Aleatório
                  </h3>
                  <p className="text-xs font-sans text-[#6B6B63] line-clamp-1 mt-0.5">
                    Receber uma carta sem escolher previamente o tema.
                  </p>
                </div>
              </button>

              {/* 4. Favoritos */}
              <button
                onClick={() => onNavigate("favorites")}
                className="text-left p-4 rounded-2xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] transition-colors group flex flex-col justify-between h-[120px]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#F1E9DB] group-hover:bg-[#FDFAF4] flex items-center justify-center text-[#96551F] transition-colors">
                    <Bookmark className="w-4 h-4" strokeWidth={2} />
                  </div>
                  {savedCount > 0 ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E2D8CA] text-[#262B22]">
                      {savedCount} guardadas
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#6B6B63] group-hover:text-[#005A1F] group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-[#262B22] group-hover:text-[#005A1F] transition-colors">
                    Favoritos
                  </h3>
                  <p className="text-xs font-sans text-[#6B6B63] line-clamp-1 mt-0.5">
                    Abrir a coleção pessoal de cartas guardadas.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Right Zone: Subtle overlapping composition of 3-4 cards (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center py-6">
            <div className="relative w-[300px] sm:w-[340px] h-[440px]">
              {/* Back Card 3 */}
              {sampleCards[2] && (
                <div
                  className="absolute inset-0 bg-[#F1E9DB] border border-[#E2D8CA] rounded-[24px] p-6 transform translate-x-6 -translate-y-4 opacity-70 pointer-events-none select-none"
                  style={{
                    backgroundColor: "#F1E9DB",
                  }}
                >
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold tracking-widest text-[#96551F] uppercase">
                    <span>{sampleCards[2].type}</span>
                    <span>{sampleCards[2].code}</span>
                  </div>
                  <div className="mt-20 text-center font-serif text-lg text-[#262B22]/70">
                    {sampleCards[2].title}
                  </div>
                </div>
              )}

              {/* Back Card 2 */}
              {sampleCards[1] && (
                <div
                  className="absolute inset-0 bg-[#FDFAF4] border border-[#E2D8CA] rounded-[24px] p-6 transform translate-x-3 -translate-y-2 opacity-85 pointer-events-none select-none"
                  style={{
                    backgroundColor: "#FDFAF4",
                  }}
                >
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold tracking-widest text-[#96551F] uppercase">
                    <span>{sampleCards[1].type}</span>
                    <span>{sampleCards[1].code}</span>
                  </div>
                  <div className="mt-24 text-center font-serif text-xl text-[#005A1F]">
                    {sampleCards[1].title}
                  </div>
                </div>
              )}

              {/* Front Main Preview Card */}
              {sampleCards[0] && (
                <div
                  onClick={() => onOpenCard(sampleCards[0])}
                  className="absolute inset-0 bg-[#FDFAF4] border border-[#E2D8CA] rounded-[24px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer hover:border-[#005A1F]/40 transition-colors select-none"
                  style={{
                    backgroundColor: "#FDFAF4",
                  }}
                >
                  {/* Subtle Confluência Watercolor Touch */}
                  <div
                    className="absolute top-0 right-0 w-28 h-28 pointer-events-none opacity-40 rounded-tr-[24px]"
                    style={{
                      background:
                        "radial-gradient(circle at 100% 0%, #FED701 0%, #01C94D 45%, #FE538B 85%, transparent 100%)",
                      filter: "blur(20px)",
                    }}
                  />

                  {/* Top: Type Label + Code */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-sans font-bold tracking-[0.16em] text-[#96551F] uppercase">
                        {sampleCards[0].type}
                      </span>
                      <span className="text-[11px] font-mono text-[#6B6B63]">
                        {sampleCards[0].code}
                      </span>
                    </div>

                    <CategoryGlyph
                      category={sampleCards[0].category}
                      size={22}
                    />
                  </div>

                  {/* Center: Title in Fraunces */}
                  <div className="relative z-10 text-center my-auto py-4">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-normal tracking-wide uppercase">
                      {sampleCards[0].title}
                    </h2>
                    <p className="mt-2 text-xs font-sans text-[#6B6B63] max-w-[200px] mx-auto line-clamp-2">
                      {sampleCards[0].body}
                    </p>
                  </div>

                  {/* Bottom: Discreet prompt */}
                  <div className="relative z-10 pt-3 border-t border-[#E2D8CA]/70 flex items-center justify-between text-xs font-sans text-[#6B6B63]">
                    <span>Toque para explorar</span>
                    <span className="text-[10px] font-mono bg-[#F1E9DB] px-2 py-0.5 rounded-full text-[#262B22]">
                      Coleção viva
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
