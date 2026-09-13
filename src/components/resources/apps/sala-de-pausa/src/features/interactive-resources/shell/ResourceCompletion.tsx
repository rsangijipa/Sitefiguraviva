/**
 * @license
 * Instituto Figura Viva - ResourceCompletion (Registro Confluência)
 * Fechamento respeitoso e neutro:
 * "Sua pausa pode terminar aqui."
 * Campo de reflexão opcional <= 500 caracteres.
 * "Salvar no meu histórico" vs "Voltar sem salvar".
 * Nunca transformar experiência subjetiva em pontuação ou diagnóstico.
 */

import React, { useState } from 'react';
import { Check, Shield, Clock, BookOpen, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ResourceCompletionProps {
  practiceTitle: string;
  activeDurationSeconds: number;
  endedBy: 'timer' | 'user' | 'switch';
  currentUser: UserProfile;
  onSaveToHistory: (reflectionText: string) => Promise<{ success: boolean; error?: string }>;
  onBackToPortal: () => void;
  onContinueAWhile?: () => void;
  canContinue?: boolean;
}

export const ResourceCompletion: React.FC<ResourceCompletionProps> = ({
  practiceTitle,
  activeDurationSeconds,
  endedBy,
  currentUser,
  onSaveToHistory,
  onBackToPortal,
  onContinueAWhile,
  canContinue = false,
}) => {
  const [reflection, setReflection] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    if (remainingSec === 0) return `${mins} min`;
    return `${mins} min e ${remainingSec}s`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || savedSuccess) return;

    setIsSaving(true);
    setSaveError(null);

    const result = await onSaveToHistory(reflection.trim());
    setIsSaving(false);

    if (result.success) {
      setSavedSuccess(true);
    } else {
      setSaveError(result.error || 'Não foi possível salvar neste momento. Seu rascunho continua nesta tela.');
    }
  };

  const charCount = reflection.length;
  const isOverLimit = charCount > 500;

  return (
    <div 
      id="resource-completion"
      className="w-full max-w-xl mx-auto bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-8"
      role="region"
      aria-label="Conclusão da pausa"
    >
      {/* Indicador Confluência */}
      <div className="w-16 h-1 confluencia-accent-line mx-auto mb-6" aria-hidden="true" />

      {/* Título editorial respeitoso */}
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-wider text-[#96551F] font-semibold">
          {practiceTitle}
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#005A1F] mt-1 mb-2">
          {endedBy === 'timer' ? 'O tempo escolhido terminou' : 'Sua pausa pode terminar aqui'}
        </h2>
        <p className="text-sm sm:text-base text-[#4B4B49] font-sans">
          Você dedicou <strong className="text-[#005A1F]">{formatDuration(activeDurationSeconds)}</strong> a este momento no seu ritmo.
        </p>
      </div>

      {/* Ação opcional: Continuar um pouco mais se acabou pelo timer */}
      {canContinue && onContinueAWhile && !savedSuccess && (
        <div className="mb-6 p-3.5 bg-[#F1E9DB] border border-[#07614C]/30 rounded-xl text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#262B22] font-medium text-left">
            Se quiser seguir sem contagem regressiva, você pode continuar.
          </p>
          <button
            id="btn-continue-awhile"
            type="button"
            onClick={onContinueAWhile}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-[#FDFAF4] text-[#07614C] border border-[#07614C] hover:bg-[#07614C] hover:text-[#FDFAF4] transition-colors text-xs font-semibold min-h-[44px] flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Continuar um pouco</span>
          </button>
        </div>
      )}

      {/* Mensagem de sucesso ao salvar */}
      {savedSuccess ? (
        <div 
          id="save-success-notification"
          className="bg-[#F1E9DB] border-2 border-[#005A1F] rounded-2xl p-5 mb-6 text-center animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div className="w-10 h-10 rounded-full bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2.5} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#005A1F]">
            Registro salvo no seu histórico privado
          </h3>
          <p className="text-xs sm:text-sm text-[#4B4B49] mt-1">
            Este registro fica acessível apenas para você no Portal do Aluno.
          </p>
          <div className="mt-5">
            <button
              id="btn-return-portal-after-save"
              type="button"
              onClick={onBackToPortal}
              className="px-5 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] font-medium transition-colors text-sm min-h-[44px] inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>Voltar ao Portal do Aluno</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de reflexão opcional */
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label 
              htmlFor="pause-reflection-input"
              className="block text-sm font-medium text-[#262B22] mb-1"
            >
              Quer guardar uma observação? <span className="text-xs text-[#6B6B63] font-normal">(opcional)</span>
            </label>
            <textarea
              id="pause-reflection-input"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Uma sensação, palavra ou percepção deste instante..."
              rows={3}
              maxLength={500}
              className={`w-full p-3.5 rounded-xl bg-[#FDFAF4] border-2 text-sm text-[#262B22] placeholder-[#6B6B63] focus:outline-none transition-colors ${
                isOverLimit 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-[#D8CFBE] focus:border-[#005A1F]'
              }`}
              aria-describedby="char-count-feedback"
            />
            <div id="char-count-feedback" className="flex items-center justify-between text-xs text-[#6B6B63] mt-1">
              <span>Máximo de 500 caracteres</span>
              <span className={charCount > 480 ? 'text-[#96551F] font-semibold' : ''}>
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Aviso sobre privacidade e RLS */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE] text-xs text-[#4B4B49]">
            <Shield className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
            <p>
              Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.
            </p>
          </div>

          {/* Notificação de erro se houver */}
          {saveError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-[#96551F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#96551F]" strokeWidth={2} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Ações: Salvar no histórico vs Sair sem salvar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              id="btn-exit-without-save"
              type="button"
              onClick={onBackToPortal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] text-sm font-medium transition-colors min-h-[44px] text-center"
            >
              Voltar sem salvar
            </button>

            <button
              id="btn-save-to-history"
              type="submit"
              disabled={isSaving || isOverLimit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] active:bg-[#005A1F] disabled:opacity-50 font-medium transition-colors min-h-[44px] text-sm focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <Save className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>{isSaving ? 'Guardando...' : 'Salvar no meu histórico'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
