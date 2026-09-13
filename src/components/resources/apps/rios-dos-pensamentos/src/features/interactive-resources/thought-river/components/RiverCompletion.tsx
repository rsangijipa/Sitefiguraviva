/**
 * Tela de encerramento da experiência (RiverCompletion)
 * Proporciona fechamento acolhedor com reflexão opcional e escolha explícita de guardar ou não.
 * Não patologiza nem mede performance mental.
 */

import React, { useState } from 'react';
import { Bookmark, LogOut, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../../../types';

interface RiverCompletionProps {
  elapsedSeconds: number;
  currentUser: UserProfile;
  onSaveSession: (reflection: string) => Promise<{ success: boolean; error?: string }>;
  onExitWithoutSaving: () => void;
  onReturnToCatalog: () => void;
  onViewHistory: () => void;
}

export const RiverCompletion: React.FC<RiverCompletionProps> = ({
  elapsedSeconds,
  currentUser,
  onSaveSession,
  onExitWithoutSaving,
  onReturnToCatalog,
  onViewHistory,
}) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder} segundos`;
    if (remainder === 0) return `${mins} minuto${mins > 1 ? 's' : ''}`;
    return `${mins} min e ${remainder} s`;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveError(null);
    try {
      const res = await onSaveSession(reflection);
      if (res.success) {
        setIsSaved(true);
      } else {
        setSaveError(res.error || 'Não foi possível salvar. Seu registro continua nesta tela.');
      }
    } catch {
      setSaveError('Erro de conexão ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-8 text-left transition-all">
      {/* Acento sutil Confluência no topo do cartão */}
      <div className="w-12 h-1 rounded-full gradient-confluencia mb-6" aria-hidden="true" />

      <h2 className="font-['Fraunces'] text-2xl sm:text-3xl text-[#005A1F] font-semibold mb-2">
        Experiência concluída
      </h2>

      <p className="text-sm sm:text-base text-[#262B22] mb-6 leading-relaxed">
        Você dedicou <strong>{formatDuration(elapsedSeconds)}</strong> à observação do fluxo. Os pensamentos que passaram pelas folhas seguiram seu percurso natural e não foram retidos.
      </p>

      {/* Se já foi salvo com sucesso */}
      {isSaved ? (
        <div className="space-y-6">
          <div className="p-4 rounded-[16px] bg-[#F1E9DB] border-2 border-[#005A1F] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="text-sm font-semibold text-[#005A1F]">
                Registro salvo no seu histórico privado
              </h4>
              <p className="text-xs text-[#262B22] mt-1">
                Apenas a duração e a sua reflexão pessoal foram guardadas com segurança no seu espaço do aluno.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onViewHistory}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] text-sm font-medium transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>Ver meu histórico</span>
            </button>
            <button
              type="button"
              onClick={onReturnToCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Voltar aos recursos</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de reflexão opcional */
        <div className="space-y-5">
          <div>
            <label
              htmlFor="reflection-note"
              className="block text-sm font-medium text-[#262B22] mb-1.5"
            >
              Quer registrar algo sobre esta experiência? <span className="text-[#6B6B63] font-normal">(opcional)</span>
            </label>
            <textarea
              id="reflection-note"
              rows={4}
              maxLength={500}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Como foi a sensação de observar o que passou sem precisar intervir? (até 500 caracteres)"
              className="w-full p-3.5 bg-[#FDFAF4] text-[#262B22] border-2 border-[#D8CFBE] rounded-[16px] text-sm focus:border-[#005A1F] focus:ring-0 resize-none leading-relaxed transition-colors"
            />
            <div className="flex justify-between text-xs text-[#6B6B63] mt-1">
              <span>{500 - reflection.length} caracteres restantes</span>
              <span className="text-[#96551F]">Sem avaliação clínica ou notas numéricas</span>
            </div>
          </div>

          {/* Aviso ético sobre privacidade */}
          <div className="p-3.5 rounded-[16px] bg-[#F1E9DB]/60 border border-[#D8CFBE] flex items-start gap-2.5 text-xs text-[#6B6B63]">
            <ShieldCheck className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
            <span>
              Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.
            </span>
          </div>

          {currentUser.role === 'anonymous' && (
            <p className="text-xs text-[#96551F] italic">
              Você está navegando como visitante. Para guardar registros no histórico entre sessões, entre com seu perfil de aluno.
            </p>
          )}

          {saveError && (
            <div
              role="alert"
              className="p-3 rounded-[12px] bg-[#F1E9DB] border border-[#96551F] text-xs text-[#96551F] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Ações finais */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || currentUser.role === 'anonymous'}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] active:bg-[#005A1F] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar esta nota e a duração'}</span>
            </button>

            <button
              type="button"
              onClick={onExitWithoutSaving}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-sm font-medium text-[#262B22] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#6B6B63]" strokeWidth={2} />
              <span>Encerrar sem guardar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
