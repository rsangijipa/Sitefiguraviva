/**
 * @license
 * Instituto Figura Viva - Palco Visual do Rio dos Pensamentos (Registro Confluência)
 * Representação de águas serenas onde pensamentos flutuam em folhas e seixos.
 */

import React from 'react';
import { FloatingThought } from '../../../types';
import { RiverWaterRipple } from './RiverStreamEngine';
import { Leaf, CircleDot, Sparkles, X } from 'lucide-react';

interface RiverVisualStageProps {
  thoughts: FloatingThought[];
  ripples: RiverWaterRipple[];
  onDissolveThought: (id: string) => void;
  reducedMotion: boolean;
}

export const RiverVisualStage: React.FC<RiverVisualStageProps> = ({
  thoughts,
  ripples,
  onDissolveThought,
  reducedMotion,
}) => {
  return (
    <div 
      id="river-visual-stage"
      className="w-full h-[360px] sm:h-[440px] rounded-[24px] border-2 border-[#07614C] relative overflow-hidden bg-gradient-to-b from-[#F1E9DB] via-[#FDFAF4] to-[#F1E9DB] flex flex-col justify-between"
      role="img"
      aria-label="Rio calmo com pensamentos flutuando sobre folhas de água"
    >
      {/* Margens e correntezas orgânicas do Igarapé */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M 0 0 Q 30 50 10 100 L 0 100 Z" fill="#07614C" />
          <path d="M 100 0 Q 70 50 90 100 L 100 100 Z" fill="#07614C" />
          {/* Linhas de correnteza */}
          <line x1="35" y1="0" x2="32" y2="100" stroke="#005A1F" strokeWidth="0.3" strokeDasharray="2 4" />
          <line x1="50" y1="0" x2="52" y2="100" stroke="#005A1F" strokeWidth="0.4" strokeDasharray="3 6" />
          <line x1="65" y1="0" x2="68" y2="100" stroke="#005A1F" strokeWidth="0.3" strokeDasharray="2 5" />
        </svg>
      </div>

      {/* Ondulações hídricas reativas */}
      {!reducedMotion && ripples.map(rip => (
        <div
          key={rip.id}
          className="absolute rounded-full border border-[#07614C] pointer-events-none transition-all duration-75"
          style={{
            left: `${rip.x}%`,
            top: `${rip.y}%`,
            width: `${rip.radius * 2}px`,
            height: `${rip.radius * 2}px`,
            transform: 'translate(-50%, -50%)',
            opacity: rip.opacity,
          }}
        />
      ))}

      {/* Pensamentos flutuando na correnteza */}
      <div className="relative w-full h-full overflow-hidden">
        {thoughts.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#6B6B63]">
            <Sparkles className="w-8 h-8 text-[#005A1F] opacity-50 mb-2" />
            <p className="font-serif text-base text-[#005A1F]">
              As águas estão calmas e desobstruídas.
            </p>
            <p className="text-xs text-[#6B6B63] mt-1 max-w-xs">
              Escreva abaixo qualquer pensamento ou sensação para observá-lo passar pelo rio.
            </p>
          </div>
        ) : (
          thoughts.map(thought => {
            // Estilização conforme o tom da folha / seixo
            let badgeBg = 'bg-[#FDFAF4] border-[#005A1F] text-[#005A1F]';
            if (thought.colorTone === 'folha') {
              badgeBg = 'bg-[#F1E9DB] border-[#07614C] text-[#07614C]';
            } else if (thought.colorTone === 'seixo') {
              badgeBg = 'bg-[#FDFAF4] border-[#96551F] text-[#96551F]';
            }

            return (
              <div
                key={thought.id}
                className="absolute transition-transform select-none"
                style={{
                  left: `${thought.positionX}%`,
                  top: `${thought.positionY}%`,
                  transform: `translate(-50%, -50%) rotate(${reducedMotion ? 0 : thought.rotation}deg)`,
                  maxWidth: '220px',
                }}
              >
                <div 
                  className={`group px-3 py-2 rounded-2xl border-2 shadow-none flex items-center gap-2 ${badgeBg} hover:scale-105 transition-all cursor-pointer`}
                  onClick={() => onDissolveThought(thought.id)}
                  title="Toque para dissolver este pensamento nas águas"
                >
                  <Leaf className="w-4 h-4 shrink-0 opacity-80" strokeWidth={2} />
                  <span className="text-xs sm:text-sm font-medium leading-tight break-words line-clamp-2">
                    {thought.text}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDissolveThought(thought.id);
                    }}
                    className="p-1 rounded-full hover:bg-[#262B22]/10 text-inherit opacity-60 group-hover:opacity-100 transition-opacity"
                    aria-label={`Soltar pensamento: ${thought.text}`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé discreto indicando o fluxo */}
      <div className="relative z-10 w-full px-4 py-2 border-t border-[#D8CFBE]/60 bg-[#FDFAF4]/70 flex items-center justify-between text-[11px] text-[#6B6B63]">
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
          <span>Foz da Confluência</span>
        </div>
        <span>Os pensamentos se dissolvem ao final do curso</span>
      </div>
    </div>
  );
};
