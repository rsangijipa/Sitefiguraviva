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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-2xl my-auto rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 text-stone-100">
                Síntese da Sessão
              </span>
              <span className="text-xs text-stone-400">
                {session.turns.length} falas alternadas
              </span>
            </div>
            <h3
              id="summary-title"
              className="text-base sm:text-lg font-semibold text-stone-900 mt-1"
            >
              {session.title || "Experimento Dialógico"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="Fechar resumo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 print:p-0">
          {/* Notice */}
          <div className="p-3 rounded-xl bg-stone-100/80 border border-stone-200/70 text-xs text-stone-600 flex items-center justify-between">
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
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/40">
              <div className="text-[10px] font-bold uppercase text-stone-400">
                Cadeira A
              </div>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {session.chairA.name}
              </div>
              {session.chairA.sublabel && (
                <div className="text-stone-500 text-[11px] mt-0.5">
                  {session.chairA.sublabel}
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/40">
              <div className="text-[10px] font-bold uppercase text-stone-400">
                Cadeira B
              </div>
              <div className="font-semibold text-stone-900 text-sm mt-0.5">
                {session.chairB.name}
              </div>
              {session.chairB.sublabel && (
                <div className="text-stone-500 text-[11px] mt-0.5">
                  {session.chairB.sublabel}
                </div>
              )}
            </div>
          </div>

          {/* Transcript Preview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
              Registro das perspectivas:
            </h4>
            <div className="space-y-2.5 max-h-64 overflow-y-auto rounded-xl border border-stone-200 p-3 bg-stone-50/30">
              {session.turns.map((turn, i) => (
                <div
                  key={turn.id}
                  className="text-xs pb-2 border-b border-stone-100 last:border-b-0"
                >
                  <span className="font-semibold text-stone-900">
                    [{turn.speakerName}]
                  </span>{" "}
                  <span className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Concluding Reflection Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Reflexão final ou síntese de observação:
            </label>
            <textarea
              rows={3}
              value={session.closingReflection || ""}
              onChange={(e) => onUpdateReflection(e.target.value)}
              placeholder="O que ficou claro ao alternar de lugar entre estas duas perspectivas? Qual ponto de equilíbrio ou novo sentimento emergiu?"
              className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-800 focus:border-stone-400 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/60 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-summary-save"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs"
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
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold shadow-xs transition-colors"
            >
              Novo Experimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
