/**
 * NeedsLibrary - Biblioteca em grade de necessidades com opções especiais
 * ("Outra, em minhas palavras" e "Ainda não sei")
 */

import React from 'react';
import { Plus, HelpCircle, X, AlertTriangle } from 'lucide-react';
import { NeedCatalogItem, NeedSelectionEntry } from '../types';
import { NeedCard } from './NeedCard';
import { CURRENT_NEEDS_CONSTRAINTS } from '../schema';

interface NeedsLibraryProps {
  items: NeedCatalogItem[];
  selectedEntries: NeedSelectionEntry[];
  onToggleNeed: (item: NeedCatalogItem) => void;
  onOpenCustomModal: () => void;
  onSelectUnsure: () => void;
  inspectedItem: NeedCatalogItem | null;
  onCloseInspect: () => void;
  onInspectItem: (item: NeedCatalogItem) => void;
  explanationMessage: string | null;
  onClearExplanation: () => void;
}

export const NeedsLibrary: React.FC<NeedsLibraryProps> = ({
  items,
  selectedEntries,
  onToggleNeed,
  onOpenCustomModal,
  onSelectUnsure,
  inspectedItem,
  onCloseInspect,
  onInspectItem,
  explanationMessage,
  onClearExplanation,
}) => {
  const isMaxReached = selectedEntries.length >= CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES;

  const isItemSelected = (id: string) => {
    return selectedEntries.some((e) => e.needId === id);
  };

  return (
    <section id="needs-library-section" className="flex flex-col flex-1" aria-label="Biblioteca de Necessidades">
      {/* Banner de Aviso/Explicação se exceder 5 */}
      {explanationMessage && (
        <div
          id="needs-library-explanation"
          role="alert"
          className="mb-4 p-4 rounded-[16px] bg-[#F1E9DB] border-2 border-[#96551F] flex items-start justify-between gap-3 text-left animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 stroke-2 text-[#96551F] shrink-0 mt-0.5" />
            <p className="text-sm text-[#262B22] font-medium leading-relaxed">
              {explanationMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearExplanation}
            className="p-1 rounded-md text-[#6B6B63] hover:text-[#262B22] min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4 stroke-2" />
          </button>
        </div>
      )}

      {/* Grade de Cards: 2 colunas mobile, 2 tablet, 3 desktop */}
      <div
        id="needs-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
      >
        {items
          .filter((item) => item.active)
          .map((item) => (
            <NeedCard
              key={item.id}
              item={item}
              isSelected={isItemSelected(item.id)}
              onToggle={onToggleNeed}
              onInspect={onInspectItem}
              disabled={isMaxReached && !isItemSelected(item.id)}
            />
          ))}

        {/* Card Especial 1: Outra, em minhas palavras */}
        <button
          id="btn-open-custom-need"
          type="button"
          onClick={onOpenCustomModal}
          disabled={isMaxReached}
          className={`rounded-[24px] border-2 border-dashed border-[#96551F]/70 hover:border-[#96551F] bg-[#FDFAF4] hover:bg-[#F1E9DB]/50 p-4 sm:p-5 flex flex-col justify-between text-left transition-colors min-h-[160px] ${
            isMaxReached ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#F1E9DB] border-2 border-[#96551F] text-[#96551F] flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 stroke-2" />
            </div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#96551F] mb-1">
              Outra, em minhas palavras
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
              Escreva o que está presente para você caso as opções acima não contemplem.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8CFBE]/60 text-xs sm:text-sm font-semibold text-[#96551F] flex items-center gap-1">
            <span>Digitar termo próprio</span>
          </div>
        </button>

        {/* Card Especial 2: Ainda não sei */}
        <button
          id="btn-select-unsure"
          type="button"
          onClick={onSelectUnsure}
          className="rounded-[24px] border-2 border-[#D8CFBE] hover:border-[#6B6B63] bg-[#F1E9DB]/30 hover:bg-[#F1E9DB] p-4 sm:p-5 flex flex-col justify-between text-left transition-colors min-h-[160px]"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#6B6B63] flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5 stroke-2" />
            </div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#262B22] mb-1">
              Ainda não sei
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
              Tudo bem não ter clareza agora. Você pode registrar essa indefinição com acolhimento.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D8CFBE]/60 text-xs sm:text-sm font-semibold text-[#6B6B63] flex items-center gap-1">
            <span>Acolher a dúvida</span>
          </div>
        </button>
      </div>

      {/* Diálogo de Inspeção de Reflexão Aberta (Não seleciona o card) */}
      {inspectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
        >
          <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#005A1F] p-6 max-w-md w-full text-left">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D8CFBE]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F]">
                  Reflexão Aberta
                </span>
                <h3
                  id="inspect-dialog-title"
                  className="font-heading text-lg font-bold text-[#005A1F]"
                >
                  {inspectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseInspect}
                className="p-1 rounded-md text-[#6B6B63] hover:text-[#262B22] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fechar janela de reflexão"
              >
                <X className="w-5 h-5 stroke-2" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#96551F] mb-1">
                  Pergunta para contemplar
                </h4>
                <p className="text-base text-[#262B22] font-medium leading-relaxed">
                  {inspectedItem.reflectionQuestion || inspectedItem.shortDescription}
                </p>
              </div>

              {inspectedItem.gestureExample && (
                <div className="bg-[#F1E9DB] rounded-[16px] p-3 border border-[#D8CFBE]">
                  <h5 className="text-xs font-semibold text-[#07614C] mb-0.5">
                    Exemplo de gesto possível
                  </h5>
                  <p className="text-xs text-[#4B4B49]">
                    {inspectedItem.gestureExample}
                  </p>
                </div>
              )}

              <p className="text-xs text-[#6B6B63] italic">
                Nota: Esta pergunta é apenas um apoio de escuta; não exige resposta nem seleciona o card automaticamente.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#D8CFBE] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCloseInspect}
                className="px-4 py-2 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] min-h-[44px]"
              >
                Voltar à lista
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleNeed(inspectedItem);
                  onCloseInspect();
                }}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
              >
                {isItemSelected(inspectedItem.id) ? 'Remover escolha' : 'Escolher necessidade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
