"use client";

import React, { useState } from "react";
import { EmotionSelectionEntry } from "../types";
import { Trash2, Edit3, Save, XCircle, Sparkles } from "lucide-react";

interface SelectedEmotionsProps {
  selectedEntries: EmotionSelectionEntry[];
  isUnsure: boolean;
  onRemoveEntry: (index: number) => void;
  onEditChoices: () => void;
  onSave: (note: string) => void;
  onExitWithoutSaving: () => void;
  onToggleUnsure: (unsure: boolean) => void;
}

export const SelectedEmotions: React.FC<SelectedEmotionsProps> = ({
  selectedEntries,
  isUnsure,
  onRemoveEntry,
  onEditChoices,
  onSave,
  onExitWithoutSaving,
  onToggleUnsure,
}) => {
  const [note, setNote] = useState("");

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 bg-[#FDFAF4] rounded-3xl border border-[#D8CFBE] shadow-sm">
      <header className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#07614C]">
          <Sparkles size={14} aria-hidden="true" /> Revisão do registro
        </span>
        <h2 className="font-serif text-3xl font-bold text-[#005A1F]">
          O que ganha nome agora?
        </h2>
        <p className="text-sm text-[#6B6B63]">
          Estas foram as palavras que você escolheu hoje.
        </p>
      </header>

      {/* Unsure toggle */}
      <div className="p-4 bg-[#F1E9DB] rounded-2xl border border-[#D8CFBE] flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#005A1F]">
            Ainda não sei nomear
          </h4>
          <p className="text-xs text-[#6B6B63]">
            É legítimo não saber colocar em palavras neste momento.
          </p>
        </div>
        <input
          type="checkbox"
          checked={isUnsure}
          onChange={(e) => onToggleUnsure(e.target.checked)}
          className="w-5 h-5 accent-[#005A1F] rounded cursor-pointer"
        />
      </div>

      {!isUnsure && selectedEntries.length === 0 ? (
        <div className="p-8 text-center bg-[#F1E9DB]/50 rounded-2xl border border-dashed border-[#D8CFBE]">
          <p className="text-sm text-[#6B6B63]">
            Nenhuma palavra selecionada ainda. Volte à roda para escolher
            nuances ou use &quot;Ainda não sei nomear&quot;.
          </p>
          <button
            type="button"
            onClick={onEditChoices}
            className="mt-4 px-4 py-2 bg-[#005A1F] text-white rounded-xl text-xs font-bold"
          >
            Explorar a roda
          </button>
        </div>
      ) : (
        !isUnsure && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
              Palavras escolhidas ({selectedEntries.length}/5)
            </h3>
            <div className="space-y-3">
              {selectedEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#D8CFBE] shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#005A1F] text-lg">
                        {entry.labelSnapshot}
                      </h4>
                      {entry.familyName && (
                        <span className="px-2.5 py-0.5 bg-[#F1E9DB] text-[#07614C] rounded-full text-[10px] font-bold">
                          {entry.familyName}
                        </span>
                      )}
                    </div>
                    {entry.intensity && (
                      <p className="text-xs text-[#6B6B63] mt-1">
                        Intensidade: {entry.intensity}/5
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveEntry(idx)}
                    className="p-2 text-[#6B6B63] hover:text-red-600 rounded-lg hover:bg-red-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                    aria-label={`Remover ${entry.labelSnapshot}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Optional Note */}
      <div className="space-y-2">
        <label
          htmlFor="record-note"
          className="block text-xs font-bold uppercase tracking-wider text-[#96551F]"
        >
          Nota pessoal (opcional, até 500 caracteres)
        </label>
        <textarea
          id="record-note"
          maxLength={500}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escreva algo sobre este momento se desejar..."
          className="w-full p-4 bg-white border border-[#D8CFBE] rounded-2xl text-[#262B22] focus:outline-none focus:border-[#005A1F]"
        />
        <span className="text-xs text-[#6B6B63] block text-right">
          {note.length}/500
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#D8CFBE]">
        <button
          type="button"
          onClick={onEditChoices}
          className="flex-1 py-3.5 px-4 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-sm hover:bg-[#D8CFBE] transition inline-flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Edit3 size={18} /> Editar escolhas
        </button>

        <button
          type="button"
          onClick={() => onSave(note)}
          disabled={!isUnsure && selectedEntries.length === 0}
          className="flex-1 py-3.5 px-4 bg-[#005A1F] text-white rounded-xl font-bold text-sm hover:bg-[#07614C] transition inline-flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
        >
          <Save size={18} /> Salvar no meu histórico
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onExitWithoutSaving}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6B6B63] hover:text-[#262B22] min-h-[44px] px-4 py-2"
        >
          <XCircle size={16} /> Encerrar sem salvar
        </button>
      </div>
    </div>
  );
};
