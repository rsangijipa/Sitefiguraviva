/**
 * PresentNeedsTray - Bandeja "Mais presentes agora"
 * Superfície Areia (#F1E9DB), bordas 2px (#D8CFBE), ocupando 35% no Desktop
 * e integrada no fluxo mobile com âncora "Ver minhas escolhas (n)".
 */

import React from 'react';
import { Trash2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { NeedSelectionEntry } from '../types';
import { CURRENT_NEEDS_CONSTRAINTS } from '../schema';

interface PresentNeedsTrayProps {
  selectedEntries: NeedSelectionEntry[];
  onRemoveEntry: (entryId: string) => void;
  onProceed: () => void;
  focusEntryId: string | null;
}

export const PresentNeedsTray: React.FC<PresentNeedsTrayProps> = ({
  selectedEntries,
  onRemoveEntry,
  onProceed,
  focusEntryId,
}) => {
  const maxSlots = CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES;
  const emptySlotsCount = Math.max(0, maxSlots - selectedEntries.length);

  return (
    <aside
      id="present-needs-tray"
      aria-label="Bandeja de necessidades presentes"
      className="bg-[#F1E9DB] rounded-[24px] border-2 border-[#D8CFBE] p-5 sm:p-6 flex flex-col justify-between sticky top-20 text-left"
    >
      <div>
        {/* Cabeçalho da Bandeja */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#D8CFBE]">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#005A1F] leading-tight">
              Mais presentes agora
            </h2>
            <p className="text-xs text-[#6B6B63] mt-0.5">
              {selectedEntries.length === 0
                ? 'Nenhuma necessidade escolhida ainda'
                : `Ordem em que foram percebidas (${selectedEntries.length}/${maxSlots})`}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FDFAF4] text-[#005A1F] border border-[#D8CFBE]">
            {selectedEntries.length} / {maxSlots}
          </span>
        </div>

        {/* Lista das Necessidades Selecionadas */}
        {selectedEntries.length === 0 ? (
          <div
            id="tray-empty-state"
            className="py-10 px-4 text-center border-2 border-dashed border-[#D8CFBE] rounded-[20px] bg-[#FDFAF4]/60 mb-4"
          >
            <Sparkles className="w-8 h-8 stroke-2 text-[#96551F] mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-[#262B22] mb-1">
              Escolha até 5 necessidades
            </p>
            <p className="text-xs text-[#6B6B63] max-w-xs mx-auto leading-relaxed">
              Clique nos cartões ao lado para trazer ao centro o que parece mais urgente ou vivo neste momento.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mb-4" role="list" aria-label="Necessidades selecionadas">
            {selectedEntries.map((entry, idx) => {
              const isFocus = focusEntryId === entry.entryId;

              return (
                <div
                  key={entry.entryId}
                  role="listitem"
                  className={`group rounded-[18px] p-3 border-2 transition-all flex items-center justify-between gap-3 ${
                    isFocus
                      ? 'bg-[#FDFAF4] border-[#005A1F] ring-1 ring-[#005A1F]'
                      : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#96551F]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#F1E9DB] text-[#96551F] text-xs font-bold flex items-center justify-center shrink-0 border border-[#D8CFBE]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#005A1F] truncate">
                          {entry.labelSnapshot}
                        </h4>
                        {entry.isCustom && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#F1E9DB] text-[#96551F]">
                            Própria
                          </span>
                        )}
                        {isFocus && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#005A1F] text-[#FDFAF4]">
                            Primeira
                          </span>
                        )}
                      </div>
                      {entry.descriptionSnapshot && (
                        <p className="text-xs text-[#6B6B63] truncate max-w-xs">
                          {entry.descriptionSnapshot}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    id={`btn-remove-tray-entry-${entry.entryId}`}
                    type="button"
                    onClick={() => onRemoveEntry(entry.entryId)}
                    className="p-1.5 rounded-lg text-[#6B6B63] hover:text-[#96551F] hover:bg-[#F1E9DB] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label={`Remover ${entry.labelSnapshot} das escolhas`}
                    title="Remover das escolhas"
                  >
                    <Trash2 className="w-4 h-4 stroke-2" />
                  </button>
                </div>
              );
            })}

            {/* Espaços vazios indicando slots restantes */}
            {Array.from({ length: emptySlotsCount }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                className="rounded-[18px] border-2 border-dashed border-[#D8CFBE]/80 p-3 text-center text-xs text-[#6B6B63] bg-[#FDFAF4]/40"
              >
                + Espaço vago ({selectedEntries.length + i + 1}º)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé da bandeja com Ação de Prosseguir */}
      <div className="pt-4 border-t-2 border-[#D8CFBE]">
        <button
          id="btn-tray-proceed"
          type="button"
          disabled={selectedEntries.length === 0}
          onClick={onProceed}
          className={`w-full py-3 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            selectedEntries.length > 0
              ? 'bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C]'
              : 'bg-[#D8CFBE] text-[#6B6B63] cursor-not-allowed opacity-60'
          }`}
        >
          <span>Avançar com essas escolhas</span>
          <ArrowRight className="w-4 h-4 stroke-2" />
        </button>

        <p className="text-[11px] text-[#6B6B63] text-center mt-2">
          Você poderá revisar ou reordenar antes de finalizar.
        </p>
      </div>
    </aside>
  );
};
