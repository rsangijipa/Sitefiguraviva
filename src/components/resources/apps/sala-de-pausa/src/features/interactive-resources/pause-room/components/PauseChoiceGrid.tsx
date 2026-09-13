/**
 * @license
 * Instituto Figura Viva - PauseChoiceGrid (Registro Confluência)
 * Desktop: Grade de 3 cards na primeira linha e 2 na segunda.
 * Mobile: Lista de 5 cards em coluna.
 * Abertura: "Que tipo de pausa cabe agora?"
 * Apoio: "Escolha uma possibilidade. Você pode adaptar, trocar ou encerrar quando quiser."
 */

import React from 'react';
import { PausePracticeConfig, PausePracticeId } from '../../../../types';
import { Wind, Eye, Headphones, Activity, Coffee, ArrowRight } from 'lucide-react';

interface PauseChoiceGridProps {
  practices: PausePracticeConfig[];
  selectedPracticeId: PausePracticeId;
  onSelectPractice: (practiceId: PausePracticeId) => void;
}

const getPracticeIcon = (id: PausePracticeId) => {
  switch (id) {
    case 'breathing':
      return Wind;
    case 'observing':
      return Eye;
    case 'listening':
      return Headphones;
    case 'movement':
      return Activity;
    case 'slowing':
      return Coffee;
  }
};

export const PauseChoiceGrid: React.FC<PauseChoiceGridProps> = ({
  practices,
  selectedPracticeId,
  onSelectPractice,
}) => {
  // Separa 3 na primeira linha e 2 na segunda no layout de desktop
  const row1 = practices.slice(0, 3);
  const row2 = practices.slice(3, 5);

  const renderPracticeCard = (practice: PausePracticeConfig) => {
    const isSelected = selectedPracticeId === practice.id;
    const Icon = getPracticeIcon(practice.id);

    return (
      <button
        key={practice.id}
        id={`card-practice-${practice.id}`}
        type="button"
        onClick={() => onSelectPractice(practice.id)}
        className={`group relative text-left p-5 sm:p-6 rounded-[24px] border-2 transition-all min-h-[110px] sm:min-h-[140px] flex flex-col justify-between ${
          isSelected
            ? 'bg-[#F1E9DB] border-[#005A1F] ring-2 ring-[#005A1F]'
            : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#005A1F] hover:bg-[#F1E9DB]/50'
        } focus:outline-none focus:ring-2 focus:ring-[#005A1F]`}
        aria-pressed={isSelected}
      >
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'border-[#005A1F] bg-[#FDFAF4] text-[#005A1F]' 
                : 'border-[#D8CFBE] bg-[#F1E9DB] text-[#005A1F] group-hover:border-[#005A1F]'
            }`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>

            <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wider">
              {practice.id === 'breathing' && 'Ar & Corpo'}
              {practice.id === 'observing' && 'Espaço Real'}
              {practice.id === 'listening' && 'Audição'}
              {practice.id === 'movement' && 'Postura'}
              {practice.id === 'slowing' && 'Repouso'}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#005A1F] leading-tight">
            {practice.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4B4B49] mt-1.5 line-clamp-2 leading-relaxed">
            {practice.shortDescription}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between pt-2 border-t border-[#D8CFBE]/60 text-xs font-medium text-[#005A1F]">
          <span>{isSelected ? 'Prática selecionada' : 'Selecionar'}</span>
          <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-0.5'}`} strokeWidth={2} />
        </div>
      </button>
    );
  };

  return (
    <div id="pause-choice-section" className="w-full max-w-4xl mx-auto py-2">
      {/* Abertura Editorial */}
      <div className="text-center mb-6">
        {/* Acento Confluência discreto */}
        <div className="w-12 h-1 confluencia-accent-line mx-auto mb-3" aria-hidden="true" />
        <h2 className="font-serif text-2xl sm:text-4xl text-[#005A1F] font-bold leading-tight">
          Que tipo de pausa cabe agora?
        </h2>
        <p className="text-sm sm:text-base text-[#4B4B49] mt-2 max-w-lg mx-auto font-sans leading-relaxed">
          Escolha uma possibilidade. Você pode adaptar, trocar ou encerrar quando quiser.
        </p>
      </div>

      {/* Grade Desktop: 3 na primeira linha, 2 na segunda linha | Mobile: Coluna única */}
      <div className="space-y-3 sm:space-y-4">
        {/* Linha 1 (Desktop: 3 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {row1.map(renderPracticeCard)}
        </div>

        {/* Linha 2 (Desktop: 2 colunas centralizadas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {row2.map(renderPracticeCard)}
        </div>
      </div>
    </div>
  );
};
