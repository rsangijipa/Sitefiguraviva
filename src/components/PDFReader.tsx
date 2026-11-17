"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Highlighter,
  Moon,
  Printer,
  Sun,
  X,
  Palette,
} from "lucide-react";
import { SafeHtml } from "./SafeHtml";
import styles from "./PDFReader.module.css";

interface PDFReaderProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    pdfUrl?: string;
    pdf_url?: string;
    content?: string;
    subtitle?: string;
    author?: string;
  } | null;
}

export default function PDFReader({ isOpen, onClose, article }: PDFReaderProps) {
  // Themes: "pastel" (default soft pastel tone) or "black" (black mode)
  const [theme, setTheme] = useState<"pastel" | "black">("pastel");
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState("");
  const [highlightCount, setHighlightCount] = useState(0);

  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const ranges = useRef<Range[]>([]);
  const pdfFrameRef = useRef<HTMLIFrameElement>(null);

  const pdf = article?.pdf_url || article?.pdfUrl || "";

  useEffect(() => {
    if (!isOpen) return;
    const node = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    node?.showModal();
    return () => {
      node?.close();
      opener?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    setFailed(false);
    setNotice("");
    setHighlightCount(0);
    ranges.current = [];
    if (typeof CSS !== "undefined" && "highlights" in CSS) {
      CSS.highlights.delete("fv-reader-highlight");
    }
    return () => {
      if (typeof CSS !== "undefined" && "highlights" in CSS) {
        CSS.highlights.delete("fv-reader-highlight");
      }
    };
  }, [article]);

  const highlight = () => {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !content.current?.contains(selection.anchorNode) ||
      !content.current.contains(selection.focusNode)
    ) {
      setNotice("Selecione um trecho do texto antes de marcar.");
      return;
    }

    try {
      const range = selection.getRangeAt(0);

      if (typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined") {
        ranges.current.push(range.cloneRange());
        CSS.highlights.set("fv-reader-highlight", new Highlight(...ranges.current));
        selection.removeAllRanges();
        setHighlightCount(ranges.current.length);
        setNotice(`Trecho marcado! (${ranges.current.length} trecho${ranges.current.length > 1 ? "s" : ""})`);
      } else {
        // Fallback: wrap selection in mark element
        const mark = document.createElement("mark");
        mark.className = styles.fallbackMark || "fv-reader-mark";
        mark.style.backgroundColor = theme === "black" ? "#fcd34d" : "#fed701";
        mark.style.color = "#1a2016";
        mark.style.borderRadius = "3px";
        mark.style.padding = "1px 3px";
        range.surroundContents(mark);
        selection.removeAllRanges();
        setHighlightCount((c) => c + 1);
        setNotice("Trecho marcado no texto!");
      }
    } catch {
      setNotice("Não foi possível marcar este trecho específico. Tente selecionar dentro de um único parágrafo.");
    }
  };

  const clearHighlights = () => {
    ranges.current = [];
    if (typeof CSS !== "undefined" && "highlights" in CSS) {
      CSS.highlights.delete("fv-reader-highlight");
    }
    if (content.current) {
      const marks = content.current.querySelectorAll(`.${styles.fallbackMark || "fv-reader-mark"}`);
      marks.forEach((m) => {
        const parent = m.parentNode;
        while (m.firstChild) parent?.insertBefore(m.firstChild, m);
        parent?.removeChild(m);
      });
    }
    setHighlightCount(0);
    setNotice("Marcações removidas.");
  };

  const handlePrint = () => {
    if (pdf && pdfFrameRef.current) {
      try {
        pdfFrameRef.current.contentWindow?.focus();
        pdfFrameRef.current.contentWindow?.print();
      } catch {
        window.open(pdf, "_blank");
      }
    } else {
      window.print();
    }
  };

  if (!isOpen || !article) return null;

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-reader-theme={theme}
      aria-labelledby="reader-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className={styles.header}>
        <div className={styles.headerTitleWrap}>
          <span className={styles.eyebrowTag}>Biblioteca Viva · Modo Leitura</span>
          <h2 id="reader-title" className={styles.headerTitle}>
            {article.title}
          </h2>
        </div>

        <div className={styles.actions}>
          {/* Marcador de texto para artigos */}
          {!pdf && (
            <div className={styles.toolGroup}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={highlight}
                className={styles.actionBtn}
                title="Selecione o texto e clique para marcar"
              >
                <Highlighter size={16} />
                <span>Marcar texto</span>
                {highlightCount > 0 && (
                  <span className={styles.counterBadge}>{highlightCount}</span>
                )}
              </button>
              {highlightCount > 0 && (
                <button
                  type="button"
                  onClick={clearHighlights}
                  className={styles.subActionBtn}
                  title="Limpar marcações"
                >
                  Limpar
                </button>
              )}
            </div>
          )}

          {/* Seletor Tom Pastel / Black Mode */}
          <div className={styles.themeToggleGroup} role="group" aria-label="Tema de leitura">
            <button
              type="button"
              aria-pressed={theme === "pastel"}
              onClick={() => setTheme("pastel")}
              className={`${styles.themeOption} ${theme === "pastel" ? styles.themeOptionActive : ""}`}
              title="Ler com fundo tom pastel suave"
            >
              <Palette size={14} />
              <span>Tom Pastel</span>
            </button>
            <button
              type="button"
              aria-pressed={theme === "black"}
              onClick={() => setTheme("black")}
              className={`${styles.themeOption} ${theme === "black" ? styles.themeOptionActive : ""}`}
              title="Ler em black mode"
            >
              <Moon size={14} />
              <span>Black Mode</span>
            </button>
          </div>

          {/* Botão Imprimir */}
          <button
            type="button"
            onClick={handlePrint}
            className={styles.actionBtn}
            title="Imprimir este documento"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>

          {/* Link para PDF se disponível */}
          {pdf && (
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className={styles.actionBtn}
              title="Abrir arquivo PDF em nova aba"
            >
              <ExternalLink size={16} />
              <span>Abrir PDF</span>
            </a>
          )}

          {/* Fechar */}
          <button
            type="button"
            aria-label="Fechar janela de leitura"
            onClick={onClose}
            className={styles.closeBtn}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {pdf && !failed ? (
          <>
            <div className={styles.pdfBanner}>
              <p className={styles.note}>
                Visualizando documento digital. Para imprimir ou marcar diretamente no PDF, use os controles integrados do leitor.
              </p>
              <div className="flex gap-2">
                <a
                  href={pdf}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfLinkBtn}
                >
                  <Download size={14} /> Baixar PDF
                </a>
              </div>
            </div>
            <iframe
              ref={pdfFrameRef}
              src={pdf}
              title={article.title}
              className={styles.frame}
              onError={() => setFailed(true)}
            />
          </>
        ) : (
          <div ref={content} className={styles.paper}>
            <header className={styles.paperHeader}>
              <p className={styles.paperCategory}>Instituto Figura Viva · Leitura</p>
              <h1>{article.title}</h1>
              {article.subtitle && (
                <p className={styles.paperSubtitle}>{article.subtitle}</p>
              )}
              {article.author && (
                <p className={styles.paperAuthor}>Por {article.author}</p>
              )}
              <hr className={styles.paperDivider} />
            </header>

            {failed ? (
              <div className={styles.failedBox}>
                <p>Não foi possível carregar o visualizador embutido.</p>
                <a href={pdf} target="_blank" rel="noreferrer" className={styles.actionBtn}>
                  <Download size={16} /> Abrir arquivo externamente
                </a>
              </div>
            ) : article.content ? (
              <div className={styles.articleContent}>
                <SafeHtml html={article.content} />
              </div>
            ) : (
              <p className={styles.emptyNote}>
                {article.subtitle || "Conteúdo do artigo disponível para leitura."}
              </p>
            )}
          </div>
        )}
      </div>

      {notice && (
        <div className={styles.toastNotice} role="status">
          <span>{notice}</span>
        </div>
      )}
    </dialog>
  );
}
