"use client";

import { useEffect, useState } from "react";
import createDOMPurify from "dompurify";

/**
 * Editorial/lesson HTML is rendered with dangerouslySetInnerHTML in several
 * places (blog posts, lesson descriptions, PDF articles). None of it passed
 * through a sanitizer, so a compromised admin account or malformed legacy
 * import could execute a stored XSS payload (P0-04 in
 * docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md).
 *
 * DOMPurify needs a real DOM to run, so the instance is created lazily in the
 * browser only — `require`'ing it on the server without a window returns an
 * uninitialized factory, not a sanitizer.
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "a",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "span",
    "div",
    "img",
    "figure",
    "figcaption",
    "code",
    "pre",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
  ],
  ALLOWED_ATTR: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "target",
    "width",
    "height",
  ],
  ALLOW_DATA_ATTR: false,
};

let purifier: ReturnType<typeof createDOMPurify> | null = null;

function getPurifier() {
  if (typeof window === "undefined") return null;
  if (!purifier) {
    purifier = createDOMPurify(window);
    purifier.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("rel", "noopener noreferrer nofollow ugc");
      }
    });
  }
  return purifier;
}

/** Sanitizes HTML for safe injection. Returns "" during SSR (no DOM yet). */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  const purify = getPurifier();
  if (!purify) return "";
  return purify.sanitize(html, SANITIZE_CONFIG);
}

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

/**
 * Drop-in replacement for `<div dangerouslySetInnerHTML={{ __html }} />`.
 * Sanitizes after mount so the server never renders unsanitized markup and
 * hydration never has to reconcile mismatched HTML.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    setSafeHtml(sanitizeHtml(html));
  }, [html]);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
}
