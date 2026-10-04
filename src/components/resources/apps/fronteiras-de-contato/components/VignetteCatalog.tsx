import React, { useState } from "react";
import {
  BookOpen,
  Compass,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Vignette } from "../types";

interface VignetteCatalogProps {
  vignettes: Vignette[];
  onSelectVignette: (vignetteId: string) => void;
  onOpenNewVignetteModal: () => void;
  showAdmin?: boolean;
}

export const VignetteCatalog: React.FC<VignetteCatalogProps> = ({
  vignettes,
  onSelectVignette,
  onOpenNewVignetteModal,
  showAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "Todas",
    "Trabalho & Profissional",
    "Relações Afetivas",
    "Família & Convivência",
    "Amizades & Grupos",
    "Autonomia & Limites",
  ];

  const filtered = vignettes.filter((v) => {
    const matchesCat =
      selectedCategory === "Todas" || v.category === selectedCategory;
    const query = searchTerm.toLowerCase();
    const matchesQuery =
      v.title.toLowerCase().includes(query) ||
      v.context.toLowerCase().includes(query) ||
      v.situation.toLowerCase().includes(query) ||
      v.reflectiveQuestion.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#554D40]">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-2xl text-[#26231F] font-normal tracking-tight">
              Catálogo de Vinhetas Relacionais
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#70675A] mt-1">
            Situações cotidianas de contato com 3 desdobramentos fenomênicos e
            perguntas de auto-observação.
          </p>
        </div>

        {showAdmin ? (
          <button
            onClick={onOpenNewVignetteModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3C362F] text-[#FAF8F5] text-xs font-medium hover:bg-[#2B2721] transition-colors shadow-xs self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Criar Nova Vinheta</span>
          </button>
        ) : null}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedCategory === cat
                  ? "bg-[#40382E] text-white font-medium shadow-xs"
                  : "bg-[#EDE7DC] text-[#696052] hover:bg-[#E2DACB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#948B7D]" />
          <input
            type="text"
            placeholder="Buscar por palavras-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#DDD5C7] focus:outline-none focus:border-[#7A6B59] text-[#292520] placeholder:text-[#A19788]"
          />
        </div>
      </div>

      {/* Grid of Vignettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((vignette) => (
          <article
            key={vignette.id}
            id={`vignette-card-${vignette.id}`}
            className="bg-white rounded-2xl border border-[#E1D9CC] p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-[#C7BDAD] transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#EFE9DE] text-[#554B3E] border border-[#DDD4C5]">
                  {vignette.category}
                </span>
                {vignette.isDefault === false && (
                  <span className="text-[10px] text-[#7A6B59] font-medium">
                    Personalizada
                  </span>
                )}
              </div>

              <h3 className="font-serif text-lg text-[#25221E] font-normal group-hover:text-[#7A6149] transition-colors">
                {vignette.title}
              </h3>

              <p className="text-xs text-[#5D5548] leading-relaxed line-clamp-2">
                {vignette.situation}
              </p>

              {/* Responses overview */}
              <div className="pt-2 border-t border-[#F0ECE4] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8A7F70] block">
                  Movimentos em jogo:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vignette.responses.map((r, i) => (
                    <span
                      key={r.id || i}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] text-[#635A4D] border border-[#E5DFD4]"
                    >
                      {r.relationalMovementLabel.split("/")[0].trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action */}
            <div className="mt-5 pt-3 border-t border-[#F0ECE4] flex items-center justify-between">
              <span className="text-xs text-[#7B7264] italic truncate max-w-[220px]">
                "{vignette.reflectiveQuestion}"
              </span>

              <button
                id={`btn-explore-${vignette.id}`}
                onClick={() => onSelectVignette(vignette.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#383127] hover:text-[#7A6047] group/btn shrink-0"
              >
                <span>Experimentar</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E3DDD1] text-xs text-[#7A7163]">
          Nenhuma vinheta corresponde ao filtro selecionado.
        </div>
      )}
    </div>
  );
};
