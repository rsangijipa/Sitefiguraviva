"use client";

import { useMemo, useState } from "react";

import { QUOTES } from "@/features/awareness-tree/data/quotes";

const FALLBACK_THEMES = [
  { label: "Acolhimento", quoteTheme: "calma" },
  { label: "Coragem", quoteTheme: "forca" },
  { label: "Recomeço", quoteTheme: "recomeco" },
  { label: "Presença", quoteTheme: "foco" },
  { label: "Esperança", quoteTheme: "esperanca" },
  { label: "Autocuidado", quoteTheme: "autocuidado" },
] as const;

export function AwarenessTreeFallback() {
  const [selectedTheme, setSelectedTheme] = useState<
    (typeof FALLBACK_THEMES)[number]
  >(FALLBACK_THEMES[0]);

  const quote = useMemo(
    () =>
      QUOTES.find((item) => item.theme === selectedTheme.quoteTheme) ??
      QUOTES[0],
    [selectedTheme],
  );

  return (
    <section
      className="awareness-tree-fallback"
      aria-labelledby="fallback-title"
    >
      <div className="awareness-tree-fallback__glow" aria-hidden="true" />
      <div className="awareness-tree-fallback__content">
        <p className="awareness-tree-fallback__eyebrow">
          Recurso contemplativo
        </p>
        <h1 id="fallback-title">Árvore da Consciência</h1>
        <p className="awareness-tree-fallback__status" role="status">
          Experiência visual indisponível neste dispositivo. As mensagens da
          árvore continuam acessíveis abaixo.
        </p>

        <div
          className="awareness-tree-fallback__themes"
          aria-label="Temas emocionais"
        >
          {FALLBACK_THEMES.map((theme) => (
            <button
              key={theme.label}
              type="button"
              aria-pressed={selectedTheme.label === theme.label}
              onClick={() => setSelectedTheme(theme)}
            >
              {theme.label}
            </button>
          ))}
        </div>

        <blockquote>
          <p>“{quote.text}”</p>
          <footer>Uma mensagem para {selectedTheme.label.toLowerCase()}</footer>
        </blockquote>
      </div>
    </section>
  );
}
