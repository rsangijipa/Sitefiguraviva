import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  RotateCcw,
  BookmarkCheck,
  EyeOff,
  Code2,
} from "lucide-react";
import { PerceptionPayload } from "../types";

interface CompletionViewProps {
  payload: PerceptionPayload;
  onSave: () => void;
  onFinishWithoutSaving: () => void;
  onStartNew: () => void;
  isSaved: boolean;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  payload,
  onSave,
  onFinishWithoutSaving,
  onStartNew,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const [showJsonCode, setShowJsonCode] = useState(false);

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // fallback
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aqui-e-agora-percepcao-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const items = [
    { label: "Atenção presente", key: "attention", value: payload.attention },
    { label: "Percepção no corpo", key: "body", value: payload.body },
    { label: "Sentimento / Sensação", key: "feeling", value: payload.feeling },
    { label: "Necessidade (Figura)", key: "need", value: payload.need },
    { label: "Permanência", key: "reflection", value: payload.reflection },
  ];

  return (
    <motion.div
      id="completion-view-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Delicate floral/organic accent */}
      <div className="text-center mb-6">
        <svg
          viewBox="0 0 60 28"
          className="mx-auto w-12 h-6 text-[#6B6B63] opacity-60 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M 10 14 C 20 8, 40 8, 50 14" />
          <circle cx="30" cy="11" r="2" fill="currentColor" />
          <path d="M 24 14 C 22 18, 16 20, 15 22" />
          <path d="M 36 14 C 38 18, 44 20, 45 22" />
        </svg>

        <span className="text-xs uppercase tracking-widest text-[#6B6B63] font-medium">
          Ciclo concluído · Aqui e Agora
        </span>
        <h2 className="font-serif-awareness text-3xl sm:text-4xl text-[#262B22] font-normal mt-2 mb-3">
          Sua percepção do instante
        </h2>
        <p className="text-sm sm:text-base text-[#6B6B63] max-w-md mx-auto leading-relaxed">
          Você dedicou um tempo para pausar, sentir e acolher o momento tal como
          se apresenta.
        </p>
      </div>

      {/* Synthesis summary card */}
      <div className="bg-[#FDFAF4]/75 border border-[#F1E9DB] rounded-2xl p-5 sm:p-6 mb-6   space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.key}
            className={`pb-3.5 ${
              idx < items.length - 1 ? "border-b border-[#F1E9DB]" : ""
            }`}
          >
            <div className="text-xs uppercase tracking-wider text-[#6B6B63] font-medium mb-1">
              {item.label}
            </div>
            <div className="text-sm sm:text-base text-[#262B22] font-normal leading-relaxed">
              {item.value ? (
                <span>{item.value}</span>
              ) : (
                <span className="italic text-[#D8CFBE]">
                  Apenas experienciado em silêncio
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Notice Card */}
      <div
        id="privacy-notice-box"
        className="flex items-start gap-3 bg-[#FDFAF4]/85 border border-[#F1E9DB] rounded-xl p-4 mb-6"
      >
        <ShieldCheck className="w-5 h-5 text-[#6B6B63] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
          <strong className="font-medium text-[#262B22] block mb-0.5">
            Registro íntimo e estritamente pessoal
          </strong>
          Este conteúdo não é compartilhado com administradores nem processado
          como métrica analítica. Se você optar por guardar, ele permanece
          unicamente gravado no armazenamento local do seu dispositivo.
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-6">
        {!isSaved ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              id="btn-finish-without-saving"
              type="button"
              onClick={onFinishWithoutSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#D8CFBE] text-sm text-[#6B6B63] hover:bg-[#F1E9DB] transition-colors"
            >
              <EyeOff className="w-4 h-4 opacity-75" />
              <span>Finalizar sem salvar</span>
            </button>

            <button
              id="btn-save-perception"
              type="button"
              onClick={onSave}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#262B22] text-[#FDFAF4] hover:bg-[#262B22] text-sm font-medium  transition-colors"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Guardar esta percepção</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#FDFAF4] border border-[#F1E9DB] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[#4B4B49] font-medium">
              <Check className="w-4 h-4 text-[#07614C]" />
              <span>Percepção guardada com segurança no seu dispositivo.</span>
            </div>
            <button
              id="btn-start-new-after-save"
              type="button"
              onClick={onStartNew}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-[#4B4B49] hover:text-[#262B22] font-medium border border-[#D8CFBE] rounded-lg hover:bg-[#F1E9DB] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nova prática</span>
            </button>
          </div>
        )}
      </div>

      {/* JSON Payload viewer and exporter */}
      <div className="border-t border-[#F1E9DB] pt-4">
        <div className="flex items-center justify-between text-xs text-[#6B6B63] mb-3">
          <button
            id="btn-toggle-json-viewer"
            type="button"
            onClick={() => setShowJsonCode(!showJsonCode)}
            className="inline-flex items-center gap-1 hover:text-[#262B22] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>
              {showJsonCode ? "Ocultar payload JSON" : "Ver payload JSON"}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-json"
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[#F1E9DB] transition-colors"
              title="Copiar JSON para área de transferência"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-700">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            <button
              id="btn-download-json"
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[#F1E9DB] transition-colors"
              title="Baixar arquivo JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </button>
          </div>
        </div>

        {showJsonCode && (
          <motion.pre
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs bg-[#262B22] text-[#D8CFBE] p-4 rounded-xl overflow-x-auto font-mono leading-relaxed"
          >
            {jsonString}
          </motion.pre>
        )}
      </div>

      {/* Start over option */}
      {!isSaved && (
        <div className="mt-4 text-center">
          <button
            id="btn-restart-awareness"
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6B63] hover:text-[#262B22] transition-colors py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recomeçar travessia</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
