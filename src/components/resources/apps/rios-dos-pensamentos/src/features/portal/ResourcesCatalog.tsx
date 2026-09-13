/**
 * Catálogo de Recursos Interativos - Portal do Aluno
 * Instituto Figura Viva - Registro Visual: CONFLUÊNCIA
 */

import React from 'react';
import { Waves, Flower2, HeartHandshake, ArrowRight, Clock, Shield } from 'lucide-react';
import { UserProfile } from '../../types';

interface ResourcesCatalogProps {
  currentUser: UserProfile;
  onOpenResource: (slug: string) => void;
  onOpenHistory: () => void;
}

export const ResourcesCatalog: React.FC<ResourcesCatalogProps> = ({
  currentUser,
  onOpenResource,
  onOpenHistory,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#D8CFBE]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
              Portal do Aluno
            </span>
            <div className="w-8 h-1 rounded-full gradient-confluencia" aria-hidden="true" />
          </div>
          <h1 className="font-['Fraunces'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#005A1F]">
            Recursos Interativos
          </h1>
          <p className="text-sm sm:text-base text-[#262B22] mt-1.5 max-w-2xl leading-relaxed">
            Espaços protegidos de observação e autorregulação. As práticas respeitam seu ritmo, sem contadores de desempenho ou julgamento clínico.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[16px] border-2 border-[#005A1F] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#005A1F] text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Meu histórico privado</span>
        </button>
      </div>

      {/* Grid de Recursos Confluência */}
      <div className="grid grid-cols-1 max-w-xl mx-auto gap-6">
        {/* CARD PRINCIPAL: Rio dos Pensamentos */}
        <div
          id="card-rio-dos-pensamentos"
          className="card-confluencia p-6 sm:p-8 flex flex-col justify-between hover:border-[#96551F] transition-all bg-[#FDFAF4]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-[16px] bg-[#F1E9DB] border-2 border-[#07614C] flex items-center justify-center text-[#07614C]">
                <Waves className="w-6 h-6 text-[#07614C]" strokeWidth={2} />
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F1E9DB] border border-[#D8CFBE] text-xs font-semibold text-[#005A1F]">
                Registro Confluência
              </span>
            </div>

            <div>
              <h2 className="font-['Fraunces'] text-2xl sm:text-3xl font-bold text-[#005A1F]">
                Rio dos Pensamentos
              </h2>
              <p className="text-sm sm:text-base text-[#262B22] mt-2 leading-relaxed">
                Observe pensamentos passando com fluidez pelas águas, sem precisar afastá-los ou julgá-los.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6B6B63] pt-1">
              <Clock className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>Duração sugerida: 2–5 min (ou observação livre)</span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#D8CFBE] flex items-center justify-between">
            <span className="text-xs text-[#6B6B63] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
              Efêmero em memória
            </span>

            <button
              type="button"
              onClick={() => onOpenResource('rio-dos-pensamentos')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[14px] bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Entrar no rio</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
