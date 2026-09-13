/**
 * @license
 * Instituto Figura Viva - Prática: Respirar (Registro Confluência)
 * "Perceba sua respiração como ela está. Acompanhe a forma apenas se for confortável."
 * Alternativa estática: "Observe uma respiração de cada vez".
 * Sem retenção imposta, sem contagem forçada.
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BreathingPracticeProps {
  isActive: boolean;
  isPaused: boolean;
  reducedMotion: boolean;
}

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({
  isActive,
  isPaused,
  reducedMotion,
}) => {
  const [visualMotionEnabled, setVisualMotionEnabled] = useState<boolean>(!reducedMotion);
  const [breathPhase, setBreathPhase] = useState<'inspira' | 'expira'>('inspira');

  // Sincronização com reducedMotion global
  useEffect(() => {
    if (reducedMotion) {
      setVisualMotionEnabled(false);
    }
  }, [reducedMotion]);

  // Ciclo suave de 8s (4s expansão / 4s retração) sem impor retenção
  useEffect(() => {
    if (!isActive || isPaused || !visualMotionEnabled) return;

    const interval = setInterval(() => {
      setBreathPhase(prev => (prev === 'inspira' ? 'expira' : 'inspira'));
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, visualMotionEnabled]);

  return (
    <div 
      id="practice-breathing" 
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      {/* Texto orientador principal */}
      <div className="mb-6 max-w-lg mx-auto">
        <p className="font-serif text-xl sm:text-2xl text-[#005A1F] font-semibold leading-snug">
          Perceba sua respiração como ela está.
        </p>
        <p className="text-sm sm:text-base text-[#4B4B49] mt-2 font-sans">
          Acompanhe a forma apenas se for confortável. Não há ritmo certo ou meta a atingir.
        </p>
      </div>

      {/* Palco da figura orgânica ou alternativa estática */}
      <div 
        className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-center justify-center relative overflow-hidden my-4"
        aria-hidden={visualMotionEnabled ? "false" : "true"}
      >
        {visualMotionEnabled && !reducedMotion ? (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Onda Confluência orgânica */}
            <div 
              className={`absolute rounded-full transition-transform duration-[4000ms] ease-in-out ${
                isPaused 
                  ? 'scale-100 opacity-60' 
                  : breathPhase === 'inspira' 
                    ? 'scale-125 opacity-80' 
                    : 'scale-90 opacity-40'
              }`}
              style={{
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, #07614C 0%, #005A1F 65%, #F1E9DB 100%)',
              }}
            />
            {/* Núcleo de apoio Creme */}
            <div className="relative z-10 w-28 h-28 rounded-full bg-[#FDFAF4] border-2 border-[#005A1F] flex flex-col items-center justify-center p-2 text-[#005A1F]">
              <span className="font-serif text-sm font-semibold text-center">
                {isPaused ? 'Pausado' : breathPhase === 'inspira' ? 'Expandir' : 'Soltar'}
              </span>
            </div>
          </div>
        ) : (
          /* Alternativa Estática */
          <div 
            id="breathing-static-alternative"
            className="flex flex-col items-center justify-center p-6 text-center max-w-[220px]"
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#005A1F] bg-[#FDFAF4] flex items-center justify-center mb-3">
              <div className="w-6 h-6 rounded-full bg-[#005A1F]/30" />
            </div>
            <p className="font-serif text-base text-[#005A1F] font-bold">
              Observe uma respiração de cada vez
            </p>
            <p className="text-xs text-[#6B6B63] mt-1">
              Repouso visual estável.
            </p>
          </div>
        )}
      </div>

      {/* Controle local de alternância de movimento visual */}
      <div className="mt-4">
        <button
          id="btn-toggle-breathing-motion"
          type="button"
          onClick={() => setVisualMotionEnabled(!visualMotionEnabled)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#4B4B49] bg-[#FDFAF4] border border-[#D8CFBE] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          {visualMotionEnabled ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
              <span>Usar alternativa estática (sem animação)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
              <span>Ativar expansão visual suave</span>
            </>
          )}
        </button>
      </div>

      {/* Live region para leitores de tela */}
      <div className="sr-only" aria-live="polite">
        {isActive && !isPaused ? `Prática de respiração ativa. ${breathPhase === 'inspira' ? 'Inspirando naturalmente' : 'Expirando suavemente'}` : 'Pausa em repouso'}
      </div>
    </div>
  );
};
