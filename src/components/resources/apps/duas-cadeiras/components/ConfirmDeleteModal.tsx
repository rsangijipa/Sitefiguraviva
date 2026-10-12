import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Apagar sessão?",
  description = "Esta ação é definitiva. Todas as falas registradas nesta sessão serão removidas permanentemente do seu dispositivo.",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 "
    >
      <div className="w-full max-w-md rounded-2xl bg-paper p-6  border border-nevoa space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-mata hover:text-mata p-1 rounded-lg hover:bg-paper transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3
            id="delete-modal-title"
            className="text-base font-semibold text-mata"
          >
            {title}
          </h3>
          <p className="text-xs text-mata mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-paper p-3 border border-nevoa/70 text-[11px] text-mata">
          <strong>Garantia de privacidade:</strong> Uma vez apagada, nenhum
          registro remanescente existirá em nenhum servidor ou banco de dados.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            id="btn-cancel-delete"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-mata hover:bg-paper transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-paper  transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sim, apagar definitivamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
