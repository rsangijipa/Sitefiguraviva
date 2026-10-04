import React from 'react';
import { EmotionFamily, EmotionSecondary, EmotionNuance } from '../../../types';
import { BODY_ANCHORS } from '../../../data/emotionsData';
import { ArrowLeft, BookOpen, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ResourceCompletionProps {
  durationSeconds: number;
  activeFamily?: EmotionFamily;
  activeSecondary?: EmotionSecondary;
  activeNuance?: EmotionNuance;
  customEmotion?: string;
  bodyAnchor?: string;
  intensity?: number;
  reflection?: string;
  isSavedToDiary: boolean;
  onSaveToDiary: () => void;
  onResume: () => void;
  onBackToCatalog: () => void;
  onOpenDiaryModal: () => void;
}

export const ResourceCompletion: React.FC<ResourceCompletionProps> = ({
  durationSeconds,
  activeFamily,
  activeSecondary,
  activeNuance,
  customEmotion,
  bodyAnchor,
  intensity,
  reflection,
  isSavedToDiary,
  onSaveToDiary,
  onResume,
  onBackToCatalog,
  onOpenDiaryModal,
}) => {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeFormatted = `${minutes}min ${seconds < 10 ? '0' : ''}${seconds}s`;

  const anchorLabel = BODY_ANCHORS.find((a) => a.id === bodyAnchor)?.label || bodyAnchor;

  return (
    <div
      id="resource-completion-view"
      className="max-w-2xl mx-auto w-full p-4 sm:p-8 flex flex-col items-center justify-center my-auto space-y-6 text-center"
      role="region"
      aria-label="Encerramento contemplativo da experiência"
    >
      {/* Símbolo Confluência suave (Aurora -> Vazante -> Broto) */}
      <div className="w-16 h-16 rounded-full p-[2px] gradient-confluencia flex items-center justify-center">
        <div className="w-full h-full bg-[#FDFAF4] rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#005A1F] stroke-[2]" />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#96551F] uppercase tracking-wider">
          Instituto Figura Viva • Confluência
        </span>
        <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#262B22]">
          Experiência Encerrada
        </h2>
        <p className="text-sm text-[#4B4B49] max-w-lg mx-auto leading-relaxed">
          A percepção das nuances afetivas é uma prática contínua de escuta e acolhimento do corpo, sem metas ou exigências de desempenho.
        </p>
      </div>

      {/* Resumo Contemplativo da Sessão */}
      <div className="w-full bg-[#FAF6EE] border-2 border-[#D8CFBE] rounded-3xl p-5 sm:p-6 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8CFBE] pb-3 text-xs text-[#6B6B63]">
          <span>Tempo de escuta: {timeFormatted}</span>
          <span>Registro qualitativo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-[#FDFAF4] rounded-xl border border-[#D8CFBE]">
            <span className="text-[11px] font-bold text-[#6B6B63] block uppercase tracking-wider">
              Qualidade Explorada
            </span>
            <p className="font-fraunces font-semibold text-[#262B22] mt-0.5">
              {customEmotion || activeNuance?.name || activeSecondary?.name || activeFamily?.name || 'Exploração aberta'}
            </p>
            {activeFamily && (
              <span className="text-xs text-[#4B4B49]">Família: {activeFamily.name}</span>
            )}
          </div>

          <div className="p-3 bg-[#FDFAF4] rounded-xl border border-[#D8CFBE]">
            <span className="text-[11px] font-bold text-[#6B6B63] block uppercase tracking-wider">
              Âncora Corporal
            </span>
            <p className="font-fraunces font-semibold text-[#262B22] mt-0.5">
              {anchorLabel || 'Percepção global'}
            </p>
            {intensity && (
              <span className="text-xs text-[#4B4B49]">Presença nível {intensity} de 5</span>
            )}
          </div>
        </div>

        {reflection && (
          <div className="p-3 bg-[#FDFAF4] rounded-xl border border-[#D8CFBE]">
            <span className="text-[11px] font-bold text-[#6B6B63] block uppercase tracking-wider">
              Anotação Contemplativa
            </span>
            <p className="text-xs sm:text-sm text-[#262B22] italic mt-1 leading-relaxed">
              &ldquo;{reflection}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Ações Finais */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {!isSavedToDiary ? (
          <button
            id="btn-completion-save-diary"
            onClick={onSaveToDiary}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005A1F] text-[#FDFAF4] font-medium text-sm hover:opacity-95 transition-all min-h-[44px]"
          >
            <Check className="w-4 h-4 stroke-[2]" />
            <span>Salvar no meu histórico</span>
          </button>
        ) : (
          <button
            id="btn-completion-view-diary"
            onClick={onOpenDiaryModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#005A1F] bg-[#F1E9DB] text-[#005A1F] font-medium text-sm hover:bg-[#EAE1CF] transition-all min-h-[44px]"
          >
            <BookOpen className="w-4 h-4 stroke-[2]" />
            <span>Ver no Meu Diário</span>
          </button>
        )}

        <button
          id="btn-completion-resume"
          onClick={onResume}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-[#D8CFBE] bg-[#FDFAF4] text-[#262B22] font-medium text-sm hover:bg-[#F1E9DB] transition-all min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 stroke-[2]" />
          <span>Retomar exploração</span>
        </button>

        <button
          id="btn-completion-back-catalog"
          onClick={onBackToCatalog}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-[#D8CFBE] bg-[#FDFAF4] text-[#262B22] font-medium text-sm hover:bg-[#F1E9DB] transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span>Voltar aos Recursos</span>
        </button>
      </div>
    </div>
  );
};
