"use client";

import {
  GALLERY_FALLBACK_COLOR,
  overlayBackground,
} from "@/features/public-site/gallery/dominant-color";

/**
 * Mostra no painel a cor predominante calculada após o upload — é o fundo
 * translúcido que aparece sobre a miniatura na galeria pública.
 */
export function GalleryColorSwatch({
  color,
  computing,
}: {
  color: string | null;
  computing: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-600">
      <span
        aria-hidden="true"
        className="h-8 w-8 shrink-0 rounded-lg border border-stone-200 shadow-inner"
        style={{
          background: overlayBackground(color ?? GALLERY_FALLBACK_COLOR, 1),
        }}
      />
      <span>
        {computing
          ? "Calculando a cor predominante da foto…"
          : color
            ? "Cor do fundo no hover da galeria (calculada da foto)."
            : "Sem cor calculada: a galeria usará o verde da marca."}
      </span>
    </div>
  );
}
