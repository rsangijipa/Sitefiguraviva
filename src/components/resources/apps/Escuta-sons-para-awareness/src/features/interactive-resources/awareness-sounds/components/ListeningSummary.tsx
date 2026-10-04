/**
 * ListeningSummary - Encerramento Ético da Experiência
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios:
 * - Não converter experiência subjetiva em desempenho (sem nota, percentual ou acertos).
 * - Conteúdo efêmero em memória por padrão.
 * - Salva no Supabase APENAS por escolha consciente ("Salvar no meu histórico privado").
 * - Opção "Concluir sem salvar".
 * - Exportação de dados em JSON.
 * - Campo de reflexão pessoal opcional (≤ 500 chars).
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  Download,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SceneObservation, ResourceMode } from '../types';
import { SOUND_LIBRARY_MANIFEST } from '../audio/assetLoader';

interface ListeningSummaryProps {
  durationSeconds: number;
  mode: ResourceMode;
  observations: SceneObservation[];
  onSaveToHistory: (reflection: string | null) => Promise<boolean>;
  onExitWithoutSaving: () => void;
  onExportData: () => void;
  onRestart: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}

export const ListeningSummary: React.FC<ListeningSummaryProps> = ({
  durationSeconds,
  mode,
  observations,
  onSaveToHistory,
  onExitWithoutSaving,
  onExportData,
  onRestart,
  isSaving,
  saveSuccess,
}) => {
  const [reflection, setReflection] = useState('');
  const [saveAttempted, setSaveAttempted] = useState(false);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleSave = async () => {
    setSaveAttempted(true);
    await onSaveToHistory(reflection.trim().length > 0 ? reflection.trim() : null);
  };

  return (
    <div id="listening-summary-screen" className="max-w-3xl mx-auto w-full py-4 space-y-6">
      {/* Cabeçalho de Encerramento */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Encerramento da Escuta
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[#005A1F]">
          Escuta finalizada.
        </h2>
        <p className="text-sm sm:text-base text-[#4B4B49] leading-relaxed">
          Você dedicou {formatDuration(durationSeconds)} à escuta atenta dos sons naturais no espaço.
          Toda observação feita foi um exercício voluntário de percepção.
        </p>
      </div>

      {/* Resumo das Cenas Observadas (Sem julgamento) */}
      {observations.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#F1E9DB] border-2 border-[#D8CFBE] space-y-3">
          <h3 className="text-sm font-semibold text-[#005A1F] uppercase tracking-wide">
            Cenas observadas nesta sessão
          </h3>
          <div className="space-y-2.5">
            {observations.map((obs, idx) => {
              const manifest = SOUND_LIBRARY_MANIFEST[obs.soundId];
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FDFAF4] border border-[#D8CFBE] text-xs sm:text-sm text-[#262B22] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-[#005A1F]">
                      {manifest?.title || obs.soundId}:
                    </span>{' '}
                    <span className="text-[#4B4B49]">
                      Direção percebida: <strong className="text-[#262B22]">{obs.perceivedDirection || 'Livre'}</strong> • Distância: <strong className="text-[#262B22]">{obs.perceivedDistance || 'Livre'}</strong>
                    </span>
                  </div>
                  {obs.qualities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {obs.qualities.map((q) => (
                        <span
                          key={q}
                          className="px-2 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] text-[11px] font-medium"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflexão Pessoal Opcional (≤ 500 caracteres) */}
      <div className="space-y-2">
        <label
          htmlFor="personal-reflection-input"
          className="block text-xs font-semibold text-[#005A1F] uppercase tracking-wider"
        >
          Reflexão pessoal (opcional, até 500 caracteres)
        </label>
        <textarea
          id="personal-reflection-input"
          rows={3}
          maxLength={500}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="O que chamou sua atenção durante a escuta? Como você percebeu as texturas sonoras..."
          className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border-2 border-[#D8CFBE] bg-[#FDFAF4] text-[#262B22] placeholder-[#6B6B63] focus:border-[#005A1F] focus:outline-none"
        />
        <div className="flex justify-end text-[11px] text-[#6B6B63]">
          {reflection.length}/500 caracteres
        </div>
      </div>

      {/* Garantia de Privacidade e RLS */}
      <div
        id="privacy-disclosure-box"
        className="p-4 rounded-2xl bg-[#FDFAF4] border-2 border-[#D8CFBE] flex items-start gap-3"
      >
        <Lock className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs text-[#4B4B49] leading-relaxed space-y-1">
          <p className="font-semibold text-[#005A1F]">
            Privacidade e Autonomia de Registro
          </p>
          <p>
            Este registro fica restrito ao seu histórico privado. Professores, tutores e outros alunos não têm acesso a essas anotações. Você é livre para não salvar nada e manter esta prática puramente em memória.
          </p>
        </div>
      </div>

      {/* Mensagem de confirmação de salvamento */}
      {saveSuccess && (
        <div
          id="save-success-notification"
          className="p-3.5 rounded-2xl bg-[#F1E9DB] border-2 border-[#01C94D] text-[#005A1F] text-xs sm:text-sm font-medium flex items-center gap-2"
          role="status"
        >
          <CheckCircle className="w-5 h-5 text-[#01C94D]" strokeWidth={2} />
          <span>Registro salvo no seu histórico privado com segurança.</span>
        </div>
      )}

      {/* Botões Finais de Decisão */}
      <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-export-json"
            onClick={onExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-xs font-medium text-[#4B4B49] transition-colors touch-target-min"
          >
            <Download className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span>Exportar meus dados (JSON)</span>
          </button>

          <button
            type="button"
            id="btn-restart-experience"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-xs font-medium text-[#4B4B49] transition-colors touch-target-min"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4B4B49]" strokeWidth={2} />
            <span>Repetir prática</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-exit-without-save"
            onClick={onExitWithoutSaving}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#96551F] text-[#96551F] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium transition-colors touch-target-min"
          >
            <span>Concluir sem salvar</span>
          </button>

          <button
            type="button"
            id="btn-save-to-private-history"
            disabled={isSaving || saveSuccess}
            onClick={handleSave}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors touch-target-min ${
              saveSuccess
                ? 'bg-[#07614C] text-[#FDFAF4] cursor-default'
                : 'bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            <span>{isSaving ? 'Salvando...' : saveSuccess ? 'Salvo no Histórico' : 'Salvar no meu histórico'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
