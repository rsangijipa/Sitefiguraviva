import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PenLine,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Calendar,
  Sparkles,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { DiaryEntry } from "../types";

interface DiaryViewProps {
  entries: DiaryEntry[];
  onDeleteEntry: (id: string) => Promise<void>;
  onSelectVignette: (vignetteId: string) => void;
  onGoToExperiment: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  entries,
  onDeleteEntry,
  onSelectVignette,
  onGoToExperiment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    const query = searchTerm.toLowerCase();
    return (
      entry.vignetteTitle.toLowerCase().includes(query) ||
      entry.reflectionText.toLowerCase().includes(query) ||
      (entry.bodyAwareness &&
        entry.bodyAwareness.toLowerCase().includes(query)) ||
      (entry.selectedMovementLabel &&
        entry.selectedMovementLabel.toLowerCase().includes(query))
    );
  });

  const handleExportMarkdown = () => {
    if (entries.length === 0) return;

    let content = `# Diário de Fronteiras de Contato\n\n*Registro Pessoal de Auto-Observação e Limites Relacionais*\n*Exportado em: ${new Date().toLocaleDateString("pt-BR")}*\n\n---\n\n`;

    entries.forEach((entry, i) => {
      content += `### ${i + 1}. ${entry.vignetteTitle}\n`;
      content += `- **Data:** ${new Date(entry.createdAt).toLocaleString("pt-BR")}\n`;
      if (entry.selectedMovementLabel) {
        content += `- **Movimento Relacional:** ${entry.selectedMovementLabel}\n`;
      }
      content += `- **Pergunta Reflexiva:** "${entry.reflectiveQuestion}"\n\n`;
      content += `**Reflexão Pessoal:**\n${entry.reflectionText}\n\n`;
      if (entry.bodyAwareness) {
        content += `**Registro Somático / Sensações:**\n${entry.bodyAwareness}\n\n`;
      }
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diario-fronteiras-contato-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = async () => {
    if (entries.length === 0) return;

    let summary = `DIÁRIO DE FRONTEIRAS DE CONTATO\nTotal de registros: ${entries.length}\n\n`;
    entries.forEach((entry) => {
      summary += `[${entry.vignetteTitle}]\n${entry.reflectionText}\n`;
      if (entry.bodyAwareness) summary += `Corpo: ${entry.bodyAwareness}\n`;
      summary += `\n---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback if clipboard fails
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#554D40]">
              <PenLine className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-2xl text-[#26231F] font-normal tracking-tight">
              Diário de Contato
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#70675A] mt-1">
            Seu espaço íntimo e voluntário, armazenado somente neste
            dispositivo.
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-copy-diary"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs text-[#52493D] hover:bg-[#ECE5D9] transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#3D7A5E]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>

            <button
              id="btn-export-markdown"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3C362F] text-[#FAF8F5] text-xs font-medium hover:bg-[#2B2721] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar (.md)</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Counter */}
      {entries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#948B7D]" />
            <input
              type="text"
              placeholder="Buscar reflexões ou sensações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#DDD5C7] focus:outline-none focus:border-[#7A6B59] text-[#292520] placeholder:text-[#A19788]"
            />
          </div>
          <span className="text-xs text-[#7A7163] self-end sm:self-auto">
            {filteredEntries.length} de {entries.length} registro(s)
          </span>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="text-center py-14 px-6 bg-white rounded-2xl border border-[#E3DDD1] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F2EDE4] text-[#6E6456] mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-lg text-[#26231F] font-normal">
              Seu diário ainda não possui anotações
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6659] leading-relaxed">
              As opções selecionadas durante a navegação pelas vinhetas são
              efêmeras e nunca são gravadas sem sua iniciativa. Quando desejar
              registrar um aprendizado, utilize o botão "Salvar Reflexão no
              Diário".
            </p>
          </div>
          <button
            id="btn-empty-start-experiment"
            onClick={onGoToExperiment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3C362F] text-[#FAF8F5] text-xs font-medium hover:bg-[#2B2721] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Experimentar uma Vinheta Agora</span>
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-[#E3DDD1] text-xs text-[#736A5B]">
          Nenhuma reflexão encontrada para "{searchTerm}".
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.article
                key={entry.id}
                id={`diary-entry-${entry.id}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-[#E1D9CC] p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[#D1C7B7]"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#827464] uppercase tracking-wider">
                        Vinheta
                      </span>
                      <button
                        onClick={() => onSelectVignette(entry.vignetteId)}
                        className="font-serif text-base text-[#24211D] font-medium hover:text-[#7A6047] hover:underline flex items-center gap-1 text-left"
                      >
                        {entry.vignetteTitle}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      </button>
                    </div>

                    {entry.selectedMovementLabel && (
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-[#EDE7DC] text-[#554D40] border border-[#DDD4C5]">
                        Movimento observado: {entry.selectedMovementLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-[#827869]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#998F81]" />
                      {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      id={`btn-delete-entry-${entry.id}`}
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="p-1.5 rounded-md text-[#9E9484] hover:text-[#913E2E] hover:bg-[#FBEBE8] transition-colors"
                      title="Excluir reflexão do diário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reflective question context */}
                <div className="text-xs text-[#6B6254] italic bg-[#FBF9F6] p-3 rounded-xl border border-[#EDE6DB]">
                  Pergunta: "{entry.reflectiveQuestion}"
                </div>

                {/* Personal reflection body */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-[#2A2621] leading-relaxed whitespace-pre-wrap font-sans">
                    {entry.reflectionText}
                  </p>
                </div>

                {/* Somatic / Body Awareness */}
                {entry.bodyAwareness && (
                  <div className="pt-2 border-t border-[#F2ECE3] flex items-start gap-2 text-xs text-[#6E6354]">
                    <span className="font-semibold text-[#50473A] shrink-0">
                      Registro Somático:
                    </span>
                    <span>{entry.bodyAwareness}</span>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
