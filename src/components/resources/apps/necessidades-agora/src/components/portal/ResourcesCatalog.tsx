/**
 * ResourcesCatalog - Catálogo do Portal do Aluno com Recursos Interativos
 * Conforme regras do Design System Figura Viva:
 * Ícone linear 24px stroke 2px, nome, descrição 1-2 linhas, duração, categoria, CTA "Explorar".
 * Sem badges excessivos, raio 24px, bordas 2px, sem drop shadows.
 */

import React from 'react';
import { Compass, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResourcesCatalogProps {
  onOpenNeedsExperience: () => void;
  onOpenNeedsHistory: () => void;
}

export const ResourcesCatalog: React.FC<ResourcesCatalogProps> = ({
  onOpenNeedsExperience,
  onOpenNeedsHistory,
}) => {
  return (
    <div
      id="portal-resources-catalog"
      className="max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8 text-left"
    >
      {/* Abertura da Seção */}
      <div className="pb-6 mb-8 border-b-2 border-[#D8CFBE]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1E9DB] text-[#96551F] mb-3 border border-[#D8CFBE]">
          <Sparkles className="w-3.5 h-3.5 stroke-2" />
          <span>Práticas e Ferramentas de Autonomia</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#005A1F] tracking-tight">
          Recursos Interativos
        </h1>
        <p className="text-sm sm:text-base text-[#4B4B49] mt-2 max-w-2xl leading-relaxed">
          Espaços de pausa, observação sensorial e escuta de si, desenhados para
          apoiar sua percepção sem gerar cobranças ou diagnósticos.
        </p>
      </div>

      {/* Grade de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Card Destaque: Necessidades Agora (Registro Confluência) */}
        <div
          id="card-resource-necessidades-agora"
          className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#005A1F] p-6 flex flex-col justify-between hover:border-[#07614C] transition-all relative overflow-hidden"
        >
          {/* Acento Confluência discreto no topo */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] gradient-confluencia-line pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#005A1F] text-[#005A1F] flex items-center justify-center">
                <Compass className="w-6 h-6 stroke-2" />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] bg-[#F1E9DB] px-2.5 py-1 rounded-full border border-[#D8CFBE]">
                <Clock className="w-3.5 h-3.5 stroke-2 text-[#96551F]" />
                <span className="font-medium text-[#262B22]">2–4 min</span>
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[#96551F] mb-1">
              Confluência
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#005A1F] mb-2 leading-snug">
              Necessidades Agora
            </h2>

            <p className="text-sm text-[#4B4B49] leading-relaxed mb-6">
              Dê lugar ao que parece mais presente agora. Uma seleção tátil e sem pressa para observar o que pede cuidado no seu momento.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#D8CFBE]/80">
            <button
              id="btn-explore-needs"
              type="button"
              onClick={onOpenNeedsExperience}
              className="w-full py-3 px-4 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Explorar necessidades</span>
              <ArrowRight className="w-4 h-4 stroke-2" />
            </button>

            <button
              id="btn-explore-history"
              type="button"
              onClick={onOpenNeedsHistory}
              className="w-full py-2 px-3 text-xs font-semibold text-[#005A1F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[40px]"
            >
              Ver meu histórico privado
            </button>
          </div>
        </div>

        {/* Card Ilustrativo do Ecossistema: Rastreio Somático (SomaScan) */}
        <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] p-6 flex flex-col justify-between opacity-85">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#D8CFBE] text-[#96551F] flex items-center justify-center">
                <Sparkles className="w-6 h-6 stroke-2" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] bg-[#F1E9DB] px-2.5 py-1 rounded-full border border-[#D8CFBE]">
                <Clock className="w-3.5 h-3.5 stroke-2 text-[#96551F]" />
                <span className="font-medium text-[#262B22]">3–5 min</span>
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[#96551F] mb-1">
              Confluência
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#005A1F] mb-2 leading-snug">
              Rastreio Somático
            </h2>

            <p className="text-sm text-[#4B4B49] leading-relaxed mb-6">
              Mapeamento corporal suave de sensações físicas, tensões e respiração no momento presente.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D8CFBE]/80">
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 rounded-full text-sm font-semibold bg-[#F1E9DB] text-[#6B6B63] cursor-not-allowed min-h-[44px] flex items-center justify-center"
            >
              Em integração
            </button>
          </div>
        </div>
      </div>

      {/* Nota de Princípio Pedagógico */}
      <div className="bg-[#F1E9DB] rounded-[24px] border-2 border-[#D8CFBE] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <ShieldCheck className="w-8 h-8 stroke-2 text-[#005A1F] shrink-0" />
        <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
          <strong className="text-[#005A1F]">Diretriz de Cuidado:</strong> Os recursos
          do Instituto Figura Viva não realizam inferências psicológicas nem
          classificações clínicas automatizadas. Todo registro de reflexão é voluntário e
          permanece sob a estrita custódia de quem o produziu.
        </div>
      </div>
    </div>
  );
};
