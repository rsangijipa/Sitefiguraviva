import React, { useState } from 'react';
import {
  EmotionFamily,
  EmotionSecondary,
  EmotionNuance,
  BodyAnchor,
} from '../../../types';
import { BODY_ANCHORS, INTENSITY_LEVELS } from '../../../data/emotionsData';
import { Bookmark, Sparkles, Edit3, Check, RotateCcw } from 'lucide-react';
import { audioService } from '../../../services/audioService';

interface ExplorationPanelProps {
  activeFamily?: EmotionFamily;
  activeSecondary?: EmotionSecondary;
  activeNuance?: EmotionNuance;
  customEmotion: string;
  onCustomEmotionChange: (val: string) => void;
  bodyAnchor: string;
  onBodyAnchorChange: (val: string) => void;
  intensity: number;
  onIntensityChange: (val: number) => void;
  reflection: string;
  onReflectionChange: (val: string) => void;
  onSaveToDiary: () => void;
  onResetSelection: () => void;
  isSavedToDiary: boolean;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({
  activeFamily,
  activeSecondary,
  activeNuance,
  customEmotion,
  onCustomEmotionChange,
  bodyAnchor,
  onBodyAnchorChange,
  intensity,
  onIntensityChange,
  reflection,
  onReflectionChange,
  onSaveToDiary,
  onResetSelection,
  isSavedToDiary,
}) => {
  const [isWritingCustom, setIsWritingCustom] = useState<boolean>(false);

  const hasAnySelection = activeFamily || customEmotion.trim().length > 0;

  return (
    <aside
      id="exploration-panel"
      className="w-full h-full flex flex-col bg-[#FDFAF4] rounded-3xl border-2 border-[#D8CFBE] p-4 sm:p-6 overflow-y-auto space-y-6"
      aria-label="Painel de investigação fenomenológica"
    >
      {/* Cabeçalho do Painel */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-[#F1E9DB] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#96551F]">
            Registro de Percepção
          </span>
          <h2 className="text-xl font-fraunces font-semibold text-[#262B22]">
            {isWritingCustom
              ? 'Nomeação Livre'
              : activeNuance?.name || activeSecondary?.name || activeFamily?.name || 'Aguardando seleção'}
          </h2>
          <p className="text-xs text-[#6B6B63] mt-0.5">
            Sem diagnóstico ou julgamento. Este é um espaço de acolhimento e ampliação de vocabulário afetivo.
          </p>
        </div>

        {hasAnySelection && (
          <button
            id="btn-reset-selection"
            onClick={onResetSelection}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D8CFBE] text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] text-xs transition-colors min-h-[36px]"
            title="Reiniciar exploração"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Opção: Não encontrei uma palavra */}
      <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border-2 border-[#E5DDD0]">
        <div className="flex items-center justify-between">
          <label
            htmlFor="custom-emotion-toggle"
            className="text-xs font-semibold text-[#262B22] flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#96551F]" />
            <span>Não encontrou uma palavra adequada na roda?</span>
          </label>
          <button
            id="custom-emotion-toggle"
            type="button"
            onClick={() => setIsWritingCustom(!isWritingCustom)}
            className="text-xs font-medium text-[#005A1F] underline underline-offset-2 hover:opacity-80 min-h-[32px] px-1"
          >
            {isWritingCustom ? 'Voltar à roda' : 'Escrever livremente'}
          </button>
        </div>

        {isWritingCustom && (
          <div className="mt-3 pt-3 border-t border-[#D8CFBE]">
            <input
              id="input-custom-emotion"
              type="text"
              value={customEmotion}
              onChange={(e) => onCustomEmotionChange(e.target.value)}
              placeholder="Ex.: Uma bruma mansa no peito, nó que se desfaz..."
              className="w-full bg-[#FDFAF4] border-2 border-[#005A1F] rounded-xl px-3.5 py-2.5 text-sm text-[#262B22] placeholder:text-[#6B6B63] focus:outline-none min-h-[44px]"
            />
            <p className="text-[11px] text-[#6B6B63] mt-1.5">
              Você pode nomear sua experiência com metáforas, verbos ou sensações.
            </p>
          </div>
        )}
      </div>

      {/* Descrição Fenomenológica da seleção atual */}
      {!isWritingCustom && activeFamily && (
        <div
          id="phenomenological-description-card"
          className="bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-2xl p-4 text-[#262B22]"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#005A1F]" />
            <span className="text-xs font-bold text-[#005A1F] uppercase tracking-wider">
              Leitura Fenomenológica
            </span>
          </div>

          <p className="text-sm font-fraunces italic leading-relaxed text-[#262B22]">
            &ldquo;
            {activeNuance?.phenomenologicalDescription ||
              activeFamily?.description ||
              'Acolhendo este movimento interno.'}
            &rdquo;
          </p>

          <div className="mt-3 pt-2 border-t border-[#D8CFBE] flex flex-wrap gap-2 text-xs text-[#4B4B49]">
            <span className="font-semibold text-[#262B22]">Família:</span> {activeFamily.name}
            {activeSecondary && (
              <>
                <span>•</span>
                <span className="font-semibold text-[#262B22]">Ressonância:</span> {activeSecondary.name}
              </>
            )}
            {activeNuance && (
              <>
                <span>•</span>
                <span className="font-semibold text-[#262B22]">Nuance:</span> {activeNuance.name}
              </>
            )}
          </div>
        </div>
      )}

      {/* Se não houver seleção ainda, orienta o usuário */}
      {!hasAnySelection && !isWritingCustom && (
        <div className="p-4 rounded-2xl border-2 border-dashed border-[#D8CFBE] text-center bg-[#FAF6EE]">
          <p className="text-sm text-[#6B6B63] leading-relaxed">
            Toque ou selecione um dos quadrantes da Roda ao lado para desdobrar famílias, relações e nuances.
          </p>
        </div>
      )}

      {/* INVESTIGAÇÃO SOMÁTICA E CONTEMPLATIVA */}
      <div className="space-y-5 pt-2">
        {/* Pergunta 1: Onde você percebe isso agora? */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold font-fraunces text-[#262B22]">
            Onde você percebe isso no corpo agora?
          </legend>
          <p className="text-xs text-[#6B6B63]">
            Identifique um ponto focal de sensação corporal sem pressa de alterá-lo.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {BODY_ANCHORS.map((anchor: BodyAnchor) => {
              const isSelected = bodyAnchor === anchor.id;
              return (
                <button
                  key={anchor.id}
                  id={`btn-anchor-${anchor.id}`}
                  type="button"
                  onClick={() => {
                    audioService.playSelectTone(1);
                    onBodyAnchorChange(isSelected ? '' : anchor.id);
                  }}
                  aria-pressed={isSelected}
                  className={`text-xs px-3 py-2 rounded-xl border-2 transition-colors min-h-[44px] flex items-center justify-center font-medium ${
                    isSelected
                      ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                      : 'bg-[#FAF6EE] text-[#262B22] border-[#D8CFBE] hover:bg-[#F1E9DB]'
                  }`}
                >
                  {anchor.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Pergunta 2: Intensidade / Presença */}
        <fieldset className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold font-fraunces text-[#262B22]">
              Qual a intensidade dessa experiência no momento?
            </legend>
            <span className="text-xs font-bold text-[#005A1F] bg-[#F1E9DB] px-2 py-0.5 rounded-md border border-[#D8CFBE]">
              {INTENSITY_LEVELS[intensity - 1]?.label || 'Presente'}
            </span>
          </div>
          <p className="text-xs text-[#6B6B63]">
            {INTENSITY_LEVELS[intensity - 1]?.description}
          </p>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {INTENSITY_LEVELS.map((item) => {
              const isSelected = intensity === item.level;
              return (
                <button
                  key={item.level}
                  id={`btn-intensity-${item.level}`}
                  type="button"
                  onClick={() => {
                    audioService.playSelectTone(2);
                    onIntensityChange(item.level);
                  }}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-colors min-h-[44px] ${
                    isSelected
                      ? 'border-[#96551F] bg-[#F1E9DB] font-bold text-[#96551F]'
                      : 'border-[#D8CFBE] bg-[#FAF6EE] text-[#6B6B63] hover:bg-[#F1E9DB]'
                  }`}
                >
                  <span className="text-sm">{item.level}</span>
                  <span className="text-[10px] hidden sm:block mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Pergunta 3: O que chama sua atenção quando fica com isso? */}
        <div className="space-y-1.5 pt-2">
          <label
            htmlFor="textarea-reflection"
            className="text-sm font-semibold font-fraunces text-[#262B22] block"
          >
            O que chama sua atenção quando você fica com isso por alguns instantes?
          </label>
          <p className="text-xs text-[#6B6B63]">
            Espaço aberto para observação livre de imagens, pensamentos ou sensações.
          </p>
          <textarea
            id="textarea-reflection"
            rows={3}
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="Ex.: Notei que ao respirar fundo a tensão nos ombros amacia, e há um silêncio no fundo da respiração..."
            className="w-full bg-[#FDFAF4] border-2 border-[#D8CFBE] focus:border-[#005A1F] rounded-2xl p-3 text-sm text-[#262B22] placeholder:text-[#6B6B63] focus:outline-none max-w-[75ch] leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* Ação de Persistência no Diário (Consentimento e Intencionalidade) */}
      <div className="pt-2 border-t-2 border-[#F1E9DB]">
        <button
          id="btn-save-diary"
          type="button"
          onClick={() => {
            audioService.playChime();
            onSaveToDiary();
          }}
          disabled={!hasAnySelection && !bodyAnchor && !reflection}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm transition-all min-h-[48px] border-2 ${
            isSavedToDiary
              ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
              : 'bg-[#F1E9DB] text-[#005A1F] border-[#005A1F] hover:bg-[#E8DFC8] active:bg-[#DED2BA]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSavedToDiary ? (
            <>
              <Check className="w-5 h-5 stroke-[2]" />
              <span>Guardado no meu diário</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 stroke-[2]" />
              <span>Guardar no meu diário</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-[#6B6B63] text-center mt-2 leading-tight">
          Registro estritamente privado, protegido por Row Level Security no Supabase.
        </p>
      </div>
    </aside>
  );
};
