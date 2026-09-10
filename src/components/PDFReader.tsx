"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, FileText, Loader2, X } from "lucide-react";
import Tooltip from "./ui/Tooltip";
import { SafeHtml } from "./SafeHtml";

interface PDFReaderProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    pdfUrl?: string;
    pdf_url?: string;
    content?: string;
  } | null;
}

const PDFReader = ({ isOpen, onClose, article }: PDFReaderProps) => {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const pdfUrl = article?.pdf_url || article?.pdfUrl || "";
  const viewerUrl = pdfUrl ? `${pdfUrl}#toolbar=1&navpanes=0&view=FitH` : "";

  const handleFrameLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    // Supabase Storage returns JSON errors with HTTP 4xx inside an iframe.
    // The iframe's load event still fires, so inspect the rendered document
    // when same-origin access is available and keep a safe fallback otherwise.
    setLoading(false);
    try {
      const bodyText =
        event.currentTarget.contentDocument?.body?.textContent || "";
      if (/bucket not found|no such bucket|object not found/i.test(bodyText)) {
        setFailed(true);
      }
    } catch {
      // Cross-origin PDF documents cannot be inspected; the browser PDF
      // viewer will remain visible and its explicit open/download actions are
      // available if the embedded viewer cannot render.
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(Boolean(pdfUrl));
    setFailed(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, pdfUrl, onClose]);

  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4efe3] text-primary">
          <div className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-primary/10 bg-primary px-4 py-3 text-white shadow-lg md:px-8">
            <div className="min-w-0">
              <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-gold md:text-sm">
                Biblioteca Figura Viva
              </h2>
              <p className="max-w-[58vw] truncate text-sm text-white/75 md:max-w-3xl">
                {article.title}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {pdfUrl && (
                <>
                  <Tooltip content="Abrir em nova aba">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Abrir PDF em nova aba"
                      className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </Tooltip>
                  <Tooltip content="Baixar documento">
                    <a
                      href={pdfUrl}
                      download
                      aria-label="Baixar PDF"
                      className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Download size={18} />
                    </a>
                  </Tooltip>
                </>
              )}
              <Tooltip content="Fechar Leitor">
                <button
                  onClick={onClose}
                  aria-label="Fechar leitor"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <X size={20} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(182,143,77,0.16),transparent_34%),linear-gradient(180deg,#f7f1e6,#eee3d0)] p-3 md:p-8">
            {pdfUrl && !failed ? (
              <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-md border border-primary/15 bg-white shadow-2xl">
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-paper/95 px-6 text-center text-primary">
                    <Loader2 className="animate-spin text-gold" size={28} />
                    <div>
                      <p className="font-serif text-2xl">Abrindo documento</p>
                      <p className="mt-1 max-w-md text-sm text-primary/60">
                        Se a prévia não carregar, use os botões acima para abrir
                        em nova aba ou baixar o arquivo.
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  src={viewerUrl}
                  className="block h-full w-full flex-1 border-none bg-white"
                  title={article.title}
                  referrerPolicy="no-referrer"
                  onLoad={handleFrameLoad}
                  onError={() => {
                    setLoading(false);
                    setFailed(true);
                  }}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4 md:p-12 scrollbar-hide">
                <div className="mx-auto min-h-full max-w-4xl rounded-2xl bg-white p-8 shadow-soft-xl md:p-16">
                  <header className="text-center mb-12">
                    <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-6">
                      {article.title}
                    </h1>
                    <div className="w-24 h-px bg-gold/20 mx-auto" />
                  </header>
                  <div className="prose-organic px-2 md:px-4">
                    {failed ? (
                      <div className="mx-auto flex max-w-xl flex-col items-center rounded-md border border-primary/10 bg-areia/40 px-6 py-10 text-center">
                        <FileText className="mb-4 text-gold" size={36} />
                        <p className="text-lg font-semibold text-primary">
                          A prévia do PDF não abriu neste navegador.
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-primary/65">
                          O arquivo continua disponível. Abra em uma nova aba ou
                          baixe para ler com o visualizador do seu dispositivo.
                        </p>
                        {pdfUrl && (
                          <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                            >
                              <ExternalLink size={16} />
                              Abrir documento
                            </a>
                            <a
                              href={pdfUrl}
                              download
                              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/15 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                            >
                              <Download size={16} />
                              Baixar PDF
                            </a>
                          </div>
                        )}
                      </div>
                    ) : article.content ? (
                      <SafeHtml html={article.content} />
                    ) : (
                      <p className="text-center text-primary/40 italic">
                        Conteúdo não disponível.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PDFReader;
