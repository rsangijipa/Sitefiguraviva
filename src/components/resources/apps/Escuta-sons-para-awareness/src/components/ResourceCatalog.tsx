/**
 * ResourceCatalog - Catálogo de Recursos Interativos
 * Instituto Figura Viva - Registro Confluência
 *
 * Padrão obrigatório do card:
 * - Ícone linear (stroke 2px, 24px, Verde Raiz ou Terra Barro, sem preenchimento)
 * - Nome
 * - Descrição de 1–2 linhas
 * - Duração aproximada quando aplicável
 * - Categoria
 * - CTA "Explorar sons"
 * - Sem badges excessivos
 * - Radius 24px, linhas 2px, sem drop-shadow
 */

import React from 'react';
import { Volume2, Activity, Wind, Sparkles, ArrowRight, Clock } from 'lucide-react';

interface ResourceCatalogProps {
  onOpenAwarenessSounds: () => void;
}

export const ResourceCatalog: React.FC<ResourceCatalogProps> = ({
  onOpenAwarenessSounds,
}) => {
  return (
    <div id="resource-catalog-page" className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Cabeçalho de Boas-Vindas */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Portal do Aluno • Recursos Interativos
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#005A1F] tracking-tight">
          Práticas e Explorações
        </h1>
        <p className="text-base sm:text-lg text-[#4B4B49] max-w-2xl leading-relaxed">
          Experiências sensoriais e somáticas no registro Confluência. Cada recurso respeita sua autonomia e não transforma reflexão em pontuação clínica.
        </p>
      </div>

      {/* Grade de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD PRINCIPAL: Sons para Awareness */}
        <div
          id="card-resource-awareness-sounds"
          className="p-6 rounded-[24px] border-2 border-[#005A1F] bg-[#FDFAF4] flex flex-col justify-between transition-all relative"
        >
          {/* Fita superior discreta com acento Confluência */}
          <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-[#FE538B] via-[#FED701] to-[#01C94D] rounded-full" />

          <div>
            <div className="flex items-center justify-between mb-4 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-[#005A1F]" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE]">
                Escuta & Confluência
              </span>
            </div>

            <h2 className="font-heading text-xl font-bold text-[#005A1F] mb-2">
              Sons para Awareness
            </h2>

            <p className="text-sm text-[#4B4B49] leading-relaxed mb-4">
              Perceba de onde vem um som e como ele se apresenta no espaço auditivo.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-[#D8CFBE] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] font-medium">
              <Clock className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>2–5 min</span>
            </div>

            <button
              id="btn-explore-awareness-sounds"
              onClick={onOpenAwarenessSounds}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] text-xs sm:text-sm font-semibold transition-colors touch-target-min"
              aria-label="Explorar sons: abrir microapp Sons para Awareness"
            >
              <span>Explorar sons</span>
              <ArrowRight className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* CARD SECUNDÁRIO DA GRADE: Mapeamento Somático */}
        <div
          id="card-resource-soma-map"
          className="p-6 rounded-[24px] border-2 border-[#D8CFBE] bg-[#FDFAF4] flex flex-col justify-between opacity-85"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#96551F]" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE]">
                Corpo & Confluência
              </span>
            </div>

            <h2 className="font-heading text-xl font-bold text-[#005A1F] mb-2">
              Mapeamento Somático
            </h2>

            <p className="text-sm text-[#4B4B49] leading-relaxed mb-4">
              Atenção guiada às regiões do corpo e às sensações presentes no momento.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-[#D8CFBE] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] font-medium">
              <Clock className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>3–7 min</span>
            </div>

            <button
              disabled
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#D8CFBE] text-xs font-medium text-[#6B6B63] cursor-not-allowed"
            >
              <span>Em atualização</span>
            </button>
          </div>
        </div>

        {/* CARD SECUNDÁRIO DA GRADE: Pausa do Fôlego */}
        <div
          id="card-resource-breath"
          className="p-6 rounded-[24px] border-2 border-[#D8CFBE] bg-[#FDFAF4] flex flex-col justify-between opacity-85"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#07614C] flex items-center justify-center">
                <Wind className="w-6 h-6 text-[#07614C]" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE]">
                Respiração
              </span>
            </div>

            <h2 className="font-heading text-xl font-bold text-[#005A1F] mb-2">
              Pausa de Transição
            </h2>

            <p className="text-sm text-[#4B4B49] leading-relaxed mb-4">
              Ritmo respiratório natural sem metas de contagem ou imposição de padrão.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-[#D8CFBE] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] font-medium">
              <Clock className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
              <span>2–4 min</span>
            </div>

            <button
              disabled
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#D8CFBE] text-xs font-medium text-[#6B6B63] cursor-not-allowed"
            >
              <span>Em atualização</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
