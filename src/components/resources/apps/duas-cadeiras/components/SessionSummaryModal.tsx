import React, { useState } from "react";
import { ReflectionSession } from "../types";
import {
  Download,
  Copy,
  Check,
  Printer,
  X,
  Bookmark,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { exportSessionToMarkdown } from "../utils/storage";

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ReflectionSession;
  onUpdateReflection: (reflection: string) => void;
  onSaveSession: () => void;
  onRequestDelete: () => void;
  onRestartNewSession: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateReflection,
  onSaveSession,
  onRequestDelete,
  onRestartNewSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const text = exportSessionToMarkdown(session);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const text = exportSessionToMarkdown(session);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (session.title || "duas-cadeiras")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `${safeTitle}-${new Date(session.createdAt).toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveSession();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-primary/50  overflow-y-auto"
    >
      <div className="w-full max-w-2xl my-auto rounded-2xl bg-paper  border border-nevoa overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-nevoa flex items-center justify-between shrink-0 bg-paper/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-paper">
                Síntese da Sessão
              </span>
              <span className="text-xs text-mata">
                {session.turns.length} falas alternadas
              </span>
            </div>
            <h3
              id="summary-title"
              className="text-base sm:text-lg font-semibold text-mata mt-1"
            >
              {session.title || "Experimento Dialógico"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-mata hover:text-mata p-1.5 rounded-lg hover:bg-paper/60 transition-colors"
            aria-label="Fechar resumo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 print:p-0">
          {/* Notice */}
          <div className="p-3 rounded-xl bg-paper/80 border border-nevoa/70 text-xs text-mata flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Documento pessoal restrito ao seu navegador (zero tráfego
                externo ou IA).
              </span>
            </div>
          </div>

          {/* Perspectives Card */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-nevoa bg-paper/40">
              <div className="text-[10px] font-bold uppercase text-mata">
                Cadeira A
              </div>
              <div className="font-semibold text-mata text-sm mt-0.5">
                {session.chairA.name}
              </div>
              {session.chairA.sublabel && (
                <div className="text-mata text-[11px] mt-0.5">
                  {session.chairA.sublabel}
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl border border-nevoa bg-paper/40">
              <div className="text-[10px] font-bold uppercase text-mata">
                Cadeira B
              </div>
              <div className="font-semibold text-mata text-sm mt-0.5">
                {session.chairB.name}
              </div>
              {session.chairB.sublabel && (
                <div className="text-mata text-[11px] mt-0.5">
                  {session.chairB.sublabel}
                </div>
              )}
            </div>
          </div>

          {/* Transcript Preview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mata mb-2.5">
              Registro das perspectivas:
            </h4>
            <div className="space-y-2.5 max-h-64 overflow-y-auto rounded-xl border border-nevoa p-3 bg-paper/30">
              {session.turns.map((turn, i) => (
                <div
                  key={turn.id}
                  className="text-xs pb-2 border-b border-nevoa last:border-b-0"
                >
                  <span className="font-semibold text-mata">
                    [{turn.speakerName}]
                  </span>{" "}
                  <span className="text-mata leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Concluding Reflection Input */}
          <div>
            <label className="block text-xs font-semibold text-mata mb-1.5">
              Reflexão final ou síntese de observação:
            </label>
            <textarea
              rows={3}
              value={session.closingReflection || ""}
              onChange={(e) => onUpdateReflection(e.target.value)}
              placeholder="O que ficou claro ao alternar de lugar entre estas duas perspectivas? Qual ponto de equilíbrio ou novo sentimento emergiu?"
              className="w-full rounded-xl border border-nevoa bg-paper p-3 text-xs text-mata focus:border-nevoa focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-nevoa bg-paper/60 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-summary-save"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nevoa bg-paper text-xs font-medium text-mata hover:bg-paper transition-colors "
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Salvo!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-summary-copy"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nevoa bg-paper text-xs font-medium text-mata hover:bg-paper transition-colors "
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-summary-download"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nevoa bg-paper text-xs font-medium text-mata hover:bg-paper transition-colors "
              title="Baixar arquivo Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-summary-new-session"
              onClick={onRestartNewSession}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary text-paper text-xs font-semibold  transition-colors"
            >
              Novo Experimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
