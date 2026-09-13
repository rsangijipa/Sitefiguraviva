import React, { useState } from 'react';
import { GardenLeaf } from '../types';
import { THOUGHT_LIMITS, validateThoughtText, validateOptionalTitle } from '../schema';
import {
  Bookmark,
  Wind,
  Trash2,
  Edit3,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface LeafActionsProps {
  leaf: GardenLeaf;
  onClose: () => void;
  onSaveToHistory: (leaf: GardenLeaf) => Promise<void>;
  onFloatLeaf: (leafId: string) => void;
  onLandLeaf: (leafId: string) => void;
  onRemoveFromSession: (leafId: string) => void;
  onDeleteFromHistory: (savedRecordId: string, leafId: string) => Promise<void>;
  onUpdateLeaf: (leafId: string, text: string, optionalTitle?: string | null) => Promise<void>;
  isSaving: boolean;
  reducedMotion: boolean;
}

export const LeafActions: React.FC<LeafActionsProps> = ({
  leaf,
  onClose,
  onSaveToHistory,
  onFloatLeaf,
  onLandLeaf,
  onRemoveFromSession,
  onDeleteFromHistory,
  onUpdateLeaf,
  isSaving,
  reducedMotion,
}) => {
  // Estados para diálogos de confirmação explícita
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Cópia temporária para edição (cancelar preserva original intacto)
  const [tempText, setTempText] = useState(leaf.text);
  const [tempTitle, setTempTitle] = useState(leaf.optional_title || '');
  const [editError, setEditError] = useState<string | null>(null);

  const isSaved = Boolean(leaf.savedRecordId);

  const handleSaveConfirm = async () => {
    await onSaveToHistory(leaf);
    setShowSaveConfirm(false);
  };

  const handleRemoveConfirm = () => {
    onRemoveFromSession(leaf.id);
    setShowRemoveConfirm(false);
    onClose();
  };

  const handleDeleteConfirm = async () => {
    if (leaf.savedRecordId) {
      await onDeleteFromHistory(leaf.savedRecordId, leaf.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const textVal = validateThoughtText(tempText);
    if (!textVal.isValid || !textVal.data) {
      setEditError(textVal.error || 'Texto inválido.');
      return;
    }

    const titleVal = validateOptionalTitle(tempTitle);
    if (!titleVal.isValid) {
      setEditError(titleVal.error || 'Título inválido.');
      return;
    }

    await onUpdateLeaf(leaf.id, textVal.data, titleVal.data);
    setIsEditing(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaf-detail-title"
      className="p-5 sm:p-6 flex flex-col h-full bg-[#FDFAF4] overflow-y-auto select-text"
    >
      {/* Cabeçalho do Drawer/Modal da Folha */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-[#D8CFBE] mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`w-5 h-5 stroke-[2px] shrink-0 ${
              isSaved ? 'text-[#07614C]' : 'text-[#96551F]'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6" />
          </svg>
          <h2
            id="leaf-detail-title"
            className="text-base sm:text-lg font-bold font-fraunces text-[#005A1F] truncate"
          >
            {leaf.optional_title || 'Pensamento no Jardim'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Fechar detalhes da folha"
        >
          <X className="w-5 h-5 stroke-[2px]" />
        </button>
      </div>

      {/* Modo de Edição com Cópia Temporária */}
      {isEditing ? (
        <form onSubmit={handleUpdateSubmit} className="flex-1 flex flex-col gap-3">
          <div>
            <label
              htmlFor="edit-leaf-title"
              className="block text-xs font-semibold text-[#96551F] uppercase mb-1"
            >
              Título (opcional)
            </label>
            <input
              id="edit-leaf-title"
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              maxLength={THOUGHT_LIMITS.MAX_TITLE_LENGTH}
              className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] text-[#262B22]"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="edit-leaf-text"
                className="text-xs font-semibold text-[#005A1F] uppercase"
              >
                Texto
              </label>
              <span className="text-xs text-[#6B6B63]">
                {tempText.trim().length} / {THOUGHT_LIMITS.MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="edit-leaf-text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              rows={5}
              className="w-full flex-1 p-3 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-2xl focus:border-[#005A1F] text-[#262B22] resize-none leading-relaxed"
              required
            />
          </div>

          {editError && (
            <p className="text-xs text-[#96551F] bg-[#F1E9DB] p-2 rounded-xl border border-[#96551F]">
              {editError}
            </p>
          )}

          {isSaved && (
            <p className="text-xs text-[#6B6B63] bg-[#F1E9DB]/50 p-2.5 rounded-xl border border-[#D8CFBE]">
              Esta folha já está salva no seu histórico privado. Clique em &ldquo;Atualizar registro&rdquo; para sincronizar as alterações.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setTempText(leaf.text);
                setTempTitle(leaf.optional_title || '');
                setIsEditing(false);
              }}
              className="px-4 py-2 text-xs font-medium text-[#6B6B63] hover:text-[#262B22] min-h-[44px]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-medium text-[#FDFAF4] bg-[#005A1F] hover:bg-[#07614C] rounded-full min-h-[44px]"
            >
              {isSaved ? 'Atualizar registro' : 'Salvar nesta folha'}
            </button>
          </div>
        </form>
      ) : (
        /* Visualização Estável para Leitura & Ações */
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Status do Registro */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B6B63]">
                Pousada em {new Date(leaf.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>

              {isSaved ? (
                <span className="inline-flex items-center gap-1 text-[#005A1F] font-semibold bg-[#F1E9DB] px-2.5 py-1 rounded-full border border-[#D8CFBE]">
                  <Bookmark className="w-3.5 h-3.5 text-[#07614C]" />
                  <span>Guardado no Histórico</span>
                </span>
              ) : (
                <span className="text-[#96551F] font-medium">
                  Temporária nesta sessão
                </span>
              )}
            </div>

            {/* Conteúdo Completo da Folha (Renderizado com segurança, texto puro) */}
            <div className="p-4 bg-[#F1E9DB]/40 border-2 border-[#D8CFBE] rounded-[24px]">
              <p className="text-sm sm:text-base text-[#262B22] leading-relaxed whitespace-pre-wrap break-words font-sans">
                {leaf.text}
              </p>
            </div>

            {/* Status da flutuação */}
            {leaf.isFloating && (
              <div className="p-3 bg-[#F1E9DB] border border-[#D8CFBE] rounded-xl flex items-center justify-between text-xs text-[#07614C]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Wind className="w-4 h-4 text-[#005A1F]" />
                  <span>{reducedMotion ? 'Modo de observação estática' : 'Folha em flutuação suave'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onLandLeaf(leaf.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#FDFAF4] border border-[#005A1F] text-[#005A1F] rounded-full hover:bg-[#F1E9DB] font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Trazer de volta</span>
                </button>
              </div>
            )}
          </div>

          {/* Diálogo de Confirmação: Guardar no Histórico */}
          {showSaveConfirm && (
            <div className="mt-4 p-4 bg-[#FDFAF4] border-2 border-[#005A1F] rounded-2xl">
              <div className="flex items-start gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" />
                <h3 className="text-sm font-bold text-[#005A1F]">
                  Guardar no histórico privado?
                </h3>
              </div>
              <p className="text-xs text-[#262B22] leading-relaxed mb-4">
                Este registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-3 py-1.5 text-xs text-[#6B6B63] hover:text-[#262B22]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfirm}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-medium bg-[#005A1F] text-[#FDFAF4] rounded-full hover:bg-[#07614C] transition-colors"
                >
                  {isSaving ? 'Guardando...' : 'Confirmar e Guardar'}
                </button>
              </div>
            </div>
          )}

          {/* Diálogo de Confirmação: Retirar da Sessão / Retirar da Cena */}
          {showRemoveConfirm && (
            <div className="mt-4 p-4 bg-[#F1E9DB] border-2 border-[#96551F] rounded-2xl">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#96551F] shrink-0 mt-0.5" />
                <h3 className="text-sm font-bold text-[#96551F]">
                  {isSaved ? 'Retirar esta folha do jardim?' : 'Retirar desta sessão?'}
                </h3>
              </div>
              <p className="text-xs text-[#262B22] leading-relaxed mb-4">
                {isSaved
                  ? 'A folha sairá da cena do jardim, mas a cópia guardada permanece segura no seu histórico privado.'
                  : 'O texto desta folha não foi guardado e deixará esta sessão. Deseja realmente retirar?'}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-3 py-1.5 text-xs text-[#6B6B63] hover:text-[#262B22]"
                >
                  Continuar com a folha
                </button>
                <button
                  type="button"
                  onClick={handleRemoveConfirm}
                  className="px-4 py-2 text-xs font-medium bg-[#96551F] text-[#FDFAF4] rounded-full hover:bg-[#7a4214] transition-colors"
                >
                  Confirmar retirada
                </button>
              </div>
            </div>
          )}

          {/* Diálogo de Confirmação: Excluir do Histórico */}
          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-[#FDFAF4] border-2 border-[#96551F] rounded-2xl">
              <div className="flex items-start gap-2 mb-2">
                <Trash2 className="w-4 h-4 text-[#96551F] shrink-0 mt-0.5" />
                <h3 className="text-sm font-bold text-[#96551F]">
                  Excluir permanentemente do histórico?
                </h3>
              </div>
              <p className="text-xs text-[#262B22] leading-relaxed mb-4">
                Esta ação removerá o registro do seu banco privado. Não é possível desfazer após confirmação.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-[#6B6B63]"
                >
                  Manter no histórico
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-medium bg-[#96551F] text-[#FDFAF4] rounded-full hover:bg-[#7a4214]"
                >
                  Excluir registro
                </button>
              </div>
            </div>
          )}

          {/* Grupo de Ações Principais da Folha */}
          {!showSaveConfirm && !showRemoveConfirm && !showDeleteConfirm && (
            <div className="mt-6 pt-4 border-t border-[#D8CFBE] flex flex-col gap-2.5">
              {/* Botão Guardar no Histórico */}
              {!isSaved ? (
                <button
                  type="button"
                  onClick={() => setShowSaveConfirm(true)}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px]"
                >
                  <Bookmark className="w-4 h-4 stroke-[2px]" />
                  <span>Guardar no meu histórico</span>
                </button>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F1E9DB] border border-[#005A1F] rounded-full text-xs font-medium text-[#005A1F]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvo no seu histórico privado</span>
                </div>
              )}

              {/* Botão Observar Flutuar */}
              {!leaf.isFloating ? (
                <button
                  type="button"
                  onClick={() => onFloatLeaf(leaf.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] font-medium rounded-full border border-[#D8CFBE] transition-colors min-h-[44px]"
                >
                  <Wind className="w-4 h-4 stroke-[2px] text-[#005A1F]" />
                  <span>Observar flutuar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onLandLeaf(leaf.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#005A1F] font-medium rounded-full border border-[#005A1F] transition-colors min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2px]" />
                  <span>Trazer de volta ao canteiro</span>
                </button>
              )}

              {/* Botão Editar Folha */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-[#262B22] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[44px]"
              >
                <Edit3 className="w-4 h-4 stroke-[2px] text-[#96551F]" />
                <span>Editar texto desta folha</span>
              </button>

              {/* Botão Retirar da Sessão / Retirar da Cena */}
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-[#96551F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[44px]"
              >
                <Trash2 className="w-4 h-4 stroke-[2px]" />
                <span>{isSaved ? 'Retirar da cena' : 'Retirar desta sessão'}</span>
              </button>

              {/* Se for salva, opção explícita de Excluir do Histórico */}
              {isSaved && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] text-[#6B6B63] hover:text-[#96551F] hover:underline transition-colors min-h-[36px]"
                >
                  <span>Excluir do histórico permanente</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
