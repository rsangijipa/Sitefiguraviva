/**
 * SmallStepForm - Etapa Opcional: "Existe um pequeno gesto possível?"
 *
 * Textarea até 300 caracteres. Apoio: "Pode ficar em branco."
 * Exemplos editoriais apenas sob demanda voluntária ("Ver exemplos de pequenos gestos").
 * Nunca gera tarefas externas, alarmes ou prescrições clínicas.
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Feather, Sparkles } from 'lucide-react';
import { CURRENT_NEEDS_CONSTRAINTS } from '../schema';
import { NeedRecordState, NeedSelectionEntry } from '../types';

interface SmallStepFormProps {
  stateType: NeedRecordState;
  entries: NeedSelectionEntry[];
  focusEntryId: string | null;
  smallStep: string;
  onChangeSmallStep: (text: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const SmallStepForm: React.FC<SmallStepFormProps> = ({
  stateType,
  entries,
  focusEntryId,
  smallStep,
  onChangeSmallStep,
  onBack,
  onProceed,
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const maxLength = CURRENT_NEEDS_CONSTRAINTS.SMALL_STEP_MAX_LENGTH;

  const focusEntry = entries.find((e) => e.entryId === focusEntryId);

  return (
    <div
      id="small-step-container"
      className="max-w-2xl mx-auto w-full p-4 sm:p-6 text-left"
    >
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1E9DB] text-[#96551F] mb-3 border border-[#D8CFBE]">
          <Feather className="w-3.5 h-3.5 stroke-2" />
          <span>Reflexão Opcional</span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#005A1F] mb-2">
          {stateType === 'unsure'
            ? 'Há algo que ajude a estar com essa dúvida?'
            : 'Existe um pequeno gesto possível?'}
        </h2>
        <p className="text-sm text-[#4B4B49] leading-relaxed">
          {stateType === 'unsure'
            ? 'Não saber exatamente o que se passa é uma percepção honesta e válida. Se fizer sentido, registre o que você gostaria de respeitar agora.'
            : 'Se quiser, anote uma ação simples, imediata ou interna que dê espaço a essa necessidade. Não precisa ser um plano, apenas um respiro.'}
        </p>
      </div>

      {focusEntry && (
        <div className="mb-4 p-3.5 rounded-[16px] bg-[#F1E9DB] border border-[#D8CFBE] flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#96551F] shrink-0" />
          <p className="text-xs text-[#262B22]">
            Você marcou <strong>{focusEntry.labelSnapshot}</strong> como necessidade
            para observar primeiro.
          </p>
        </div>
      )}

      {/* Formulário do Gesto */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="small-step-textarea"
            className="text-xs sm:text-sm font-semibold text-[#005A1F]"
          >
            Seu pequeno gesto (opcional)
          </label>
          <span className="text-xs text-[#6B6B63]">Pode ficar em branco</span>
        </div>

        <textarea
          id="small-step-textarea"
          value={smallStep}
          onChange={(e) => onChangeSmallStep(e.target.value)}
          maxLength={maxLength}
          rows={4}
          placeholder="Ex: Respirar três vezes com atenção, beber um copo d'água, pausar por 5 minutos..."
          className="w-full rounded-[20px] border-2 border-[#D8CFBE] bg-[#FDFAF4] p-4 text-sm text-[#262B22] placeholder-[#6B6B63]/70 focus:border-[#005A1F] focus:outline-none transition-colors"
        />

        <div className="flex justify-between items-center text-xs text-[#6B6B63] mt-1.5 px-1">
          <span>{smallStep.length} / {maxLength} caracteres</span>
          <span>Apenas para sua observação</span>
        </div>
      </div>

      {/* Exemplos Editoriais Opcionais (sob demanda, sem imposição) */}
      <div className="mb-8 border border-[#D8CFBE] rounded-[18px] bg-[#F1E9DB]/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-[#96551F] hover:bg-[#F1E9DB] transition-colors"
          aria-expanded={showExamples}
        >
          <span>Ver exemplos editoriais de pequenos gestos</span>
          {showExamples ? (
            <ChevronUp className="w-4 h-4 stroke-2" />
          ) : (
            <ChevronDown className="w-4 h-4 stroke-2" />
          )}
        </button>

        {showExamples && (
          <div className="p-4 pt-1 space-y-2 text-xs text-[#4B4B49] border-t border-[#D8CFBE]/60 bg-[#FDFAF4]">
            <p>• <strong>Descanso:</strong> Separar 5 minutos sem nenhuma tela ou compromisso.</p>
            <p>• <strong>Conexão:</strong> Dizer olá para alguém de confiança ou simplesmente sentir a companhia de quem está perto.</p>
            <p>• <strong>Segurança:</strong> Sentar com as costas apoiadas e notar os pontos de contato do corpo com a cadeira.</p>
            <p>• <strong>Autonomia:</strong> Escolher livremente a ordem do que fará a seguir, sem pressa.</p>
            <p>• <strong>Expressão:</strong> Escrever em um papel sem se preocupar com gramática ou sentido.</p>
            <p className="text-[11px] text-[#6B6B63] italic mt-2">
              Lembre-se: Esses são apenas exemplos para inspirar. Seu gesto tem o tamanho e a forma que você quiser.
            </p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-[#D8CFBE]">
        <button
          id="btn-smallstep-back"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-2" />
          <span>Voltar</span>
        </button>

        <button
          id="btn-smallstep-proceed"
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
        >
          <span>Revisar antes de finalizar</span>
          <ArrowRight className="w-4 h-4 stroke-2" />
        </button>
      </div>
    </div>
  );
};
