/**
 * Lista de folhas ativas (ActiveLeavesList)
 * Garante total acessibilidade por teclado, leitores de tela e modo de movimento reduzido.
 */

import React from 'react';
import { LeafThought } from '../../../../types';
import { Leaf, ArrowRight, X } from 'lucide-react';

interface ActiveLeavesListProps {
  leaves: LeafThought[];
  onRemoveLeaf: (id: string) => void;
  onAdvanceLeaf?: (id: string) => void;
  reducedMotion: boolean;
  announcement: string | null;
}

export const ActiveLeavesList: React.FC<ActiveLeavesListProps> = ({
  leaves,
  onRemoveLeaf,
  onAdvanceLeaf,
  reducedMotion,
  announcement,
}) => {
  return (
    <div className="w-full bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-5 sm:p-6 text-left">
      {/* Região ao vivo para leitores de tela */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div className="flex items-center justify-between pb-3 border-b border-[#D8CFBE] mb-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#005A1F]" strokeWidth={2} />
          <h3 className="font-['Fraunces'] text-base text-[#005A1F] font-semibold">
            Folhas no curso do rio ({leaves.length})
          </h3>
        </div>
        <span className="text-xs text-[#6B6B63]">
          {reducedMotion ? 'Modo de leitura manual' : 'Visão textual sincronizada'}
        </span>
      </div>

      {leaves.length === 0 ? (
        <p className="text-xs sm:text-sm text-[#6B6B63] italic py-3">
          Nenhuma folha no leito do rio no momento. Você pode soltar uma frase acima ou apenas contemplar o cenário calmo.
        </p>
      ) : (
        <ul className="space-y-2.5" aria-label="Lista de pensamentos presentes no rio">
          {leaves.map((leaf, index) => {
            const progressPercent = Math.min(Math.max(Math.round(leaf.xProgress * 100), 0), 100);

            return (
              <li
                key={leaf.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-[16px] bg-[#F1E9DB]/60 border border-[#D8CFBE] transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#07614C] text-[#FDFAF4] text-xs flex items-center justify-center font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#262B22] break-words">
                      "{leaf.text}"
                    </p>
                    <p className="text-xs text-[#6B6B63] mt-0.5">
                      Travessia: {progressPercent}% pelo rio
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Botão para adiantar o fluxo da folha no modo de movimento reduzido */}
                  {reducedMotion && onAdvanceLeaf && (
                    <button
                      type="button"
                      onClick={() => onAdvanceLeaf(leaf.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-medium text-[#005A1F] hover:bg-[#FDFAF4] rounded-[12px] border border-[#005A1F]/30 transition-colors cursor-pointer"
                      aria-label={`Avançar folha "${leaf.text}"`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Deixar passar</span>
                    </button>
                  )}

                  {/* Botão de retirar folha */}
                  <button
                    type="button"
                    onClick={() => onRemoveLeaf(leaf.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[44px] text-xs font-medium text-[#96551F] hover:bg-[#FDFAF4] rounded-[12px] border border-[#96551F]/30 transition-colors cursor-pointer"
                    aria-label={`Retirar folha com pensamento: "${leaf.text}"`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Retirar</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
