/**
 * Campo de escrita da folha (RiverComposer)
 * Permite redigir uma frase de até 280 caracteres e colocá-la na água.
 * Respeita a privacidade: frases são efêmeras e nunca persistidas.
 */

import React, { useState } from 'react';
import { Send, AlertCircle, Info } from 'lucide-react';

interface RiverComposerProps {
  onAddLeaf: (text: string) => { success: boolean; reason?: string };
  activeLeafCount: number;
  maxLeaves: number;
  supportText?: string;
  isPaused: boolean;
}

export const RiverComposer: React.FC<RiverComposerProps> = ({
  onAddLeaf,
  activeLeafCount,
  maxLeaves,
  supportText = 'Escreva uma frase, se quiser, e acompanhe uma folha. Não é preciso fazer o pensamento desaparecer.',
  isPaused,
}) => {
  const [draft, setDraft] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const isFull = activeLeafCount >= maxLeaves;
  const remainingChars = 280 - draft.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    const trimmed = draft.trim();
    if (!trimmed) {
      setFeedbackError('Por favor, escreva uma palavra ou frase para soltar na folha.');
      return;
    }

    if (isFull) {
      setFeedbackError(
        `O rio acolhe até ${maxLeaves} folhas simultâneas. Aguarde uma delas seguir seu curso natural.`
      );
      return;
    }

    const result = onAddLeaf(trimmed);
    if (result.success) {
      // Limpa rascunho apenas após sucesso
      setDraft('');
      setFeedbackError(null);
    } else if (result.reason) {
      setFeedbackError(result.reason);
    }
  };

  return (
    <div className="w-full bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-5 sm:p-6 transition-all">
      {/* Texto de apoio e contexto ético */}
      <div className="mb-3 space-y-2 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-[#262B22] leading-relaxed">
            {supportText}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B63]">
            <Info className="w-3.5 h-3.5 text-[#96551F] shrink-0" strokeWidth={2} />
            <span>Prática efêmera: as frases não são salvas.</span>
          </div>
        </div>

        {/* Sugestões rápidas de acolhimento para inspirar o aluno */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#96551F] uppercase tracking-wider mr-1">
            Sugestões:
          </span>
          {[
            'Preocupação com prazos',
            'Cobrança por perfeição',
            'Cansaço acumulado',
            'Pensamento repetitivo',
            'Sensação de urgência',
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setDraft(suggestion);
                if (feedbackError) setFeedbackError(null);
              }}
              className="px-2.5 py-1 text-xs rounded-full bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] border border-[#D8CFBE] transition-colors cursor-pointer"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label htmlFor="thought-input" className="sr-only">
            Frase ou pensamento para colocar na folha
          </label>
          <textarea
            id="thought-input"
            rows={2}
            value={draft}
            onChange={(e) => {
              if (e.target.value.length <= 280) {
                setDraft(e.target.value);
                if (feedbackError) setFeedbackError(null);
              }
            }}
            placeholder="Qual pensamento ou sentimento você gostaria de observar passando agora? (opcional)"
            className="w-full px-4 py-3 bg-[#FDFAF4] text-[#262B22] border-2 border-[#D8CFBE] rounded-[16px] placeholder:text-[#6B6B63]/70 focus:border-[#005A1F] focus:ring-0 resize-none text-sm sm:text-base leading-relaxed transition-colors disabled:opacity-50"
            disabled={isPaused}
          />
        </div>

        {/* Linha inferior de controles e contagem */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-[#6B6B63]">
            <span
              className={remainingChars < 20 ? 'text-[#96551F] font-semibold' : ''}
              aria-live="polite"
            >
              {remainingChars} caracteres restantes
            </span>
            <span className="text-[#D8CFBE]" aria-hidden="true">|</span>
            <span>
              Folhas no rio: <strong className="text-[#005A1F]">{activeLeafCount}</strong>/{maxLeaves}
            </span>
          </div>

          <button
            type="submit"
            disabled={isPaused || !draft.trim() || isFull}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] active:bg-[#005A1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-none cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            <span>Colocar folha no rio</span>
          </button>
        </div>

        {/* Mensagem de erro ou limite de capacidade */}
        {feedbackError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 mt-2 rounded-[12px] bg-[#F1E9DB] border border-[#96551F]/40 text-xs text-[#96551F]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
            <span>{feedbackError}</span>
          </div>
        )}

        {isFull && !feedbackError && (
          <p className="text-xs text-[#96551F] italic text-left">
            O rio está cheio no momento. Acompanhe as folhas atuais até que uma termine sua travessia.
          </p>
        )}
      </form>
    </div>
  );
};
