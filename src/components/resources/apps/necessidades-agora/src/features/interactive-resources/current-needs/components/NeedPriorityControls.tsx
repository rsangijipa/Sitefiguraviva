/**
 * NeedPriorityControls - Controles de Ordenação Opcional e Foco Explícito
 *
 * "Ordenar por presença" é opcional; se não ordenar, os itens são apresentados
 * apenas como "Suas escolhas", sem falsa hierarquia clínica.
 * "Quero observar esta primeiro" é uma escolha deliberada do aluno.
 */

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Star,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { NeedSelectionEntry } from '../types';

interface NeedPriorityControlsProps {
  entries: NeedSelectionEntry[];
  ordered: boolean;
  onSetOrdered: (ordered: boolean) => void;
  onMoveEntry: (entryId: string, direction: 'up' | 'down') => void;
  focusEntryId: string | null;
  onSetFocusEntry: (entryId: string | null) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const NeedPriorityControls: React.FC<NeedPriorityControlsProps> = ({
  entries,
  ordered,
  onSetOrdered,
  onMoveEntry,
  focusEntryId,
  onSetFocusEntry,
  onBack,
  onProceed,
}) => {
  return (
    <div
      id="priority-controls-container"
      className="max-w-2xl mx-auto w-full p-4 sm:p-6 text-left"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#005A1F] mb-2">
          Como essas necessidades se apresentam agora?
        </h2>
        <p className="text-sm text-[#4B4B49] leading-relaxed">
          Você selecionou {entries.length} necessidade(s). Você pode mantê-las sem
          ordem formal ou organizá-las conforme o que parece mais urgente ou vivo.
        </p>
      </div>

      {/* Switch Opcional: Ordenar por presença */}
      <div className="bg-[#F1E9DB] rounded-[20px] border-2 border-[#D8CFBE] p-4 mb-6 flex items-center justify-between gap-4">
        <div>
          <label
            htmlFor="toggle-ordered-switch"
            className="text-sm font-bold text-[#005A1F] cursor-pointer block"
          >
            Ordenar por presença?
          </label>
          <p className="text-xs text-[#6B6B63] mt-0.5">
            {ordered
              ? 'Organize na ordem em que demandam sua atenção.'
              : 'Lista mantida como grupo livre de escolhas.'}
          </p>
        </div>

        <button
          id="toggle-ordered-switch"
          type="button"
          role="switch"
          aria-checked={ordered}
          onClick={() => onSetOrdered(!ordered)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005A1F] ${
            ordered ? 'bg-[#005A1F]' : 'bg-[#D8CFBE]'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#FDFAF4] shadow-xs ring-0 transition duration-200 ease-in-out ${
              ordered ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Lista de Itens com Controles Acessíveis */}
      <div className="space-y-3 mb-8" role="list" aria-label="Lista de necessidades selecionadas">
        {entries.map((entry, idx) => {
          const isFocus = focusEntryId === entry.entryId;

          return (
            <div
              key={entry.entryId}
              role="listitem"
              className={`rounded-[20px] p-4 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isFocus
                  ? 'bg-[#FDFAF4] border-[#005A1F] ring-1 ring-[#005A1F]'
                  : 'bg-[#FDFAF4] border-[#D8CFBE]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                {ordered && (
                  <span className="w-7 h-7 rounded-full bg-[#F1E9DB] text-[#005A1F] text-xs font-bold flex items-center justify-center shrink-0 border border-[#D8CFBE]">
                    {idx + 1}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#005A1F]">
                      {entry.labelSnapshot}
                    </h3>
                    {isFocus && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Observar primeiro
                      </span>
                    )}
                  </div>
                  {entry.descriptionSnapshot && (
                    <p className="text-xs text-[#6B6B63] mt-0.5">
                      {entry.descriptionSnapshot}
                    </p>
                  )}
                </div>
              </div>

              {/* Ações por Item: Reordenar (se ordered) + Definir Foco */}
              <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D8CFBE]/60">
                {ordered && (
                  <div className="flex items-center gap-1 bg-[#F1E9DB] rounded-full p-1 border border-[#D8CFBE]">
                    <button
                      id={`btn-move-up-${entry.entryId}`}
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveEntry(entry.entryId, 'up')}
                      className="p-1.5 rounded-full text-[#005A1F] hover:bg-[#FDFAF4] disabled:opacity-30 disabled:hover:bg-transparent min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label={`Mover ${entry.labelSnapshot} para cima`}
                    >
                      <ArrowUp className="w-4 h-4 stroke-2" />
                    </button>
                    <button
                      id={`btn-move-down-${entry.entryId}`}
                      type="button"
                      disabled={idx === entries.length - 1}
                      onClick={() => onMoveEntry(entry.entryId, 'down')}
                      className="p-1.5 rounded-full text-[#005A1F] hover:bg-[#FDFAF4] disabled:opacity-30 disabled:hover:bg-transparent min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label={`Mover ${entry.labelSnapshot} para baixo`}
                    >
                      <ArrowDown className="w-4 h-4 stroke-2" />
                    </button>
                  </div>
                )}

                {/* Ação Explícita de Foco */}
                <button
                  id={`btn-toggle-focus-${entry.entryId}`}
                  type="button"
                  onClick={() => onSetFocusEntry(isFocus ? null : entry.entryId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors min-h-[40px] ${
                    isFocus
                      ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                      : 'bg-[#F1E9DB] text-[#262B22] border-[#D8CFBE] hover:border-[#96551F]'
                  }`}
                  aria-pressed={isFocus}
                >
                  <Star className={`w-3.5 h-3.5 ${isFocus ? 'fill-current' : ''}`} />
                  <span>{isFocus ? 'Foco marcado' : 'Quero olhar esta 1º'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botões de Navegação */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-[#D8CFBE]">
        <button
          id="btn-priority-back"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-2" />
          <span>Ajustar escolhas</span>
        </button>

        <button
          id="btn-priority-proceed"
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4 stroke-2" />
        </button>
      </div>
    </div>
  );
};
