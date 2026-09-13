/**
 * StudentHistory - Histórico Privado do Aluno
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios de Segurança e Privacidade:
 * - RLS: Usuário visualiza e gerencia exclusivamente seus próprios registros.
 * - Confirmação explícita para exclusão.
 * - Botão de exportação dos próprios dados em JSON.
 * - Aviso de confidencialidade claro e honesto.
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  Compass,
  FileText,
  Volume2,
} from 'lucide-react';
import { globalRepository } from '../features/interactive-resources/awareness-sounds/repository';
import { ListeningSessionEntry } from '../features/interactive-resources/awareness-sounds/types';
import { SOUND_LIBRARY_MANIFEST } from '../features/interactive-resources/awareness-sounds/audio/assetLoader';

export const StudentHistory: React.FC = () => {
  const [entries, setEntries] = useState<ListeningSessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryToDelete, setEntryToDelete] = useState<ListeningSessionEntry | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await globalRepository.getStudentEntries();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    const jsonString = await globalRepository.exportStudentData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-figura-viva-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMessage('Arquivo exportado com sucesso.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await globalRepository.deleteEntry(entryToDelete.id);
      setFeedbackMessage('Registro excluído com segurança.');
      setEntryToDelete(null);
      await loadData();
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setFeedbackMessage('Erro ao excluir registro.');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div id="student-history-page" className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#D8CFBE] pb-6">
        <div className="space-y-1 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
            Privacidade & Autonomia
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#005A1F]">
            Meu Histórico Privado
          </h1>
          <p className="text-sm text-[#4B4B49]">
            Registros voluntários guardados pelo aluno autenticado ({globalRepository.getCurrentUserId()}).
          </p>
        </div>

        {entries.length > 0 && (
          <button
            id="btn-export-all-history"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-xs sm:text-sm font-semibold text-[#005A1F] transition-colors touch-target-min self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span>Exportar meus registros</span>
          </button>
        )}
      </div>

      {/* Aviso de Privacidade Estrito */}
      <div
        id="history-privacy-banner"
        className="p-4 rounded-3xl bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-3"
      >
        <Lock className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed space-y-1">
          <p className="font-semibold text-[#005A1F]">
            Controle exclusivo sobre seus dados íntimos
          </p>
          <p>
            Este registro fica no seu histórico privado. Professores, instrutores e outros alunos não têm acesso por esta ferramenta. A política de segurança de dados (RLS) garante que apenas sua sessão tenha permissão de leitura e exclusão.
          </p>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {feedbackMessage && (
        <div className="p-3 bg-[#FDFAF4] border-2 border-[#005A1F] rounded-2xl text-xs font-medium text-[#005A1F] text-center">
          {feedbackMessage}
        </div>
      )}

      {/* Lista de Registros ou Estado Vazio */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#6B6B63]">
          Carregando registros privados...
        </div>
      ) : entries.length === 0 ? (
        <div
          id="history-empty-state"
          className="p-12 rounded-[24px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-center space-y-3"
        >
          <Compass className="w-10 h-10 text-[#96551F] mx-auto" strokeWidth={2} />
          <h2 className="font-heading text-lg font-semibold text-[#005A1F]">
            Você ainda não guardou registros aqui.
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] max-w-md mx-auto">
            Quando você concluir uma experiência no microapp Sons para Awareness, poderá escolher guardá-la no seu histórico privado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-[24px] bg-[#FDFAF4] border-2 border-[#D8CFBE] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8CFBE] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#F1E9DB] text-[#005A1F] flex items-center justify-center font-semibold text-xs">
                    <Volume2 className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[#005A1F]">
                      Sons para Awareness
                    </h3>
                    <div className="text-[11px] text-[#6B6B63] flex items-center gap-2">
                      <span>{formatDate(entry.createdAt)}</span>
                      <span>•</span>
                      <span>Duração: {formatDuration(entry.durationSeconds)}</span>
                      <span>•</span>
                      <span className="capitalize">Modo: {entry.mode}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEntryToDelete(entry)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#96551F] hover:bg-[#F1E9DB] border border-transparent hover:border-[#96551F] transition-colors"
                  aria-label="Excluir este registro privado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>

              {/* Observações da Sessão */}
              {entry.observations.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold uppercase text-[#005A1F] tracking-wide">
                    Observações de Percepção:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {entry.observations.map((obs, idx) => {
                      const manifest = SOUND_LIBRARY_MANIFEST[obs.soundId];
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#F1E9DB] text-xs text-[#262B22] border border-[#D8CFBE]"
                        >
                          <strong className="text-[#005A1F] block mb-0.5">
                            {manifest?.title || obs.soundId}
                          </strong>
                          <span className="text-[#4B4B49]">
                            Direção: {obs.perceivedDirection || 'Não informado'} • Distância: {obs.perceivedDistance || 'Não informada'}
                          </span>
                          {obs.qualities.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {obs.qualities.map((q) => (
                                <span key={q} className="px-1.5 py-0.2 rounded bg-[#FDFAF4] text-[10px] text-[#96551F]">
                                  {q}
                                </span>
                              ))}
                            </div>
                          )}
                          {obs.customQuality && (
                            <div className="mt-1 italic text-[11px] text-[#262B22]">
                              "{obs.customQuality}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reflexão Pessoal */}
              {entry.personalReflection && (
                <div className="pt-2 border-t border-[#D8CFBE]">
                  <span className="text-[11px] font-semibold uppercase text-[#96551F] tracking-wide block mb-1">
                    Sua Reflexão Pessoal:
                  </span>
                  <p className="text-xs sm:text-sm text-[#262B22] italic bg-[#F1E9DB] p-3 rounded-xl">
                    "{entry.personalReflection}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {entryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#262B22]/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-[#FDFAF4] rounded-[24px] border-2 border-[#96551F] p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#96551F]">
              <AlertTriangle className="w-6 h-6" strokeWidth={2} />
              <h3 className="font-heading text-lg font-bold">
                Excluir registro privado?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
              Esta ação removerá permanentemente o registro de escuta realizado em{' '}
              <strong>{formatDate(entryToDelete.createdAt)}</strong> com {entryToDelete.observations.length} observações.
            </p>
            <p className="text-xs text-[#6B6B63]">
              A remoção é definitiva no banco de dados da sua conta e não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 rounded-full border border-[#D8CFBE] text-xs sm:text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full bg-[#96551F] text-[#FDFAF4] text-xs sm:text-sm font-semibold hover:bg-[#7D4518]"
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
