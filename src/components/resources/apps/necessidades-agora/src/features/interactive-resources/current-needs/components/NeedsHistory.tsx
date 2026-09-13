/**
 * NeedsHistory - Histórico Privado de Registros de Necessidades
 *
 * RLS restrita por usuário.
 * Permite listar registros passados, exportar dados pessoais (JSON) e excluir registros
 * com diálogo de confirmação claro.
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Trash2,
  Download,
  ShieldCheck,
  Star,
  Clock,
  AlertCircle,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { CurrentNeedsRepository } from '../repository';
import { NeedRecord } from '../types';

interface NeedsHistoryProps {
  userId: string;
  onBackToExperience: () => void;
  onNewExperience: () => void;
}

export const NeedsHistory: React.FC<NeedsHistoryProps> = ({
  userId,
  onBackToExperience,
  onNewExperience,
}) => {
  const [records, setRecords] = useState<NeedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordToDelete, setRecordToDelete] = useState<NeedRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await CurrentNeedsRepository.listRecords(userId);
      setRecords(data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const handleExportData = async () => {
    try {
      const jsonStr = await CurrentNeedsRepository.exportOwnData(userId);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figura-viva-necessidades-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionMessage('Arquivo exportado com sucesso.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await CurrentNeedsRepository.deleteRecord(userId, recordToDelete.id);
      setRecordToDelete(null);
      await loadHistory();
      setActionMessage('Registro removido do seu histórico.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Erro ao excluir:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="needs-history-view"
      className="max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 text-left"
    >
      {/* Cabeçalho do Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-[#D8CFBE]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={onBackToExperience}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005A1F] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-2" />
              <span>Voltar ao exercício</span>
            </button>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#005A1F]">
            Seu Histórico Privado
          </h2>
          <p className="text-xs sm:text-sm text-[#4B4B49] mt-1">
            Registros de observação de necessidades guardados por você.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button
              id="btn-export-records"
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#262B22] bg-[#F1E9DB] hover:bg-[#D8CFBE] border border-[#D8CFBE] transition-colors min-h-[44px]"
              title="Baixar arquivo JSON com todos os seus registros"
            >
              <Download className="w-4 h-4 stroke-2" />
              <span>Exportar meus registros</span>
            </button>
          )}

          <button
            id="btn-new-needs-session"
            type="button"
            onClick={onNewExperience}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-2" />
            <span>Nova observação</span>
          </button>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {actionMessage && (
        <div
          role="status"
          className="mb-6 p-3 rounded-[16px] bg-[#F1E9DB] border border-[#005A1F] text-xs sm:text-sm font-medium text-[#005A1F]"
        >
          {actionMessage}
        </div>
      )}

      {/* Aviso de Privacidade Rigorosa */}
      <div className="mb-6 p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-3 text-xs text-[#4B4B49]">
        <ShieldCheck className="w-5 h-5 stroke-2 text-[#005A1F] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#005A1F]">Privacidade protegida:</strong> Este
          registro fica exclusivamente no seu histórico privado. Professores, tutores
          e outros alunos não têm acesso por esta ferramenta.
        </div>
      </div>

      {/* Lista de Registros */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#6B6B63]">
          Carregando seus registros...
        </div>
      ) : records.length === 0 ? (
        <div
          id="history-empty-state"
          className="rounded-[24px] border-2 border-dashed border-[#D8CFBE] p-8 sm:p-12 text-center bg-[#FDFAF4]"
        >
          <Calendar className="w-10 h-10 stroke-2 text-[#96551F] mx-auto mb-3 opacity-70" />
          <h3 className="font-heading text-lg font-bold text-[#005A1F] mb-1">
            Você ainda não guardou registros aqui.
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6B63] max-w-sm mx-auto mb-6">
            Quando sentir necessidade de notar o que está presente, experimente uma
            sessão e escolha "Salvar" ao finalizar.
          </p>
          <button
            type="button"
            onClick={onNewExperience}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
          >
            Fazer uma observação agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] hover:border-[#96551F] p-5 sm:p-6 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D8CFBE]/60">
                <div className="flex items-center gap-2 text-xs text-[#6B6B63]">
                  <Clock className="w-3.5 h-3.5 stroke-2" />
                  <span>{formatDate(rec.createdAt)}</span>
                  <span className="text-[#D8CFBE]">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] font-medium">
                    {rec.state === 'unsure'
                      ? 'Indefinição acolhida'
                      : rec.ordered
                      ? 'Ordenada por presença'
                      : 'Suas escolhas'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setRecordToDelete(rec)}
                  className="inline-flex items-center gap-1 text-xs text-[#96551F] hover:text-[#262B22] p-1.5 rounded-md hover:bg-[#F1E9DB] transition-colors min-h-[36px]"
                  title="Excluir este registro"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-2" />
                  <span>Excluir</span>
                </button>
              </div>

              {/* Itens do registro */}
              {rec.state === 'unsure' ? (
                <p className="text-sm text-[#262B22] italic mb-3">
                  "Ainda não sei" — Respeitou o momento de não ter clareza imediata.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {rec.entries.map((item, idx) => {
                    const isFocus = rec.focusEntryId === item.entryId;
                    return (
                      <span
                        key={item.entryId}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          isFocus
                            ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F] font-bold'
                            : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#262B22]'
                        }`}
                      >
                        {rec.ordered && (
                          <span className="text-[#96551F] font-bold">{idx + 1}.</span>
                        )}
                        {item.labelSnapshot}
                        {isFocus && <Star className="w-3 h-3 fill-current text-[#96551F]" />}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Gesto anotado */}
              {rec.smallStep && (
                <div className="pt-3 border-t border-[#D8CFBE]/60 text-xs text-[#4B4B49]">
                  <strong className="text-[#07614C]">Pequeno gesto anotado:</strong>{' '}
                  <span className="italic">"{rec.smallStep}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão com Descrição do Item */}
      {recordToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
        >
          <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#96551F] p-6 max-w-md w-full text-left">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center shrink-0 text-[#96551F]">
                <AlertCircle className="w-5 h-5 stroke-2" />
              </div>
              <div>
                <h3
                  id="delete-dialog-title"
                  className="font-heading text-lg font-bold text-[#005A1F]"
                >
                  Excluir registro?
                </h3>
                <p className="text-sm text-[#4B4B49] mt-1 leading-relaxed">
                  Esta ação removerá permanentemente o registro de{' '}
                  <strong>{formatDate(recordToDelete.createdAt)}</strong> com{' '}
                  {recordToDelete.state === 'unsure'
                    ? 'indefinição acolhida'
                    : `${recordToDelete.entries.length} necessidade(s)`}
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-6 pt-4 border-t-2 border-[#D8CFBE]">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold bg-[#96551F] text-[#FDFAF4] hover:bg-[#784318] transition-colors min-h-[44px]"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
