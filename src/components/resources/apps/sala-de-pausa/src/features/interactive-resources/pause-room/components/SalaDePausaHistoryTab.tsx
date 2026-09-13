/**
 * @license
 * Instituto Figura Viva - Histórico Privado da Sala de Pausa (Registro Confluência)
 * Apresentação das sessões voluntárias de pausa do aluno com isolamento RLS, exportação e exclusão.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PauseSessionRecord, UserProfile } from '../../../../types';
import { supabaseClient } from '../../../../services/supabase/client';
import { Clock, Shield, Trash2, Download, AlertCircle, FileText, CheckCircle2, X, Sparkles } from 'lucide-react';

interface SalaDePausaHistoryTabProps {
  currentUser: UserProfile;
  onSelectPracticeToStart?: (practiceId: any) => void;
}

export const SalaDePausaHistoryTab: React.FC<SalaDePausaHistoryTabProps> = ({
  currentUser,
  onSelectPracticeToStart,
}) => {
  const [pauseSessions, setPauseSessions] = useState<PauseSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const pauses = await supabaseClient.getPauseSessionsForCurrentUser();
    setPauseSessions(pauses);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const unsub = supabaseClient.subscribe('pause_sessions', () => {
      loadData();
    });

    return () => {
      unsub();
    };
  }, [loadData, currentUser]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    await supabaseClient.deletePauseSession(itemToDelete.id);
    setDeleteFeedback(`O registro da pausa "${itemToDelete.title}" foi excluído com sucesso.`);
    setItemToDelete(null);
    loadData();

    setTimeout(() => {
      setDeleteFeedback(null), 4000;
    });
  };

  const handleExport = async () => {
    const data = await supabaseClient.exportUserData();
    const pauseOnlyData = {
      aluno: currentUser.name,
      perfil_id: currentUser.id,
      exportado_em: new Date().toISOString(),
      politica_privacidade: 'RLS isolada por usuário',
      sessoes_sala_de_pausa: data.pauseSessions,
    };
    const blob = new Blob([JSON.stringify(pauseOnlyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_sala_de_pausa_${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    if (remainingSec === 0) return `${mins} min`;
    return `${mins} min ${remainingSec}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Cálculo de estatísticas agregadas de acolhimento
  const totalSeconds = pauseSessions.reduce((acc, s) => acc + (s.active_duration_seconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <div id="sala-de-pausa-history-tab" className="w-full max-w-4xl mx-auto py-4 sm:py-6 text-left">
      {/* Cabeçalho do Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
            Registro Privado do Aluno
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#005A1F] mt-1">
            Meu Histórico na Sala de Pausa
          </h2>
          <p className="text-sm text-[#4B4B49] mt-1">
            Pausas salvas voluntariamente por {currentUser.name}.
          </p>
        </div>

        {pauseSessions.length > 0 && (
          <button
            id="btn-export-pause-history"
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] transition-colors text-xs sm:text-sm font-semibold min-h-[44px] self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Exportar registros</span>
          </button>
        )}
      </div>

      {/* Cartões de Resumo e Métricas Calmas */}
      {pauseSessions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96551F] block">
              Pausas Acolhidas
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#005A1F] mt-1 block">
              {pauseSessions.length}
            </span>
          </div>

          <div className="bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96551F] block">
              Tempo de Presença
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#005A1F] mt-1 block">
              {totalMinutes} <span className="text-sm font-sans font-normal text-[#4B4B49]">min</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96551F] block">
              Privacidade RLS
            </span>
            <span className="text-xs font-semibold text-[#07614C] mt-1 block flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#07614C]" />
              <span>Isolado por aluno</span>
            </span>
          </div>
        </div>
      )}

      {/* Aviso de Privacidade */}
      <div className="p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-3 mb-6 text-xs text-[#262B22]">
        <Shield className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="font-semibold text-[#005A1F]">
            Este registro fica exclusivamente no seu histórico privado.
          </p>
          <p className="text-[#4B4B49] mt-0.5 leading-relaxed">
            Professores, coordenadores e outros alunos não têm acesso a essas anotações. Você tem autonomia total para excluir qualquer registro a qualquer momento.
          </p>
        </div>
      </div>

      {/* Feedback de Exclusão */}
      {deleteFeedback && (
        <div className="p-3.5 bg-[#FDFAF4] border-2 border-[#005A1F] rounded-xl text-xs text-[#005A1F] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#005A1F]" />
            <span>{deleteFeedback}</span>
          </div>
          <button type="button" onClick={() => setDeleteFeedback(null)}>
            <X className="w-4 h-4 text-[#6B6B63]" />
          </button>
        </div>
      )}

      {/* Listagem dos Registros */}
      {isLoading ? (
        <div className="py-12 text-center text-[#6B6B63]">
          <p className="text-sm font-medium">Carregando histórico privado...</p>
        </div>
      ) : pauseSessions.length === 0 ? (
        <div 
          id="pause-history-empty"
          className="bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-8 sm:p-12 text-center"
        >
          <FileText className="w-12 h-12 text-[#6B6B63]/40 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-serif font-bold text-xl text-[#005A1F]">
            Nenhuma pausa guardada ainda.
          </h3>
          <p className="text-sm text-[#6B6B63] mt-2 max-w-sm mx-auto leading-relaxed">
            Ao finalizar uma prática de pausa na Sala de Pausa, você terá a opção voluntária de salvar uma anotação aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {pauseSessions.map((session) => (
            <div
              key={session.id}
              className="bg-[#FDFAF4] border-2 border-[#D8CFBE] hover:border-[#005A1F] rounded-[20px] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005A1F]" />
                  <span className="text-xs font-bold text-[#005A1F] uppercase tracking-wider">
                    {session.practice_title}
                  </span>
                  <span className="text-xs text-[#6B6B63]">• {formatDate(session.created_at)}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#4B4B49] mt-1">
                  <span>
                    Duração: <strong>{formatDuration(session.active_duration_seconds)}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {session.ended_by === 'timer' ? 'tempo planejado concluído' : 'encerramento voluntário'}
                  </span>
                </div>

                {session.reflection && (
                  <p className="text-sm text-[#262B22] mt-2.5 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE] italic leading-relaxed">
                    "{session.reflection}"
                  </p>
                )}
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    setItemToDelete({
                      id: session.id,
                      title: session.practice_title,
                    })
                  }
                  className="p-2 rounded-xl text-[#6B6B63] hover:text-[#96551F] hover:bg-[#F1E9DB] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Excluir este registro"
                  aria-label={`Excluir registro de ${session.practice_title}`}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Acessível de Confirmação de Exclusão */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-[#262B22]/40 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-pause-title"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] p-6 max-w-md w-full shadow-xl text-left">
            <div className="flex items-center gap-3 mb-3 text-[#96551F]">
              <AlertCircle className="w-6 h-6" strokeWidth={2} />
              <h3 id="delete-pause-title" className="font-serif font-bold text-lg text-[#96551F]">
                Excluir registro de pausa?
              </h3>
            </div>
            <p className="text-sm text-[#4B4B49] mb-6 leading-relaxed">
              Tem certeza de que deseja remover permanentemente o registro de <strong>"{itemToDelete.title}"</strong>? Esta ação é definitiva para este registro.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#96551F] text-[#FDFAF4] hover:bg-[#96551F]/90 min-h-[44px]"
              >
                Excluir registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
