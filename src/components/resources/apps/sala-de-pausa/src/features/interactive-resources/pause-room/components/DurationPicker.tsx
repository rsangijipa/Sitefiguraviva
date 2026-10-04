/**
 * @license
 * Instituto Figura Viva - Seletor de Duração (Registro Confluência)
 * Opções: 2 min (120s), 3 min (180s - padrão), 5 min (300s).
 */

import React from 'react';
import { PlannedDurationSeconds } from '../../../../types';
import { Clock } from 'lucide-react';

interface DurationPickerProps {
  selectedDuration: PlannedDurationSeconds;
  onSelectDuration: (duration: PlannedDurationSeconds) => void;
  disabled?: boolean;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  selectedDuration,
  onSelectDuration,
  disabled = false,
}) => {
  const options: { value: PlannedDurationSeconds; label: string; tag: string }[] = [
    { value: 120, label: '2 min', tag: 'Breve' },
    { value: 180, label: '3 min', tag: 'Recomendado' },
    { value: 300, label: '5 min', tag: 'Aprofundado' },
    { value: 0, label: 'Sem pressa', tag: 'Modo livre' },
  ];

  return (
    <div id="duration-picker" className="w-full max-w-lg mx-auto" role="group" aria-label="Duração sugerida da pausa">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
          <span>Duração sugerida</span>
        </span>
        <span className="text-xs text-[#6B6B63]">Sem metas; encerre quando desejar</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedDuration === opt.value;
          return (
            <button
              key={opt.value}
              id={`duration-btn-${opt.value}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDuration(opt.value)}
              className={`p-3 rounded-2xl border-2 transition-all text-center min-h-[44px] flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                  : 'bg-[#FDFAF4] text-[#262B22] border-[#D8CFBE] hover:border-[#005A1F] hover:bg-[#F1E9DB]'
              } disabled:opacity-50`}
              aria-pressed={isSelected}
            >
              <span className="text-sm font-bold font-sans">{opt.label}</span>
              <span className={`text-[10px] mt-0.5 font-medium ${
                isSelected ? 'text-[#FED701]' : 'text-[#6B6B63]'
              }`}>
                {opt.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
