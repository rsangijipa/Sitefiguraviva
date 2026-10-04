/**
 * @license
 * Instituto Figura Viva - Prática: Desacelerar (Registro Confluência)
 * "Por alguns instantes, deixe uma tarefa de lado e perceba o apoio sob você."
 * Palco estável com texto breve, opção de reduzir estímulos visuais.
 */

import React, { useState } from 'react';
import { EyeOff, Eye, Anchor } from 'lucide-react';

export const SlowingPractice: React.FC = () => {
  const [minimalStimuli, setMinimalStimuli] = useState<boolean>(false);

  return (
    <div 
      id="practice-slowing"
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mb-6 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Atenção e Pouso
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          Por alguns instantes, deixe uma tarefa de lado e perceba o apoio sob você.
        </h2>
      </div>

      {/* Palco central estável */}
      <div className="w-full max-w-md bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-8 my-3 transition-colors">
        {minimalStimuli ? (
          /* Modo mínimo: apenas um ponto de ancoragem neutro */
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-[#005A1F] opacity-70 mb-4" />
            <p className="font-serif text-sm text-[#005A1F]">
              Apoio presente. Nada a resolver agora.
            </p>
          </div>
        ) : (
          /* Modo guiado padrão */
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDFAF4] border-2 border-[#005A1F] flex items-center justify-center mx-auto text-[#005A1F]">
              <Anchor className="w-7 h-7 text-[#005A1F]" strokeWidth={2} />
            </div>
            <p className="text-sm sm:text-base text-[#262B22] leading-relaxed">
              Sinta a solidez do solo ou da cadeira sustentando o peso do seu corpo.
            </p>
            <p className="text-xs sm:text-sm text-[#6B6B63] leading-normal">
              Você não precisa segurar nada pelos próximos minutos. A gravidade faz o apoio por você.
            </p>
          </div>
        )}
      </div>

      {/* Alternância para reduzir estímulos visuais */}
      <div className="mt-3">
        <button
          id="btn-toggle-minimal-stimuli"
          type="button"
          onClick={() => setMinimalStimuli(!minimalStimuli)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#4B4B49] bg-[#FDFAF4] border border-[#D8CFBE] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          {minimalStimuli ? (
            <>
              <Eye className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
              <span>Mostrar texto completo de apoio</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
              <span>Reduzir estímulos visuais (foco neutro)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
