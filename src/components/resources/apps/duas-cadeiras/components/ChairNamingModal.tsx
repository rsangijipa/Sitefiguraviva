import React, { useState } from "react";
import { ChairConfig } from "../types";
import { Sparkles, Edit3, X, Check } from "lucide-react";

interface ChairNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  chairA: ChairConfig;
  chairB: ChairConfig;
  sessionTitle: string;
  onSave: (
    chairA: ChairConfig,
    chairB: ChairConfig,
    sessionTitle: string,
  ) => void;
}

const PRESET_PAIRS = [
  {
    title: "Crítico & Compreensão",
    a: "Voz Autocrítica",
    subA: "Exigências e julgamentos",
    b: "Voz Compassiva",
    subB: "Acolhimento e compreensão",
  },
  {
    title: "Razão & Emoção",
    a: "Meu Lado Racional",
    subA: "Lógica e planejamento",
    b: "Meu Lado Sentimental",
    subB: "Sensações e intuições",
  },
  {
    title: "Desejo & Segurança",
    a: "O Que Eu Desejo",
    subA: "Vontades e impulsos",
    b: "O Que Tenho Medo",
    subB: "Cautela e autopreservação",
  },
  {
    title: "Presente & Futuro",
    a: "Eu de Agora",
    subA: "Realidade atual e limites",
    b: "Eu do Futuro",
    subB: "Visão e maturidade",
  },
];

export const ChairNamingModal: React.FC<ChairNamingModalProps> = ({
  isOpen,
  onClose,
  chairA,
  chairB,
  sessionTitle,
  onSave,
}) => {
  const [title, setTitle] = useState(sessionTitle);
  const [nameA, setNameA] = useState(chairA.name);
  const [subA, setSubA] = useState(chairA.sublabel);
  const [nameB, setNameB] = useState(chairB.name);
  const [subB, setSubB] = useState(chairB.sublabel);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof PRESET_PAIRS)[0]) => {
    setTitle(`Diálogo: ${preset.title}`);
    setNameA(preset.a);
    setSubA(preset.subA);
    setNameB(preset.b);
    setSubB(preset.subB);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        ...chairA,
        name: nameA.trim() || "Cadeira A",
        sublabel: subA.trim(),
      },
      {
        ...chairB,
        name: nameB.trim() || "Cadeira B",
        sublabel: subB.trim(),
      },
      title.trim() || "Reflexão Dialógica",
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chair-naming-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-stone-700" />
            <h3
              id="chair-naming-title"
              className="text-base font-semibold text-stone-900"
            >
              Definir Perspectivas das Cadeiras
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestion Presets */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Sugestões de temas dialógicos:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PAIRS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 hover:border-stone-300 transition-colors text-xs text-stone-700"
              >
                <div className="font-semibold text-stone-900 mb-0.5">
                  {preset.title}
                </div>
                <div className="text-[11px] text-stone-500 truncate">
                  {preset.a} &times; {preset.b}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Tema / Título da Sessão
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Decisão sobre a carreira, Conflito interior..."
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Cadeira A */}
            <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-900" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Cadeira A
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Nome da perspectiva:
                </label>
                <input
                  type="text"
                  required
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  placeholder="Ex.: Voz Crítica, Razão, Mãe..."
                  className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Tom / descrição breve (opcional):
                </label>
                <input
                  type="text"
                  value={subA}
                  onChange={(e) => setSubA(e.target.value)}
                  placeholder="Ex.: Exigente, receosa..."
                  className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Cadeira B */}
            <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Cadeira B
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Nome da perspectiva:
                </label>
                <input
                  type="text"
                  required
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  placeholder="Ex.: Voz Compreensiva, Emoção..."
                  className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Tom / descrição breve (opcional):
                </label>
                <input
                  type="text"
                  value={subB}
                  onChange={(e) => setSubB(e.target.value)}
                  placeholder="Ex.: Calma, protetora..."
                  className="w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Nomes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
