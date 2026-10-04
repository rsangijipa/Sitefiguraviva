import React from 'react';
import { EMOTION_FAMILIES } from '../../../data/emotionsData';
import { Check, ChevronRight } from 'lucide-react';
import { audioService } from '../../../services/audioService';

interface AccessibleEmotionListProps {
  selectedFamilyId?: string;
  selectedSecondaryId?: string;
  selectedNuanceId?: string;
  onSelectFamily: (familyId: string) => void;
  onSelectSecondary: (secondaryId: string, familyId: string) => void;
  onSelectNuance: (nuanceId: string, secondaryId: string, familyId: string) => void;
}

export const AccessibleEmotionList: React.FC<AccessibleEmotionListProps> = ({
  selectedFamilyId,
  selectedSecondaryId,
  selectedNuanceId,
  onSelectFamily,
  onSelectSecondary,
  onSelectNuance,
}) => {
  return (
    <div
      id="accessible-emotion-list"
      className="w-full bg-[#FDFAF4] rounded-2xl border-2 border-[#D8CFBE] p-4 sm:p-6 space-y-4"
      role="region"
      aria-label="Exploração textual acessível da Roda das Emoções"
    >
      <div className="border-b border-[#D8CFBE] pb-3">
        <h3 className="text-base font-semibold font-fraunces text-[#262B22]">
          Navegação Estruturada por Famílias e Nuances
        </h3>
        <p className="text-xs text-[#6B6B63] mt-1">
          Alternativa linear acessível: selecione uma família para desdobrar suas emoções relacionadas e nuances somáticas.
        </p>
      </div>

      <div className="space-y-3" role="list">
        {EMOTION_FAMILIES.map((family) => {
          const isFamilySelected = selectedFamilyId === family.id;

          return (
            <div
              key={family.id}
              role="listitem"
              className={`rounded-2xl border-2 transition-colors overflow-hidden ${
                isFamilySelected
                  ? 'border-[#005A1F] bg-[#F1E9DB]'
                  : 'border-[#D8CFBE] bg-[#FAF6EE] hover:bg-[#F4ECE0]'
              }`}
            >
              {/* Botão da Família */}
              <button
                id={`accessible-btn-family-${family.id}`}
                onClick={() => {
                  audioService.playSelectTone(1);
                  onSelectFamily(family.id);
                }}
                aria-expanded={isFamilySelected}
                className="w-full text-left p-3.5 flex items-center justify-between gap-3 min-h-[44px]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-fraunces font-semibold text-[#262B22] text-sm sm:text-base">
                      {family.name}
                    </span>
                    {isFamilySelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005A1F] bg-[#FDFAF4] px-2 py-0.5 rounded-full border border-[#005A1F]">
                        <Check className="w-3 h-3 stroke-[2]" />
                        Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#4B4B49] mt-0.5 leading-relaxed">
                    {family.description}
                  </p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-[#6B6B63] transition-transform ${
                    isFamilySelected ? 'rotate-90 text-[#005A1F]' : ''
                  }`}
                />
              </button>

              {/* Sub-itens quando expandido */}
              {isFamilySelected && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#D8CFBE]/60 bg-[#FDFAF4]/70">
                  <span className="text-xs font-semibold text-[#4B4B49] block uppercase tracking-wider">
                    Emoções Relacionadas:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {family.secondaries.map((sec) => {
                      const isSecSelected = selectedSecondaryId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          className={`p-2.5 rounded-xl border-2 transition-colors ${
                            isSecSelected
                              ? 'border-[#96551F] bg-[#F1E9DB]'
                              : 'border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F8F3EA]'
                          }`}
                        >
                          <button
                            id={`accessible-btn-sec-${sec.id}`}
                            onClick={() => {
                              audioService.playSelectTone(2);
                              onSelectSecondary(sec.id, family.id);
                            }}
                            className="w-full text-left font-medium text-xs text-[#262B22] flex items-center justify-between min-h-[36px]"
                          >
                            <span>{sec.name}</span>
                            {isSecSelected && <Check className="w-3.5 h-3.5 text-[#96551F]" />}
                          </button>

                          {/* Nuances da secundária */}
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-[#D8CFBE]/50">
                            {sec.nuances.map((nuance) => {
                              const isNuanceSelected = selectedNuanceId === nuance.id;
                              return (
                                <button
                                  key={nuance.id}
                                  id={`accessible-btn-nuance-${nuance.id}`}
                                  onClick={() => {
                                    audioService.playSelectTone(3);
                                    onSelectNuance(nuance.id, sec.id, family.id);
                                  }}
                                  aria-label={`Nuance: ${nuance.name}. ${nuance.phenomenologicalDescription}`}
                                  className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between min-h-[32px] ${
                                    isNuanceSelected
                                      ? 'bg-[#005A1F] text-[#FDFAF4] font-semibold'
                                      : 'text-[#4B4B49] hover:bg-[#EBE2D0]'
                                  }`}
                                >
                                  <span>{nuance.name}</span>
                                  {isNuanceSelected && <Check className="w-3 h-3 text-[#FDFAF4]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
