import React, { useState, useEffect } from 'react';
import { PersistedThoughtRecord } from '../types';
import {
  listUserThoughts,
  deleteThoughtRecord,
  updateThoughtRecord,
  exportUserRecords,
} from '../repository';
import {
  Bookmark,
  Search,
  Download,
  Trash2,
  Edit3,
  ArrowLeft,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { validateThoughtText, validateOptionalTitle } from '../schema';

interface SavedThoughtsListProps {
  userId: string;
  onBackToGarden: () => void;
  onBackToPortal: () => void;
}

export const SavedThoughtsList: React.FC<SavedThoughtsListProps> = ({
  userId,
  onBackToGarden,
  onBackToPortal,
}) => {
  const [thoughts, setThoughts] = useState<PersistedThoughtRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Estados para edição
  const [editingRecord, setEditingRecord] = useState<PersistedThoughtRecord | null>(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Estados para exclusão
  const [recordToDelete, setRecordToDelete] = useState<PersistedThoughtRecord | null>(null);

  const loadThoughts = async () => {
    setIsLoading(true);
    try {
      const records = await listUserThoughts(userId, { query: searchQuery });
      setThoughts(records);
    } catch {
      setNotification('Não foi possível carregar os pensamentos guardados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThoughts();
  }, [userId, searchQuery]);

  const handleExport = async (format: 'csv' | 'txt' | 'json') => {
    try {
      const exported = await exportUserRecords(userId, format);
      const blob = new Blob([exported.content], { type: exported.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exported.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotification(`Histórico exportado com sucesso em .${format}`);
    } catch {
      setNotification('Erro ao exportar registros.');
    }
  };

  const handleStartEdit = (record: PersistedThoughtRecord) => {
    setEditingRecord(record);
    setEditText(record.text);
    setEditTitle(record.optional_title || '');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const valText = validateThoughtText(editText);
    if (!valText.isValid || !valText.data) {
      setEditError(valText.error || 'Texto inválido.');
      return;
    }

    const valTitle = validateOptionalTitle(editTitle);
    if (!valTitle.isValid) {
      setEditError(valTitle.error || 'Título inválido.');
      return;
    }

    try {
      await updateThoughtRecord(userId, editingRecord.id, {
        text: valText.data,
        optional_title: valTitle.data,
      });
      setEditingRecord(null);
      setNotification('Registro atualizado com sucesso no seu histórico.');
      await loadThoughts();
    } catch {
      setEditError('Não foi possível salvar as alterações.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteThoughtRecord(userId, recordToDelete.id);
      setRecordToDelete(null);
      setNotification('Registro excluído permanentemente do seu histórico privado.');
      await loadThoughts();
    } catch {
      setNotification('Erro ao excluir registro.');
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#FDFAF4] text-[#262B22] flex flex-col">
      {/* Cabeçalho */}
      <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToGarden}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#005A1F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2px]" />
              <span>Voltar ao Jardim</span>
            </button>

            <div className="h-5 w-[2px] bg-[#D8CFBE]" />

            <div>
              <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wider block">
                Histórico Privado
              </span>
              <h1 className="text-lg sm:text-xl font-bold font-fraunces text-[#005A1F]">
                Pensamentos Guardados
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPortal}
            className="text-xs font-medium text-[#6B6B63] hover:text-[#262B22] px-3 py-2"
          >
            Ir ao Portal
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Aviso de Privacidade Rigorosa */}
        <div className="mb-6 p-4 bg-[#F1E9DB]/60 border-2 border-[#D8CFBE] rounded-[24px] flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#005A1F] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
            <p className="font-semibold text-[#005A1F] mb-0.5">Privacidade do Aluno</p>
            <p>
              Estes registros ficam no seu histórico privado. Professores e outros alunos não têm acesso a estas anotações por esta ferramenta.
            </p>
          </div>
        </div>

        {/* Notificação Temporária */}
        {notification && (
          <div
            role="status"
            className="mb-4 p-3 bg-[#F1E9DB] border border-[#005A1F] rounded-xl flex items-center justify-between text-xs text-[#005A1F]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold hover:underline ml-2"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Barra de Ações: Busca + Exportação */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Busca Privada */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B6B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em pensamentos guardados..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-full focus:border-[#005A1F] text-[#262B22] placeholder:text-[#6B6B63]/60 min-h-[44px]"
            />
          </div>

          {/* Menus de Exportação Própria Segura */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6B6B63] hidden md:inline">
              Exportar meus registros:
            </span>
            <button
              type="button"
              onClick={() => handleExport('txt')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#005A1F] bg-[#FDFAF4] hover:bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-full min-h-[44px]"
              title="Exportar em texto simples"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#005A1F] bg-[#FDFAF4] hover:bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-full min-h-[44px]"
              title="Exportar em CSV (protegido contra fórmulas)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#005A1F] bg-[#FDFAF4] hover:bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-full min-h-[44px]"
              title="Exportar em JSON estruturado"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Lista de Registros */}
        {isLoading ? (
          <div className="text-center py-12 text-[#6B6B63] text-sm">
            Carregando histórico...
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#F1E9DB]/30 border-2 border-dashed border-[#D8CFBE] rounded-[24px]">
            <Bookmark className="w-8 h-8 text-[#96551F] mx-auto mb-3" />
            <h2 className="text-lg font-bold font-fraunces text-[#005A1F] mb-1">
              Você ainda não guardou registros aqui
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B63] max-w-sm mx-auto mb-6">
              Quando você escolhe &ldquo;Guardar no meu histórico&rdquo; no Jardim de Pensamentos, suas folhas ficam salvas aqui para releitura pessoal.
            </p>
            <button
              type="button"
              onClick={onBackToGarden}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005A1F] text-[#FDFAF4] rounded-full hover:bg-[#07614C] transition-colors min-h-[44px]"
            >
              <span>Ir para o Jardim</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughts.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] flex flex-col justify-between hover:border-[#005A1F] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#D8CFBE]">
                    <span className="text-xs font-bold text-[#96551F] truncate">
                      {item.optional_title || 'Pensamento'}
                    </span>
                    <span className="text-[11px] text-[#6B6B63] flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-sm text-[#262B22] leading-relaxed whitespace-pre-wrap break-words font-sans">
                    {item.text}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#D8CFBE]">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#005A1F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[36px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordToDelete(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#96551F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[36px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {recordToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="fixed inset-0 z-50 bg-[#262B22]/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] text-[#96551F] flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 id="delete-dialog-title" className="text-lg font-bold font-fraunces text-[#96551F] mb-2">
                Excluir pensamento do histórico?
              </h3>
              <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed mb-6">
                Este registro será removido permanentemente do seu histórico privado. Não é possível recuperá-lo.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-[#6B6B63] hover:text-[#262B22] min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 text-xs font-medium bg-[#96551F] text-[#FDFAF4] rounded-full hover:bg-[#7a4214] min-h-[44px]"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Registro Guardado */}
        {editingRecord && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
            className="fixed inset-0 z-50 bg-[#262B22]/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <form
              onSubmit={handleSaveEdit}
              className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] max-w-lg w-full p-6 flex flex-col gap-4"
            >
              <h3 id="edit-dialog-title" className="text-lg font-bold font-fraunces text-[#005A1F]">
                Editar Pensamento Guardado
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={80}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] text-[#262B22]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#005A1F] uppercase">
                    Pensamento
                  </label>
                  <span className="text-xs text-[#6B6B63]">
                    {editText.trim().length} / 500
                  </span>
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
                  className="w-full p-3 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-2xl focus:border-[#005A1F] text-[#262B22] resize-none leading-relaxed"
                  required
                />
              </div>

              {editError && (
                <p className="text-xs text-[#96551F] bg-[#F1E9DB] p-2 rounded-xl border border-[#96551F]">
                  {editError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-medium text-[#6B6B63]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#005A1F] text-[#FDFAF4] rounded-full hover:bg-[#07614C]"
                >
                  Atualizar Registro
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
