/**
 * @license
 * Instituto Figura Viva - Prática: Observar (Registro Confluência)
 * "Encontre uma cor ao seu redor. Depois, perceba uma forma ou uma textura."
 * Etapas avançadas exclusivamente pelo usuário, sem câmera, sem contagem forçada.
 */

import React, { useState } from 'react';
import { Compass, Palette, Square, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export const ObservingPractice: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      id: 'cor',
      title: 'Uma cor presente',
      prompt: 'Olhe ao redor do seu espaço e encontre uma cor que chame sua atenção.',
      detail: 'Não precisa ser especial. Apenas note a tonalidade, a claridade ou a sombra onde ela está.',
      icon: Palette,
    },
    {
      id: 'forma',
      title: 'Uma forma ou contorno',
      prompt: 'Agora, perceba uma linha, uma curva ou o limite de algum objeto próximo.',
      detail: 'Observe onde esse objeto termina e onde o espaço ao redor começa.',
      icon: Square,
    },
    {
      id: 'textura',
      title: 'Uma textura ou luz',
      prompt: 'Encontre uma superfície e observe como ela parece ao toque ou como a luz pousa sobre ela.',
      detail: 'Pode ser a madeira de uma mesa, o tecido de uma roupa ou o brilho em uma parede.',
      icon: Sparkles,
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div 
      id="practice-observing"
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mb-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Atenção ao ambiente real
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          {step.title}
        </h2>
      </div>

      {/* Cartão de observação central */}
      <div className="w-full max-w-md bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-8 my-3 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-[#FDFAF4] border-2 border-[#005A1F] flex items-center justify-center mx-auto mb-4 text-[#005A1F]">
          <StepIcon className="w-7 h-7 text-[#005A1F]" strokeWidth={2} />
        </div>

        <p className="font-serif text-lg sm:text-xl text-[#005A1F] font-semibold leading-relaxed">
          {step.prompt}
        </p>
        <p className="text-sm text-[#4B4B49] mt-3 font-sans leading-normal">
          {step.detail}
        </p>

        {/* Indicador de etapas discreto */}
        <div className="flex justify-center items-center gap-2 mt-6" aria-label={`Passo ${currentStep + 1} de ${steps.length}`}>
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`h-2.5 rounded-full transition-all min-w-[28px] ${
                i === currentStep 
                  ? 'bg-[#005A1F] w-8' 
                  : 'bg-[#D8CFBE] w-2.5 hover:bg-[#96551F]'
              }`}
              aria-label={`Ir para etapa ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Controles de avanço voluntário pelo usuário */}
      <div className="flex items-center gap-3 mt-4">
        <button
          id="btn-observing-prev"
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border-2 border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4 text-inherit" strokeWidth={2} />
          <span>Anterior</span>
        </button>

        <button
          id="btn-observing-next"
          type="button"
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[44px]"
        >
          <span>Próxima percepção</span>
          <ChevronRight className="w-4 h-4 text-inherit" strokeWidth={2} />
        </button>
      </div>

      <p className="text-xs text-[#6B6B63] mt-4 max-w-sm">
        Você pode permanecer na mesma observação pelo tempo que for confortável.
      </p>
    </div>
  );
};
