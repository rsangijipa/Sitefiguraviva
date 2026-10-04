/**
 * NeedsSummary - Tela de Revisão e Encerramento
 *
 * Apresenta a síntese: "Você deu nome ao que parece presente agora."
 * Lista escolhas (com ordenação apenas se ativada), gesto livre nas palavras do aluno,
 * e três caminhos claros:
 * 1. "Guardar no meu histórico privado"
 * 2. "Editar escolhas"
 * 3. "Encerrar experiência sem guardar"
 */

import React from 'react';
import {
  CheckCircle2,
  Bookmark,
  Edit3,
  XCircle,
  Star,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { NeedRecordState, NeedSelectionEntry } from '../types';

interface NeedsSummaryProps {
  stateType: NeedRecordState;
  entries: NeedSelectionEntry[];
  ordered: boolean;
  focusEntryId: string | null;
  smallStep: string;
  isSaving: boolean;
  saveError: string | null;
  isSaved: boolean;
  onSaveToHistory: () => void;
  onEditChoices: () => void;
  onExitWithoutSaving: () => void;
  onGoToHistory: () => void;
}

export const NeedsSummary: React.FC<NeedsSummaryProps> = ({
  stateType,
  entries,
  ordered,
  focusEntryId,
  smallStep,
  isSaving,
  saveError,
  isSaved,
  onSaveToHistory,
  onEditChoices,
  onExitWithoutSaving,
  onGoToHistory,
}) => {
  const focusEntry = entries.find((e) => e.entryId === focusEntryId);

  return (
    <div
      id="needs-summary-container"
      className="max-w-2xl mx-auto w-full p-4 sm:p-6 text-left"
    >
      {/* Mensagem Afirmativa Confluência */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center mb-3 text-[#005A1F]">
          <CheckCircle2 className="w-6 h-6 stroke-2" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#005A1F] mb-2 leading-tight">
          Você deu nome ao que parece presente agora.
        </h2>

        <p className="text-sm text-[#4B4B49] leading-relaxed">
          {stateType === 'unsure'
            ? 'Você reconheceu um momento de indefinição, dando espaço à sua percepção sem forçar conclusões rápidas.'
            : 'Reconhecer as necessidades não obriga a resolver tudo hoje. Dar espaço ao que se sente já é um primeiro movimento de escuta.'}
        </p>
      </div>

      {/* Cartão de Resumo das Escolhas */}
      <div className="bg-[#F1E9DB] rounded-[24px] border-2 border-[#D8CFBE] p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8CFBE]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#96551F]">
            {stateType === 'unsure'
              ? 'Situação Observada'
              : ordered
              ? 'Necessidades por ordem de presença'
              : 'Suas escolhas neste momento'}
          </h3>
          <span className="text-xs text-[#6B6B63]">
            {stateType === 'unsure' ? 'Sem lista' : `${entries.length} observada(s)`}
          </span>
        </div>

        {stateType === 'unsure' ? (
          <p className="text-sm text-[#262B22] italic">
            "Ainda não sei" — Indefinição acolhida com paciência.
          </p>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry, idx) => {
              const isFocus = focusEntryId === entry.entryId;

              return (
                <div
                  key={entry.entryId}
                  className="bg-[#FDFAF4] rounded-[16px] border border-[#D8CFBE] p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {ordered && (
                      <span className="w-6 h-6 rounded-full bg-[#F1E9DB] text-[#005A1F] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-[#005A1F]">
                        {entry.labelSnapshot}
                      </h4>
                      {entry.descriptionSnapshot && (
                        <p className="text-xs text-[#6B6B63]">
                          {entry.descriptionSnapshot}
                        </p>
                      )}
                    </div>
                  </div>

                  {isFocus && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE] flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Foco prioritário</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Gesto Livre */}
        {smallStep && (
          <div className="mt-5 pt-4 border-t border-[#D8CFBE]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#07614C] mb-1">
              Seu pequeno gesto anotado
            </h4>
            <p className="text-sm text-[#262B22] bg-[#FDFAF4] p-3 rounded-[16px] border border-[#D8CFBE] leading-relaxed">
              "{smallStep}"
            </p>
          </div>
        )}
      </div>

      {/* Aviso de Privacidade e Segurança do Histórico */}
      <div className="mb-6 p-4 rounded-[20px] bg-[#FDFAF4] border-2 border-[#D8CFBE] flex items-start gap-3 text-xs text-[#6B6B63] leading-relaxed">
        <ShieldCheck className="w-5 h-5 stroke-2 text-[#005A1F] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#005A1F]">Apenas no seu histórico privado:</strong>{' '}
          Professores, tutores e outros alunos não têm acesso a essas anotações.
          Você tem total controle sobre salvar ou descartar agora.
        </div>
      </div>

      {/* Feedback de Erro se houver falha de rede/salvamento */}
      {saveError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#96551F] flex items-center gap-3 text-sm text-[#96551F]"
        >
          <AlertCircle className="w-5 h-5 stroke-2 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Estado: Já Salvo com Sucesso */}
      {isSaved ? (
        <div className="p-6 rounded-[24px] bg-[#F1E9DB] border-2 border-[#005A1F] text-center mb-6">
          <CheckCircle2 className="w-8 h-8 stroke-2 text-[#005A1F] mx-auto mb-2" />
          <h3 className="font-heading text-lg font-bold text-[#005A1F] mb-1">
            Registro salvo no seu histórico privado
          </h3>
          <p className="text-xs text-[#4B4B49] mb-4">
            Você pode consultar suas anotações passadas a qualquer momento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-view-history"
              type="button"
              onClick={onGoToHistory}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
            >
              Ver meu histórico
            </button>
            <button
              id="btn-finish-experience-saved"
              type="button"
              onClick={onExitWithoutSaving}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#D8CFBE] transition-colors min-h-[44px]"
            >
              Encerrar experiência
            </button>
          </div>
        </div>
      ) : (
        /* Ações Principais quando ainda não salvou */
        <div className="space-y-3 pt-2">
          <button
            id="btn-save-to-history"
            type="button"
            disabled={isSaving}
            onClick={onSaveToHistory}
            className="w-full py-3.5 px-6 rounded-full text-sm sm:text-base font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            {isSaving ? (
              <span>Salvando no seu histórico...</span>
            ) : (
              <>
                <Bookmark className="w-5 h-5 stroke-2" />
                <span>Salvar no meu histórico privado</span>
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              id="btn-edit-choices"
              type="button"
              onClick={onEditChoices}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
            >
              <Edit3 className="w-4 h-4 stroke-2" />
              <span>Editar escolhas</span>
            </button>

            <button
              id="btn-exit-without-saving"
              type="button"
              onClick={onExitWithoutSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-[#96551F] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
            >
              <XCircle className="w-4 h-4 stroke-2" />
              <span>Encerrar sem guardar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
