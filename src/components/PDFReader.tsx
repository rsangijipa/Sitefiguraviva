"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  ExternalLink,
  Highlighter,
  Moon,
  Palette,
  Printer,
  X,
} from "lucide-react";
import { SafeHtml } from "./SafeHtml";
import styles from "./PDFReader.module.css";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  highlightSegments,
  highlightToRange,
  mergeHighlights,
  rangeToHighlight,
  readHighlights,
  readReaderTheme,
  safeLocalStorage,
  subtractHighlight,
  writeHighlights,
  writeReaderTheme,
  type ReaderTheme,
  type TextHighlight,
} from "@/lib/reader/highlights";

interface PDFReaderProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id?: string | number;
    title: string;
    pdfUrl?: string;
    pdf_url?: string;
    content?: string;
    subtitle?: string;
    author?: string;
  } | null;
}

const HIGHLIGHT_NAME = "fv-reader-highlight";
const MARK_ATTR = "data-fv-reader-mark";

function supportsCssHighlights() {
  return (
    typeof CSS !== "undefined" &&
    "highlights" in CSS &&
    typeof Highlight !== "undefined"
  );
}

/** Remove os <mark> do fallback sem alterar o texto. */
function unwrapMarks(root: HTMLElement) {
  root.querySelectorAll(`mark[${MARK_ATTR}]`).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  root.normalize();
}

/**
 * Pinta as marcações: Custom Highlight API quando existe (não mexe no DOM);
 * senão envolve cada pedaço de texto num <mark>.
 */
function paintHighlights(root: HTMLElement, list: TextHighlight[]) {
  if (supportsCssHighlights()) {
    const ranges = list
      .map((item) => highlightToRange(root, item))
      .filter((range): range is Range => range !== null);
    if (ranges.length)
      CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
    else CSS.highlights.delete(HIGHLIGHT_NAME);
    return;
  }

  unwrapMarks(root);
  // Do fim para o começo: envolver um pedaço não desloca os anteriores.
  const segments = list
    .flatMap((item) => highlightSegments(root, item))
    .reverse();
  for (const { node, start, end } of segments) {
    const target = node.splitText(start);
    target.splitText(end - start);
    const mark = root.ownerDocument.createElement("mark");
    mark.setAttribute(MARK_ATTR, "");
    mark.className = styles.fallbackMark;
    target.parentNode?.insertBefore(mark, target);
    mark.appendChild(target);
  }
}

export default function PDFReader({
  isOpen,
  onClose,
  article,
}: PDFReaderProps) {
  const [theme, setTheme] = useState<ReaderTheme>("pastel");
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState("");
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);

  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pdfFrameRef = useRef<HTMLIFrameElement>(null);

  const pdf = article?.pdf_url || article?.pdfUrl || "";
  const articleKey = article ? String(article.id ?? article.title) : "";
  const canHighlight = Boolean(article?.content) && (!pdf || failed);

  useBodyScrollLock(isOpen && Boolean(article));

  useEffect(() => {
    setTheme(readReaderTheme(safeLocalStorage()));
  }, []);

  useEffect(() => {
    if (!isOpen || !article) return;
    const node = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    if (node && !node.open) node.showModal();
    return () => {
      if (node?.open) node.close();
      opener?.focus?.();
    };
  }, [isOpen, article]);

  useEffect(() => {
    setFailed(false);
    setNotice("");
    setHighlights(
      articleKey ? readHighlights(safeLocalStorage(), articleKey) : [],
    );
    return () => {
      if (supportsCssHighlights()) CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }, [articleKey]);

  // Reaplica as marcações quando o texto aparece (SafeHtml sanitiza após montar)
  // ou quando a lista muda.
  useEffect(() => {
    const root = content.current;
    if (!root || !isOpen) return;
    let observer: MutationObserver | null = null;
    const paint = () => {
      observer?.disconnect();
      paintHighlights(root, highlights);
      observer?.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };
    observer = new MutationObserver(paint);
    paint();
    return () => observer?.disconnect();
  }, [highlights, isOpen, canHighlight]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeTheme = (next: ReaderTheme) => {
    setTheme(next);
    writeReaderTheme(safeLocalStorage(), next);
  };

  const persist = useCallback(
    (next: TextHighlight[]) => {
      setHighlights(next);
      writeHighlights(safeLocalStorage(), articleKey, next);
    },
    [articleKey],
  );

  const selectedHighlight = (): TextHighlight | null => {
    const selection = window.getSelection();
    const root = content.current;
    if (
      !selection ||
      selection.isCollapsed ||
      !root ||
      selection.rangeCount === 0
    ) {
      return null;
    }
    return rangeToHighlight(root, selection.getRangeAt(0));
  };

  const markSelection = () => {
    const selected = selectedHighlight();
    if (!selected) {
      setNotice("Selecione um trecho do texto antes de marcar.");
      return;
    }
    const next = mergeHighlights([...highlights, selected]);
    window.getSelection()?.removeAllRanges();
    persist(next);
    setNotice(
      `Trecho marcado. ${next.length} ${next.length === 1 ? "marcação salva" : "marcações salvas"} neste navegador.`,
    );
  };

  const unmarkSelection = () => {
    const selected = selectedHighlight();
    if (!selected) {
      setNotice("Selecione o trecho marcado que deseja desmarcar.");
      return;
    }
    window.getSelection()?.removeAllRanges();
    persist(subtractHighlight(highlights, selected));
    setNotice("Marcação removida do trecho.");
  };

  const clearHighlights = () => {
    persist([]);
    setNotice("Todas as marcações deste texto foram removidas.");
  };

  const handlePrint = () => {
    if (pdf && !failed && pdfFrameRef.current) {
      try {
        pdfFrameRef.current.contentWindow?.focus();
        pdfFrameRef.current.contentWindow?.print();
        return;
      } catch {
        // PDF de outro domínio: o navegador não deixa imprimir pelo iframe.
        window.open(pdf, "_blank", "noopener,noreferrer");
        return;
      }
    }
    window.print();
  };

  if (!isOpen || !article) return null;

  // Botões de marcação mantêm a seleção ao serem tocados/clicados.
  const keepSelection = (event: React.PointerEvent | React.MouseEvent) =>
    event.preventDefault();

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
      onClick={(event) => {
        // Clique no fundo escurecido (fora da janela) fecha.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header className={styles.header}>
        <div className={styles.headerTitleWrap}>
          <span className={styles.eyebrowTag}>Biblioteca Viva · Leitura</span>
          <h2 id="reader-title" className={styles.headerTitle}>
            {article.title}
          </h2>
        </div>

        <div className={styles.actions}>
          {canHighlight && (
            <div
              className={styles.toolGroup}
              role="group"
              aria-label="Marcações"
            >
              <button
                type="button"
                onPointerDown={keepSelection}
                onMouseDown={keepSelection}
                onClick={markSelection}
                className={styles.actionBtn}
                title="Selecione um trecho e toque para destacar"
              >
                <Highlighter size={16} aria-hidden />
                <span>Marcar</span>
                {highlights.length > 0 && (
                  <span
                    className={styles.counterBadge}
                    aria-label={`${highlights.length} marcações`}
                  >
                    {highlights.length}
                  </span>
                )}
              </button>
              {highlights.length > 0 && (
                <>
                  <button
                    type="button"
                    onPointerDown={keepSelection}
                    onMouseDown={keepSelection}
                    onClick={unmarkSelection}
                    className={styles.subActionBtn}
                    title="Selecione um trecho marcado e toque para desmarcar"
                  >
                    <Eraser size={14} aria-hidden /> Desmarcar
                  </button>
                  <button
                    type="button"
                    onClick={clearHighlights}
                    className={styles.subActionBtn}
                  >
                    Limpar tudo
                  </button>
                </>
              )}
            </div>
          )}

          <div
            className={styles.themeToggleGroup}
            role="group"
            aria-label="Fundo da leitura"
          >
            <button
              type="button"
              aria-pressed={theme === "pastel"}
              onClick={() => changeTheme("pastel")}
              className={`${styles.themeOption} ${theme === "pastel" ? styles.themeOptionActive : ""}`}
            >
              <Palette size={14} aria-hidden />
              <span>Pastel</span>
            </button>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => changeTheme("dark")}
              className={`${styles.themeOption} ${theme === "dark" ? styles.themeOptionActive : ""}`}
            >
              <Moon size={14} aria-hidden />
              <span>Escuro</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className={styles.actionBtn}
          >
            <Printer size={16} aria-hidden />
            <span>Imprimir</span>
          </button>

          {pdf && (
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className={styles.actionBtn}
              aria-label="Abrir PDF em nova aba"
            >
              <ExternalLink size={16} aria-hidden />
              <span>Abrir PDF</span>
            </a>
          )}

          <button
            type="button"
            aria-label="Fechar leitura"
            onClick={onClose}
            className={styles.closeBtn}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {pdf && !failed ? (
          <>
            <div className={styles.pdfBanner}>
              <p className={styles.note}>
                Documento em PDF. Para marcar trechos, use as ferramentas do
                próprio leitor de PDF.
              </p>
              <a
                href={pdf}
                target="_blank"
                rel="noreferrer"
                className={styles.pdfLinkBtn}
              >
                <Download size={14} aria-hidden /> Baixar PDF
              </a>
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
          <article className={styles.paper}>
            <header className={styles.paperHeader}>
              <p className={styles.paperCategory}>
                Instituto Figura Viva · Leitura
              </p>
              <h1>{article.title}</h1>
              {article.subtitle && (
                <p className={styles.paperSubtitle}>{article.subtitle}</p>
              )}
              {article.author && (
                <p className={styles.paperAuthor}>Por {article.author}</p>
              )}
              <hr className={styles.paperDivider} />
            </header>

            {failed && (
              <div className={styles.failedBox}>
                <p>Não foi possível carregar o visualizador embutido.</p>
                <a
                  href={pdf}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfLinkBtn}
                >
                  <Download size={16} aria-hidden /> Abrir arquivo
                </a>
              </div>
            )}
            {article.content ? (
              <div ref={content} className={styles.articleContent}>
                <SafeHtml html={article.content} />
              </div>
            ) : (
              !failed && (
                <p className={styles.emptyNote}>
                  {article.subtitle || "Conteúdo disponível em breve."}
                </p>
              )
            )}
          </article>
        )}
      </div>

      <div
        className={styles.toastNotice}
        role="status"
        aria-live="polite"
        hidden={!notice}
      >
        {notice}
      </div>
    </dialog>
  );
}
