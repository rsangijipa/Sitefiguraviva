import React from 'react';
import { BotanicalShape } from './BotanicalShapes';
import { ThoughtLeaf } from '../types';
import { Check, Sparkles, Wind, BookmarkCheck } from 'lucide-react';

interface JardimCanvasProps {
  leaves: ThoughtLeaf[];
  selectedLeafId: string | null;
  onSelectLeaf: (leaf: ThoughtLeaf) => void;
  isReducedMotion?: boolean;
}

export function JardimCanvas({
  leaves,
  selectedLeafId,
  onSelectLeaf,
  isReducedMotion = false,
}: JardimCanvasProps) {
  return (
    <div
      id="jardim-canvas-container"
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-[20px] bg-[#FDFAF4] overflow-hidden select-none border-2 border-[#D8CFBE]"
      aria-label="Campo botânico do Jardim de Pensamentos"
    >
      {/* CAMADAS DE PROFUNDIDADE EM AREIA E CREME (Jardim Abstrato) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gradient-areia-creme" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFAF4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F1E9DB" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="gradient-confluencia-water" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#07614C" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#005A1F" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#01C94D" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Camada de fundo: Horizonte suave Areia */}
        <path
          d="M0,180 C320,130 680,240 1000,160 L1000,600 L0,600 Z"
          fill="url(#gradient-areia-creme)"
        />

        {/* Curso de água / Confluência sutil */}
        <path
          d="M0,320 C280,270 420,380 650,330 C820,290 920,350 1000,320 L1000,440 C850,470 680,410 460,450 C240,490 120,430 0,470 Z"
          fill="url(#gradient-confluencia-water)"
        />

        {/* Camada frontal em Areia com contorno fino */}
        <path
          d="M0,450 C300,420 620,490 1000,430 L1000,600 L0,600 Z"
          fill="#F1E9DB"
          fillOpacity="0.85"
          stroke="#D8CFBE"
          strokeWidth="1.5"
        />

        {/* Linhas botânicas de fundo (hastes e relva abstrata) */}
        <g stroke="#6B6B63" strokeWidth="1.2" strokeOpacity="0.35" fill="none">
          {/* Reeds à esquerda */}
          <path d="M80,480 Q90,390 85,340 M85,480 Q105,370 115,310 M95,485 Q80,380 70,330" />
          {/* Reeds ao centro */}
          <path d="M480,470 Q470,380 478,310 M490,475 Q515,360 520,290 M500,480 Q485,390 465,330" />
          {/* Reeds à direita */}
          <path d="M880,460 Q865,370 870,300 M895,465 Q925,350 940,280 M910,470 Q890,385 885,320" />
        </g>
      </svg>

      {/* ESTADO VAZIO: Quando não há pensamentos no campo */}
      {leaves.length === 0 && (
        <div
          id="jardim-empty-state"
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none"
        >
          <div className="w-16 h-16 rounded-[24px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-center justify-center mb-3">
            <Wind className="w-8 h-8 stroke-2 text-[#005A1F]" />
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#262B22]">
            O solo do jardim está em repouso
          </h2>
          <p className="text-sm text-[#4B4B49] max-w-md mt-1 leading-relaxed">
            Escreva uma frase curta no campo abaixo. Ela surgirá aqui como uma forma botânica
            para que você possa observá-la sem pressa, sem julgá-la e sem obrigá-la a desaparecer.
          </p>
        </div>
      )}

      {/* ELEMENTOS BOTÂNICOS / PENSAMENTOS FLUTUANTES NO CAMPO */}
      {leaves.map((leaf) => {
        const isSelected = leaf.id === selectedLeafId;
        const isSaved = leaf.isSaved;
        const isApproached = leaf.action === 'aproximar';
        const isDistant = leaf.action === 'afastar';
        const isReleased = leaf.action === 'soltar';

        // Dynamic scale & styling based on desfusion action
        let currentScale = leaf.scale;
        let currentOpacity = leaf.opacity;
        if (isApproached) {
          currentScale = 1.35;
          currentOpacity = 1;
        } else if (isDistant) {
          currentScale = 0.72;
          currentOpacity = 0.6;
        } else if (isReleased) {
          currentScale = 0.6;
          currentOpacity = 0.35;
        }

        return (
          <button
            key={leaf.id}
            id={`leaf-node-${leaf.id}`}
            onClick={() => onSelectLeaf(leaf)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectLeaf(leaf);
              }
            }}
            aria-label={`Pensamento: "${leaf.text}". Ação atual: ${leaf.action}. Clique para focar escolhas.`}
            tabIndex={0}
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              transform: `translate(-50%, -50%) rotate(${leaf.rotation}deg) scale(${currentScale})`,
              opacity: currentOpacity,
            }}
            className={`absolute group cursor-pointer focus:outline-none transition-all ${
              isReducedMotion ? 'duration-150' : 'duration-500 ease-out'
            } ${
              isSelected
                ? 'z-30 filter drop-shadow-none'
                : 'z-20 hover:opacity-100 hover:scale-105'
            }`}
          >
            <div className="relative flex flex-col items-center">
              {/* Forma Botânica Abstrata */}
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 p-1 rounded-full transition-all ${
                  isSelected
                    ? 'ring-2 ring-[#005A1F] bg-[#FDFAF4]/90'
                    : 'group-hover:ring-1 group-hover:ring-[#07614C]'
                }`}
              >
                <BotanicalShape
                  form={leaf.botanicalForm}
                  isSelected={isSelected}
                  scale={1}
                  actionState={leaf.action}
                />
              </div>

              {/* Rótulo Contemplativo da Frase */}
              <div
                className={`mt-1 max-w-[220px] px-3 py-1.5 rounded-[16px] text-xs font-medium text-left transition-all ${
                  isSelected
                    ? 'bg-[#FDFAF4] border-2 border-[#005A1F] text-[#262B22] font-semibold'
                    : 'bg-[#FDFAF4]/85 border-2 border-[#D8CFBE] text-[#4B4B49] group-hover:border-[#07614C]'
                }`}
              >
                <p className="line-clamp-2 leading-tight">{leaf.text}</p>

                {/* Badges de Ação Selecionada */}
                <div className="mt-1 flex items-center gap-1.5 pt-0.5 border-t border-[#D8CFBE]/60 text-[10px] text-[#6B6B63]">
                  {leaf.action === 'deixar-aqui' && (
                    <span className="text-[#07614C] font-semibold">Repousando aqui</span>
                  )}
                  {leaf.action === 'aproximar' && (
                    <span className="text-[#005A1F] font-semibold">Em foco atento</span>
                  )}
                  {leaf.action === 'afastar' && (
                    <span className="text-[#6B6B63]">Na paisagem ampla</span>
                  )}
                  {leaf.action === 'guardar' && (
                    <span className="inline-flex items-center gap-0.5 text-[#96551F] font-semibold">
                      <BookmarkCheck className="w-3 h-3 stroke-2 text-[#96551F]" />
                      Guardado no caderno
                    </span>
                  )}
                  {leaf.action === 'soltar' && (
                    <span className="text-[#96551F] italic">Dissolvendo com a brisa</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
