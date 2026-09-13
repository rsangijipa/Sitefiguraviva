/**
 * @license
 * Instituto Figura Viva - Catálogo de Recursos Interativos (Registro Confluência)
 * Apresentação dos recursos: Sala de Pausa e Rio dos Pensamentos.
 * Cada card: ícone linear 24px, nome, descrição 1-2 linhas, duração aproximada, categoria, CTA textual.
 */

import React from 'react';
import { Clock, Waves, Compass, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ResourceCatalogProps {
  onOpenPauseRoom: () => void;
  onOpenRiver: () => void;
}

export const ResourceCatalog: React.FC<ResourceCatalogProps> = ({
  onOpenPauseRoom,
  onOpenRiver,
}) => {
  return (
    <div id="resource-catalog-section" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Abertura Editorial do Catálogo */}
      <div className="mb-8 sm:mb-10 text-left max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider text-[#96551F] font-bold">
            Registro Confluência • Práticas Breves
          </span>
          <div className="w-8 h-1 confluencia-accent-line" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#005A1F] font-bold leading-tight">
          Recursos Interativos
        </h2>
        <p className="text-sm sm:text-base text-[#4B4B49] mt-2 font-sans leading-relaxed">
          Espaços integrados para pausas voluntárias, regulação atenta e observação de pensamentos no seu próprio ritmo. Sem metas clínicas ou cobrança de desempenho.
        </p>
      </div>

      {/* Grade de Recursos Confluência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* CARD 1: SALA DE PAUSA */}
        <article
          id="card-sala-de-pausa"
          className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between transition-all hover:bg-[#F1E9DB]/30"
        >
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
                <Clock className="w-6 h-6 text-[#005A1F]" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-[#96551F] bg-[#F1E9DB] px-3 py-1 rounded-full border border-[#D8CFBE]">
                Presença & Regulação
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#005A1F]">
              Sala de Pausa
            </h3>
            <p className="text-sm sm:text-base text-[#262B22] font-semibold mt-1">
              Alguns minutos no seu ritmo.
            </p>
            <p className="text-xs sm:text-sm text-[#4B4B49] mt-2 leading-relaxed">
              Hub de pausas opcionais com cinco entradas guiadas: Respirar, Observar, Ouvir, Movimentar e Desacelerar.
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-[#6B6B63]">
              <span className="flex items-center gap-1">
                <strong className="text-[#005A1F]">2 a 5 minutos</strong>
              </span>
              <span>•</span>
              <span>5 modalidades</span>
              <span>•</span>
              <span>Sem cobrança</span>
            </div>
          </div>

          {/* CTA "Entrar na sala" */}
          <div className="mt-6 pt-4 border-t border-[#D8CFBE]">
            <button
              id="btn-enter-sala-de-pausa"
              type="button"
              onClick={onOpenPauseRoom}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors font-medium text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <span>Entrar na sala</span>
              <ArrowRight className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            </button>
          </div>
        </article>

        {/* CARD 2: RIO DOS PENSAMENTOS */}
        <article
          id="card-rio-dos-pensamentos"
          className="bg-[#FDFAF4] border-2 border-[#07614C] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between transition-all hover:bg-[#F1E9DB]/30"
        >
          <div>
            {/* Cabeçalho do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#07614C] flex items-center justify-center text-[#07614C]">
                <Waves className="w-6 h-6 text-[#07614C]" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-[#96551F] bg-[#F1E9DB] px-3 py-1 rounded-full border border-[#D8CFBE]">
                Desaceleração & Atenção
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#07614C]">
              Rio dos Pensamentos
            </h3>
            <p className="text-sm sm:text-base text-[#262B22] font-semibold mt-1">
              Observe o fluxo dos pensamentos sem reter.
            </p>
            <p className="text-xs sm:text-sm text-[#4B4B49] mt-2 leading-relaxed">
              Prática interativa com águas serenas e fluxo reativo em tempo real para acolher e deixar ir sensações e palavras.
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-[#6B6B63]">
              <span className="flex items-center gap-1">
                <strong className="text-[#07614C]">3 a 7 minutos</strong>
              </span>
              <span>•</span>
              <span>Fluxo reativo</span>
              <span>•</span>
              <span>Acessível em texto</span>
            </div>
          </div>

          {/* CTA "Explorar" */}
          <div className="mt-6 pt-4 border-t border-[#D8CFBE]">
            <button
              id="btn-enter-rio-dos-pensamentos"
              type="button"
              onClick={onOpenRiver}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#07614C] text-[#FDFAF4] hover:bg-[#005A1F] transition-colors font-medium text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#07614C]"
            >
              <span>Explorar</span>
              <ArrowRight className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            </button>
          </div>
        </article>
      </div>

      {/* Faixa de Esclarecimento de Privacidade e Princípios */}
      <div className="mt-10 p-5 rounded-[24px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#005A1F] shrink-0" strokeWidth={2} />
          <div>
            <h4 className="font-serif font-bold text-sm text-[#005A1F]">
              Princípio de Autonomia e Experiência Subjetiva
            </h4>
            <p className="text-xs text-[#4B4B49] mt-0.5">
              Estes recursos não geram diagnósticos nem atribuem pontuações de desempenho. O salvamento no histórico é sempre voluntário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
