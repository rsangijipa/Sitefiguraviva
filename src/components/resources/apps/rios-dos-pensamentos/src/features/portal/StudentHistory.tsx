/**
 * Histórico Privado do Aluno - Portal do Aluno
 * Aplica RLS estrito: o aluno visualiza e gerencia apenas suas próprias sessões salvas.
 */

import React, { useState, useEffect } from 'react';
import { RiverSession, UserProfile } from '../../types';
import { listUserRiverSessions, deleteRiverSession, exportUserData } from '../interactive-resources/thought-river/repository';
import { ArrowLeft, Trash2, Download, ShieldCheck, Clock, Calendar, AlertCircle } from 'lucide-react';

interface StudentHistoryProps {
  currentUser: UserProfile;
  onBackToCatalog: () => void;
  onOpenResource: (slug: string) => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({
  currentUser,
  onBackToCatalog,
  onOpenResource,
}) => {
  const [sessions, setSessions] = useState<RiverSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    const { sessions: list } = await listUserRiverSessions(currentUser);
    setSessions(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir este registro do seu histórico privado? Esta ação não poderá ser desfeita.');
    if (!confirmDelete) return;

    setDeletingId(id);
    const res = await deleteRiverSession(id, currentUser);
    if (res.success) {
      setMessage('Registro excluído com sucesso do seu histórico.');
      await fetchSessions();
    } else {
      setMessage('Erro ao excluir: ' + (res.error || 'ação não permitida.'));
    }
    setDeletingId(null);
  };

  const handleExport = async () => {
    const { data } = await exportUserData(currentUser);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-historico-figura-viva-${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Exportação realizada com sucesso.');
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#D8CFBE]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] text-[#262B22] text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span>Recursos</span>
          </button>

          <div>
            <h1 className="font-['Fraunces'] text-2xl sm:text-3xl font-bold text-[#005A1F]">
              Meu Histórico Privado
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B63]">
              Perfil ativo: <strong className="text-[#262B22]">{currentUser.name}</strong> ({currentUser.email || 'Visitante'})
            </p>
          </div>
        </div>

        {sessions.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[16px] border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            <span>Exportar meus dados</span>
          </button>
        )}
      </div>

      {/* Mensagem de privacidade e RLS */}
      <div className="p-4 rounded-[16px] bg-[#F1E9DB]/70 border-2 border-[#D8CFBE] flex items-start gap-3 text-xs sm:text-sm text-[#262B22]">
        <ShieldCheck className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="font-medium text-[#005A1F]">Garantia de Privacidade do Instituto Figura Viva</p>
          <p className="text-xs text-[#6B6B63] mt-0.5 leading-relaxed">
            Este histórico fica restrito exclusivamente ao seu usuário autenticado. Professores, coordenadores e outros alunos não têm acesso a essas notas por nenhuma ferramenta do portal.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-[12px] bg-[#F1E9DB] border border-[#005A1F] text-xs text-[#005A1F] flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="underline cursor-pointer ml-2">Fechar</button>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#6B6B63]">
          Carregando seus registros protegidos...
        </div>
      ) : sessions.length === 0 ? (
        <div className="card-confluencia p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto">
          <p className="font-['Fraunces'] text-lg sm:text-xl text-[#005A1F] font-semibold">
            Você ainda não guardou registros aqui
          </p>
          <p className="text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
            Ao praticar no Rio dos Pensamentos, você tem a opção de guardar uma nota ao encerrar. Se preferir apenas vivenciar o fluxo sem salvar, essa escolha é totalmente acolhida.
          </p>
          <button
            type="button"
            onClick={() => onOpenResource('rio-dos-pensamentos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] text-sm font-medium transition-colors cursor-pointer"
          >
            Praticar no Rio dos Pensamentos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#6B6B63]">
            Exibindo <strong>{sessions.length}</strong> registro{sessions.length > 1 ? 's' : ''} guardado{sessions.length > 1 ? 's' : ''} sob seu usuário:
          </p>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="card-confluencia p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#FDFAF4]"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1E9DB] text-[#005A1F] border border-[#D8CFBE]">
                      Rio dos Pensamentos
                    </span>
                    <span className="text-xs text-[#6B6B63] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
                      {new Date(session.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-[#6B6B63] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
                      Duração: {formatDuration(session.active_duration_seconds)}
                    </span>
                  </div>

                  {session.reflection ? (
                    <div className="p-3.5 rounded-[16px] bg-[#F1E9DB]/50 border border-[#D8CFBE] text-sm text-[#262B22] leading-relaxed">
                      <p className="text-xs font-semibold text-[#96551F] mb-1">Nota pessoal de reflexão:</p>
                      <p className="italic">"{session.reflection}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B6B63] italic">
                      Sessão guardada sem anotação textual complementar.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(session.id)}
                  disabled={deletingId === session.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[12px] border border-[#96551F]/40 text-xs font-medium text-[#96551F] hover:bg-[#F1E9DB] self-end sm:self-start transition-colors cursor-pointer"
                  aria-label="Excluir este registro"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                  <span>Excluir</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
