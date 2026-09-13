/**
 * ListeningSetup - Tela Preparatória e Escolha de Modo
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios:
 * - Abertura "Escutar, com curiosidade."
 * - Apoio sem patologização nem promessa clínica.
 * - Consentimento explícito para áudio ("Ativar áudio").
 * - Opção acessível: "Explorar descrições, sem áudio".
 * - Sem autoplay, câmera ou microfone.
 */

import React, { useState } from 'react';
import { Headphones, Volume2, Compass, HelpCircle, FileText, Info, Play, Check } from 'lucide-react';
import { ResourceMode } from '../types';

interface ListeningSetupProps {
  onStartExperience: (mode: ResourceMode, useAudio: boolean) => void;
  audioEngineType: 'hrtf' | 'stereo' | 'none';
}

export const ListeningSetup: React.FC<ListeningSetupProps> = ({
  onStartExperience,
  audioEngineType,
}) => {
  const [selectedMode, setSelectedMode] = useState<ResourceMode>('guided');
  const [usingHeadphones, setUsingHeadphones] = useState(true);

  return (
    <div id="listening-setup-screen" className="max-w-3xl mx-auto w-full py-4 sm:py-6 space-y-6">
      {/* Bloco de Abertura Confluência */}
      <div className="text-left space-y-2">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Escuta & Confluência
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[#005A1F] leading-snug">
          Escutar, com curiosidade.
        </h2>
        <p className="text-base sm:text-lg text-[#262B22] leading-relaxed max-w-2xl">
          Observe direção, distância e textura. Sua percepção não precisa corresponder a uma resposta certa.
        </p>
      </div>

      {/* Aviso Ético e Clínico Mandatório */}
      <div
        id="clinical-boundary-disclaimer"
        className="p-4 rounded-2xl bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-3"
        role="note"
      >
        <Info className="w-5 h-5 text-[#96551F] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed space-y-1">
          <p className="font-medium text-[#262B22]">
            Isto não é audiometria, treinamento clínico ou avaliação de audição.
          </p>
          <p>
            Nunca deduzimos capacidade ou dificuldade auditiva a partir das suas respostas. Esta é uma prática aberta de atenção ao ambiente sonoro.
          </p>
        </div>
      </div>

      {/* Escolha de Modo */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#005A1F]">
          Como você deseja experimentar agora?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Modo Guiado */}
          <button
            type="button"
            id="mode-card-guided"
            onClick={() => setSelectedMode('guided')}
            className={`p-5 rounded-3xl border-2 text-left transition-all touch-target-min ${
              selectedMode === 'guided'
                ? 'bg-[#F1E9DB] border-[#005A1F]'
                : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#96551F]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-[#FDFAF4] border border-[#D8CFBE] flex items-center justify-center text-[#005A1F]">
                <HelpCircle className="w-5 h-5 text-[#005A1F]" strokeWidth={2} />
              </span>
              {selectedMode === 'guided' && (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#005A1F] bg-[#FDFAF4] px-2.5 py-1 rounded-full border border-[#005A1F]">
                  <Check className="w-3.5 h-3.5" /> Selecionado
                </span>
              )}
            </div>
            <h3 className="font-heading text-lg font-semibold text-[#005A1F] mb-1">
              Escuta Guiada
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
              Ouça uma cena sonora preparada, observe sua percepção e depois descubra como o som foi posicionado.
            </p>
            <div className="mt-3 text-xs text-[#96551F] font-medium">
              4 cenas • ~3 minutos
            </div>
          </button>

          {/* Card Modo Livre */}
          <button
            type="button"
            id="mode-card-free"
            onClick={() => setSelectedMode('free')}
            className={`p-5 rounded-3xl border-2 text-left transition-all touch-target-min ${
              selectedMode === 'free'
                ? 'bg-[#F1E9DB] border-[#005A1F]'
                : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#96551F]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-[#FDFAF4] border border-[#D8CFBE] flex items-center justify-center text-[#96551F]">
                <Compass className="w-5 h-5 text-[#96551F]" strokeWidth={2} />
              </span>
              {selectedMode === 'free' && (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#005A1F] bg-[#FDFAF4] px-2.5 py-1 rounded-full border border-[#005A1F]">
                  <Check className="w-3.5 h-3.5" /> Selecionado
                </span>
              )}
            </div>
            <h3 className="font-heading text-lg font-semibold text-[#005A1F] mb-1">
              Exploração Livre
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
              Escolha livremente um elemento natural (água, vento, chuva, pássaro) e mova a posição no campo auditivo.
            </p>
            <div className="mt-3 text-xs text-[#96551F] font-medium">
              Palco interativo • No seu ritmo
            </div>
          </button>
        </div>
      </div>

      {/* Orientações acústicas e fones */}
      <div className="p-5 rounded-3xl bg-[#F1E9DB] border-2 border-[#D8CFBE] space-y-3">
        <div className="flex items-start gap-3">
          <Headphones className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
          <div className="text-xs sm:text-sm text-[#262B22] leading-relaxed">
            <p className="font-semibold text-[#005A1F] mb-1">
              Recomendação de escuta
            </p>
            <p className="text-[#4B4B49] mb-2">
              Fones de ouvido podem tornar a direção mais perceptível. Você também pode usar os alto-falantes do dispositivo normalmente.
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#262B22]">
              <input
                type="checkbox"
                checked={usingHeadphones}
                onChange={(e) => setUsingHeadphones(e.target.checked)}
                className="w-4 h-4 text-[#005A1F] rounded border-[#D8CFBE] focus:ring-[#005A1F]"
              />
              <span>Estou utilizando fones de ouvido</span>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-[#D8CFBE] flex items-center gap-2 text-xs text-[#6B6B63]">
          <Volume2 className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
          <span>
            Comece com volume baixo e ajuste para ficar confortável. Sem ruídos súbitos ou amplificação desmedida.
          </span>
        </div>

        {audioEngineType === 'stereo' && (
          <p className="text-xs text-[#96551F] bg-[#FDFAF4] p-2 rounded-xl border border-[#D8CFBE]">
            Nota técnica: Seu navegador está operando em modo estéreo bidirecional (esquerda/direita). A percepção frente/trás será simulada em espectro atenuado.
          </p>
        )}
      </div>

      {/* Botões de Ação Principal */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Opção acessível: Modo textual sem áudio */}
        <button
          type="button"
          id="btn-start-text-mode"
          onClick={() => onStartExperience('text', false)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium text-[#4B4B49] transition-colors touch-target-min"
          aria-label="Explorar descrições das cenas sem reproduzir áudio"
        >
          <FileText className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
          <span>Explorar descrições, sem áudio</span>
        </button>

        {/* Botão explícito "Ativar áudio" */}
        <button
          type="button"
          id="btn-activate-audio-start"
          onClick={() => onStartExperience(selectedMode, true)}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] text-sm sm:text-base font-semibold transition-colors shadow-none touch-target-min"
          aria-label="Ativar áudio e iniciar exploração dos sons"
        >
          <Volume2 className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2} />
          <span>Ativar áudio e começar</span>
        </button>
      </div>
    </div>
  );
};
