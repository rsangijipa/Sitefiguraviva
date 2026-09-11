"use client";

import React, { useState } from "react";
import { EmotionFamily, EmotionNuance, EmotionSelectionEntry } from "../types";
import { X, Check, Sparkles } from "lucide-react";

interface EmotionDetailPanelProps {
  selectedNuance: EmotionNuance | null;
  family: EmotionFamily | null;
  selectedEntries: EmotionSelectionEntry[];
  onAddEntry: (entry: EmotionSelectionEntry) => void;
  onClose: () => void;
}

export const EmotionDetailPanel: React.FC<EmotionDetailPanelProps> = ({
  selectedNuance,
  family,
  selectedEntries,
  onAddEntry,
  onClose,
}) => {
  const [intensity, setIntensity] = useState<number | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  if (!selectedNuance && !useCustom) {
    return null;
  }

  const handleAdd = () => {
    if (useCustom && customWord.trim()) {
      onAddEntry({
        emotionId: null,
        customLabel: customWord.trim().slice(0, 80),
        labelSnapshot: customWord.trim().slice(0, 80),
        familyId: null,
        familyName: "Em minhas palavras",
        intensity,
      });
      setCustomWord("");
      setUseCustom(false);
      onClose();
    } else if (selectedNuance && family) {
      onAddEntry({
        emotionId: selectedNuance.id,
        customLabel: null,
        labelSnapshot: selectedNuance.label,
        familyId: family.id,
        familyName: family.name,
        intensity,
      });
      setIntensity(null);
      onClose();
    }
  };

  const isLimitReached = selectedEntries.length >= 5;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#FDFAF4] border-l border-[#D8CFBE] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#D8CFBE]">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#96551F]">
            <Sparkles size={14} aria-hidden="true" /> Detalhe da palavra
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#6B6B63] hover:text-[#262B22] rounded-full hover:bg-[#F1E9DB] min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </div>

        {selectedNuance && family && !useCustom && (
          <div className="mt-6 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#07614C]">
                Família: {family.name}
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#005A1F] mt-1">
                {selectedNuance.label}
              </h2>
            </div>

            <div className="bg-[#F1E9DB] p-4 rounded-2xl border border-[#D8CFBE]">
              <p className="text-[#262B22] text-base leading-relaxed">
                {selectedNuance.description}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
                Exemplo cotidiano
              </h3>
              <p className="text-sm text-[#262B22] italic border-l-2 border-[#96551F] pl-3 py-1">
                “{selectedNuance.example}”
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#005A1F]">
                Pergunta para reflexão
              </h3>
              <p className="text-sm font-medium text-[#262B22]">
                {selectedNuance.question}
              </p>
            </div>

            {selectedNuance.synonyms.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B63]">
                  Sinônimos relacionados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNuance.synonyms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#F1E9DB] text-[#262B22] rounded-full text-xs font-medium border border-[#D8CFBE]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Word mode */}
        {useCustom && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#005A1F]">
                Em minhas palavras
              </h2>
              <p className="text-sm text-[#6B6B63] mt-1">
                Escreva um termo próprio de até 80 caracteres. Ele fica restrito
                ao seu registro pessoal.
              </p>
            </div>

            <div>
              <label
                htmlFor="custom-word-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#96551F] mb-2"
              >
                Sua palavra ou nuance
              </label>
              <input
                id="custom-word-input"
                type="text"
                maxLength={80}
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="Ex: Alívio sutil..."
                className="w-full p-3 bg-white border border-[#D8CFBE] rounded-xl text-[#262B22] focus:outline-none focus:border-[#005A1F]"
              />
              <span className="text-xs text-[#6B6B63] mt-1 block text-right">
                {customWord.length}/80
              </span>
            </div>
          </div>
        )}

        {/* Optional Intensity (1-5) */}
        <div className="mt-8 pt-6 border-t border-[#D8CFBE] space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6B63]">
            Intensidade (opcional)
          </label>
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setIntensity(intensity === val ? null : val)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition min-h-[44px] ${
                  intensity === val
                    ? "bg-[#005A1F] text-white border-[#005A1F]"
                    : "bg-white text-[#262B22] border-[#D8CFBE] hover:bg-[#F1E9DB]"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-[#6B6B63]">
            <span>Sutil</span>
            <span>Muito presente</span>
          </div>
        </div>

        {isLimitReached && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            Você pode guardar até 5 palavras neste registro. Remova uma para
            adicionar outra.
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-[#D8CFBE] flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isLimitReached || (useCustom && !customWord.trim())}
          className="w-full py-3.5 bg-[#005A1F] text-white rounded-xl font-bold text-sm hover:bg-[#07614C] transition disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          <Check size={18} /> Adicionar ao meu registro
        </button>

        {!useCustom ? (
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className="w-full py-2.5 text-xs font-bold text-[#96551F] hover:underline"
          >
            + Usar minhas próprias palavras em vez desta nuance
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className="w-full py-2.5 text-xs font-bold text-[#6B6B63] hover:underline"
          >
            ← Voltar para as nuances do catálogo
          </button>
        )}
      </div>
    </div>
  );
};
