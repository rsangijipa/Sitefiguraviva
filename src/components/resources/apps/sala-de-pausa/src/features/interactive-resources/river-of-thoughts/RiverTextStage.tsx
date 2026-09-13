/**
 * @license
 * Instituto Figura Viva - Visão Acessível em Texto do Rio dos Pensamentos (Registro Confluência)
 * Alternativa completa para leitores de tela e preferência por movimento estático.
 */

import React from 'react';
import { FloatingThought } from '../../../types';
import { Leaf, X, Sparkles } from 'lucide-react';

interface RiverTextStageProps {
  thoughts: FloatingThought[];
  onDissolveThought: (id: string) => void;
  totalReleasedCount: number;
}

export const RiverTextStage: React.FC<RiverTextStageProps> = ({
  thoughts,
  onDissolveThought,
  totalReleasedCount,
}) => {
  return (
    <div 
      id="river-text-stage"
      className="w-full bg-[#FDFAF4] border-2 border-[#07614C] rounded-[24px] p-6 text-left"
      role="region"
      aria-label="Lista textual dos pensamentos que fluem pelo rio"
    >
      <div className="flex items-center justify-between border-b border-[#D8CFBE] pb-3 mb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#005A1F]">
            Visão contemplativa em texto
          </h3>
          <p className="text-xs text-[#6B6B63]">
            Acompanhe o fluxo de palavras sem animações ou deslocamentos contínuos.
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-[#F1E9DB] text-[#005A1F] rounded-full border border-[#005A1F]/30">
          {thoughts.length} presente(s)
        </span>
      </div>

      {thoughts.length === 0 ? (
        <div className="py-8 text-center text-[#6B6B63]">
          <Sparkles className="w-8 h-8 text-[#005A1F] opacity-40 mx-auto mb-2" />
          <p className="font-serif text-sm text-[#005A1F]">
            Nenhum pensamento flutuando no momento.
          </p>
          <p className="text-xs text-[#6B6B63] mt-1">
            As águas do rio permanecem em repouso.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" aria-live="polite">
          {thoughts.map((thought) => (
            <li 
              key={thought.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE]"
            >
              <div className="flex items-center gap-2.5">
                <Leaf className="w-4 h-4 text-[#005A1F] shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-[#262B22]">
                  {thought.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDissolveThought(thought.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FDFAF4] text-[#96551F] border border-[#96551F]/40 hover:bg-[#96551F] hover:text-[#FDFAF4] transition-colors min-h-[36px]"
                aria-label={`Deixar ir: ${thought.text}`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Deixar ir</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-3 border-t border-[#D8CFBE] text-xs text-[#6B6B63] flex justify-between">
        <span>Total acolhido nesta sessão: {totalReleasedCount}</span>
        <span>A dissolução é um ato natural de soltura</span>
      </div>
    </div>
  );
};
