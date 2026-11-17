import { normalizeHexColor } from "./dominant-color";

type LegacyPayload = Record<string, unknown>;

/**
 * Mescla os campos editáveis da galeria no `legacy_payload` existente, sem
 * apagar chaves antigas que o formulário não conhece. Se a imagem mudou e
 * nenhuma cor nova veio do upload, a cor guardada deixa de valer.
 */
export function mergeGalleryLegacyPayload(
  current: unknown,
  input: {
    category?: string;
    year?: string;
    dominant_color?: string | null;
    imageChanged?: boolean;
  },
): LegacyPayload {
  const base: LegacyPayload =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as LegacyPayload) }
      : {};
  if (input.category) base.category = input.category;
  else delete base.category;
  if (input.year) base.year = input.year;
  else delete base.year;
  delete base.ano;
  const color = normalizeHexColor(input.dominant_color);
  if (color) base.dominant_color = color;
  else if (input.imageChanged) delete base.dominant_color;
  return base;
}

/** Ano explícito do registro (só o que a administradora informou). */
export function galleryYearFromLegacy(
  legacy: Record<string, unknown>,
): string | null {
  const raw = legacy.year ?? legacy.ano;
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  return /^\d{4}$/.test(value) ? value : null;
}
