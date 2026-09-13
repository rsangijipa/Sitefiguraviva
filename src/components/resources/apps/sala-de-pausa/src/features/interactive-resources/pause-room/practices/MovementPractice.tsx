/**
 * @license
 * Instituto Figura Viva - Prática: Movimentar (Registro Confluência)
 * "Se for confortável, experimente um pequeno movimento das mãos ou dos ombros. Você pode permanecer imóvel e apenas observar."
 * Opções: sentado / em pé / sem movimento.
 * Sem exigência de flexibilidade, sem julgamento somático ou prescrição clínica.
 */

import React, { useState } from 'react';
import { User, Armchair, PauseCircle, Sparkles } from 'lucide-react';

export const MovementPractice: React.FC = () => {
  const [postureMode, setPostureMode] = useState<'sentado' | 'em_pe' | 'sem_movimento'>('sentado');
  const [motionFocus, setMotionFocus] = useState<'maos' | 'ombros' | 'repouso'>('maos');

  return (
    <div 
      id="practice-movement"
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mb-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Presença Corporal
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          Pequeno movimento ou repouso consciente
        </h2>
        <p className="text-sm text-[#4B4B49] mt-2 font-sans">
          Se for confortável, experimente um pequeno movimento das mãos ou dos ombros. Você pode permanecer imóvel e apenas observar.
        </p>
      </div>

      {/* Seletor de Posição do Corpo */}
      <div className="flex flex-wrap justify-center gap-2.5 my-3">
        <button
          id="btn-posture-seated"
          type="button"
          onClick={() => setPostureMode('sentado')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
            postureMode === 'sentado'
              ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
              : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          <Armchair className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          <span>Sentado(a)</span>
        </button>

        <button
          id="btn-posture-standing"
          type="button"
          onClick={() => setPostureMode('em_pe')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
            postureMode === 'em_pe'
              ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
              : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          <User className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          <span>Em pé</span>
        </button>

        <button
          id="btn-posture-still"
          type="button"
          onClick={() => {
            setPostureMode('sem_movimento');
            setMotionFocus('repouso');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 transition-all min-h-[44px] text-xs font-medium ${
            postureMode === 'sem_movimento'
              ? 'bg-[#F1E9DB] border-[#96551F] text-[#96551F]'
              : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          <PauseCircle className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
          <span>Sem movimento (apenas repouso)</span>
        </button>
      </div>

      {/* Cartão de apoio com convite amigável */}
      <div className="w-full max-w-md bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-7 my-3 text-left">
        {postureMode === 'sem_movimento' ? (
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDFAF4] border-2 border-[#96551F] flex items-center justify-center mx-auto text-[#96551F]">
              <Sparkles className="w-6 h-6 text-[#96551F]" strokeWidth={2} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#005A1F]">
              Permanecer imóvel e observar
            </h3>
            <p className="text-sm text-[#4B4B49] leading-relaxed">
              Não é preciso mover nada. Apenas sinta o corpo apoiado onde você está agora. O contato com a cadeira, com a cama ou com o chão sustenta você.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center border-b border-[#D8CFBE] pb-3">
              <button
                type="button"
                onClick={() => setMotionFocus('maos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors ${
                  motionFocus === 'maos'
                    ? 'bg-[#005A1F] text-[#FDFAF4]'
                    : 'bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#D8CFBE]'
                }`}
              >
                Mãos e punhos
              </button>
              <button
                type="button"
                onClick={() => setMotionFocus('ombros')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium min-h-[44px] transition-colors ${
                  motionFocus === 'ombros'
                    ? 'bg-[#005A1F] text-[#FDFAF4]'
                    : 'bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#D8CFBE]'
                }`}
              >
                Ombros e pescoço
              </button>
            </div>

            {motionFocus === 'maos' ? (
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-serif font-semibold text-base text-[#005A1F]">
                  Soltura das mãos
                </h4>
                <p className="text-sm text-[#4B4B49] leading-relaxed">
                  Abra e feche os dedos devagar, sem apertar. Se preferir, apenas repouse as mãos sobre o colo e perceba a temperatura das palmas.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-serif font-semibold text-base text-[#005A1F]">
                  Alívio dos ombros
                </h4>
                <p className="text-sm text-[#4B4B49] leading-relaxed">
                  Eleve suavemente os ombros em direção às orelhas e deixe-os descer devagar, sentindo a gravidade fazer o trabalho.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
