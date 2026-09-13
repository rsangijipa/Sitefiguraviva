/**
 * @license
 * Instituto Figura Viva - Histórico Privado do Aluno (Registro Confluência)
 * "Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta."
 * Botões "Exportar meus registros" e "Excluir registro" com confirmação.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PauseSessionRecord, InteractiveResourceEntry, UserProfile } from '../../types';
import { supabaseClient } from '../../services/supabase/client';
import { Clock, Shield, Trash2, Download, AlertCircle, FileText, Waves, CheckCircle2, X } from 'lucide-react';

interface StudentHistoryViewProps {
  currentUser: UserProfile;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ currentUser }) => {
  const [pauseSessions, setPauseSessions] = useState<PauseSessionRecord[]>([]);
  const [riverEntries, setRiverEntries] = useState<InteractiveResourceEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'pause' | 'river'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'pause' | 'river'; title: string } | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const pauses = await supabaseClient.getPauseSessionsForCurrentUser();
    const rivers = await supabaseClient.getRiverEntriesForCurrentUser();
    setPauseSessions(pauses);
    setRiverEntries(rivers);
    setIsLoading(false);
  }, []);

  // Escuta barramento reativo em tempo real para atualizações instantâneas
  useEffect(() => {
    loadData();

    const unsubPause = supabaseClient.subscribe('pause_sessions', () => {
      loadData();
    });
    const unsubRiver = supabaseClient.subscribe('interactive_entries', () => {
      loadData();
    });

    return () => {
      unsubPause();
      unsubRiver();
    };
  }, [loadData, currentUser]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'pause') {
      await supabaseClient.deletePauseSession(itemToDelete.id);
    } else {
      await supabaseClient.deleteRiverEntry(itemToDelete.id);
    }

    setDeleteFeedback(`O registro "${itemToDelete.title}" foi excluído com sucesso.`);
    setItemToDelete(null);
    loadData();

    setTimeout(() => {
      setDeleteFeedback(null);
    }, 4000);
  };

  const handleExport = async () => {
    const data = await supabaseClient.exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_privado_figura_viva_${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.json`;
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

  const totalItems = pauseSessions.length + riverEntries.length;

  return (
    <div id="student-history-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-left">
      {/* Cabeçalho do Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
            Privacidade Garantida por RLS
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#005A1F] mt-1">
            Meu Histórico Privado
          </h2>
          <p className="text-sm text-[#4B4B49] mt-1">
            Registros de pausas e observações salvas voluntariamente por {currentUser.name}.
          </p>
        </div>

        {totalItems > 0 && (
          <button
            id="btn-export-data"
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] transition-colors text-sm font-medium min-h-[44px] self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Exportar meus registros</span>
          </button>
        )}
      </div>

      {/* Aviso mandatório sobre privacidade */}
      <div className="p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-3 mb-6 text-xs text-[#262B22]">
        <Shield className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="font-semibold text-[#005A1F]">
            Este registro fica no seu histórico privado.
          </p>
          <p className="text-[#4B4B49] mt-0.5">
            Professores e outros alunos não têm acesso por esta ferramenta. Não há compartilhamento de observações íntimas com a administração.
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

      {/* Filtros de Tipo */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#D8CFBE] pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium min-h-[38px] transition-colors ${
            filter === 'all'
              ? 'bg-[#005A1F] text-[#FDFAF4]'
              : 'bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          Todos ({totalItems})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pause')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium min-h-[38px] transition-colors ${
            filter === 'pause'
              ? 'bg-[#005A1F] text-[#FDFAF4]'
              : 'bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          Sala de Pausa ({pauseSessions.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('river')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium min-h-[38px] transition-colors ${
            filter === 'river'
              ? 'bg-[#005A1F] text-[#FDFAF4]'
              : 'bg-[#FDFAF4] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          Rio dos Pensamentos ({riverEntries.length})
        </button>
      </div>

      {/* Listagem dos Registros */}
      {isLoading ? (
        <div className="py-12 text-center text-[#6B6B63]">
          <p className="text-sm font-medium">Carregando histórico...</p>
        </div>
      ) : totalItems === 0 ? (
        <div 
          id="history-empty-state"
          className="bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-10 text-center"
        >
          <FileText className="w-12 h-12 text-[#6B6B63]/40 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-serif font-bold text-xl text-[#005A1F]">
            Você ainda não guardou registros aqui.
          </h3>
          <p className="text-sm text-[#6B6B63] mt-2 max-w-sm mx-auto">
            Ao finalizar uma pausa na Sala de Pausa ou no Rio dos Pensamentos, você poderá optar voluntariamente por salvar no seu histórico.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Sessões da Sala de Pausa */}
          {(filter === 'all' || filter === 'pause') &&
            pauseSessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#FDFAF4] border-2 border-[#D8CFBE] hover:border-[#005A1F] rounded-[20px] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#005A1F]" />
                    <span className="text-xs font-bold text-[#005A1F] uppercase tracking-wider">
                      Sala de Pausa • {session.practice_title}
                    </span>
                    <span className="text-xs text-[#6B6B63]">• {formatDate(session.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#4B4B49] mt-1">
                    <span>
                      Duração ativa: <strong>{formatDuration(session.active_duration_seconds)}</strong>
                    </span>
                    <span>
                      Modo de término: {session.ended_by === 'timer' ? 'tempo planejado' : 'encerramento voluntário'}
                    </span>
                  </div>

                  {session.reflection && (
                    <p className="text-sm text-[#262B22] mt-2.5 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE] italic">
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
                        type: 'pause',
                        title: `Pausa com ${session.practice_title}`,
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

          {/* Entradas do Rio dos Pensamentos */}
          {(filter === 'all' || filter === 'river') &&
            riverEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#FDFAF4] border-2 border-[#07614C] rounded-[20px] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#07614C]" />
                    <span className="text-xs font-bold text-[#07614C] uppercase tracking-wider">
                      Rio dos Pensamentos
                    </span>
                    <span className="text-xs text-[#6B6B63]">• {formatDate(entry.created_at)}</span>
                  </div>

                  <p className="text-sm text-[#262B22] mt-2 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE]">
                    {entry.payload.reflection}
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      setItemToDelete({
                        id: entry.id,
                        type: 'river',
                        title: 'Observação no Rio',
                      })
                    }
                    className="p-2 rounded-xl text-[#6B6B63] hover:text-[#96551F] hover:bg-[#F1E9DB] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Excluir este registro"
                    aria-label="Excluir registro do Rio"
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
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] p-6 max-w-md w-full shadow-xl text-left">
            <div className="flex items-center gap-3 mb-3 text-[#96551F]">
              <AlertCircle className="w-6 h-6" strokeWidth={2} />
              <h3 id="delete-dialog-title" className="font-serif font-bold text-lg text-[#96551F]">
                Confirmar exclusão
              </h3>
            </div>
            <p className="text-sm text-[#4B4B49] mb-6 leading-relaxed">
              Tem certeza de que deseja remover permanentemente o registro de <strong>"{itemToDelete.title}"</strong>? Esta ação não pode ser desfeita no seu histórico ativo.
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
