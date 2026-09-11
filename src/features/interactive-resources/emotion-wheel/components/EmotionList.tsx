"use client";

import React, { useState } from "react";
import { EmotionFamily, EmotionNuance, EmotionSelectionEntry } from "../types";
import { Search, ChevronDown, ChevronUp, Plus, Check } from "lucide-react";

interface EmotionListProps {
  families: EmotionFamily[];
  selectedEntries: EmotionSelectionEntry[];
  onSelectNuance: (nuance: EmotionNuance, family: EmotionFamily) => void;
}

export const EmotionList: React.FC<EmotionListProps> = ({
  families,
  selectedEntries,
  onSelectNuance,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFamilyIds, setOpenFamilyIds] = useState<Record<string, boolean>>({
    alegria: true,
    tristeza: true,
    raiva: true,
    medo: true,
    surpresa: true,
    aversao: true,
  });

  const toggleFamily = (id: string) => {
    setOpenFamilyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const query = searchQuery.toLowerCase().trim();

  const filteredFamilies = families
    .map((fam) => {
      const matchingNuances = fam.nuances.filter(
        (n) =>
          !query ||
          n.label.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.synonyms.some((s) => s.toLowerCase().includes(query)),
      );
      return { ...fam, nuances: matchingNuances };
    })
    .filter(
      (fam) =>
        !query ||
        fam.name.toLowerCase().includes(query) ||
        fam.description.toLowerCase().includes(query) ||
        fam.nuances.length > 0,
    );

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B63]">
          <Search size={18} aria-hidden="true" />
        </span>
        <label htmlFor="emotion-search" className="sr-only">
          Buscar palavra ou sinônimo
        </label>
        <input
          id="emotion-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar palavra, sinônimo ou família..."
          className="w-full pl-11 pr-4 py-3 bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl text-[#262B22] placeholder-[#6B6B63] focus:outline-none focus:border-[#005A1F] focus:ring-1 focus:ring-[#005A1F]"
        />
      </div>

      {filteredFamilies.length === 0 ? (
        <div className="p-8 text-center bg-[#F1E9DB] rounded-2xl border border-[#D8CFBE]">
          <p className="text-[#262B22] font-medium">
            Nenhuma palavra encontrada. Você pode usar suas próprias palavras.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFamilies.map((fam) => {
            const isOpen = openFamilyIds[fam.id] ?? true;
            return (
              <div
                key={fam.id}
                className="border border-[#D8CFBE] rounded-2xl bg-[#FDFAF4] overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFamily(fam.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 flex items-center justify-between bg-[#F1E9DB]/50 hover:bg-[#F1E9DB] transition text-left"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#005A1F]">
                      {fam.name}
                    </h3>
                    <p className="text-sm text-[#6B6B63]">{fam.description}</p>
                  </div>
                  <span className="text-[#005A1F]">
                    {isOpen ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-6 divide-y divide-[#D8CFBE]/40 space-y-4">
                    {fam.nuances.map((nuance) => {
                      const isChosen = selectedEntries.some(
                        (e) => e.labelSnapshot === nuance.label,
                      );
                      return (
                        <div
                          key={nuance.id}
                          className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-[#262B22] text-base">
                              {nuance.label}
                            </h4>
                            <p className="text-sm text-[#6B6B63]">
                              {nuance.description}
                            </p>
                            <p className="text-xs text-[#96551F] italic">
                              Exemplo: “{nuance.example}”
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectNuance(nuance, fam)}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
                              isChosen
                                ? "bg-[#005A1F] text-white"
                                : "border border-[#005A1F] text-[#005A1F] hover:bg-[#005A1F]/10"
                            }`}
                          >
                            {isChosen ? (
                              <>
                                <Check size={16} aria-hidden="true" />{" "}
                                Selecionada
                              </>
                            ) : (
                              <>
                                <Plus size={16} aria-hidden="true" /> Escolher
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
