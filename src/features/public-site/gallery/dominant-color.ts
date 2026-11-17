/**
 * Cor predominante das fotos da galeria.
 *
 * A cor é calculada uma vez no painel, logo após o upload (o navegador da
 * administradora lê a imagem num canvas pequeno), e guardada em
 * `gallery_items.legacy_payload.dominant_color`. A página pública só lê esse
 * valor; fotos antigas sem cor guardada recebem o cálculo no navegador do
 * visitante e, se a imagem não permitir leitura (CORS), o verde da marca.
 */

export const GALLERY_FALLBACK_COLOR = "#005a1f";

export type Rgb = { r: number; g: number; b: number };

const HEX = /^#?([0-9a-f]{6})$/i;

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = HEX.exec(value.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
}

export function hexToRgb(hex: string): Rgb {
  const value = normalizeHexColor(hex) ?? GALLERY_FALLBACK_COLOR;
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Luminância relativa (WCAG 2.x). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastWithWhite(rgb: Rgb): number {
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

/**
 * Escolhe a cor mais frequente entre os pixels (RGBA intercalado, como em
 * `ImageData.data`). Agrupa em faixas de 16 tons por canal, ignora pixels
 * transparentes, quase brancos e quase pretos, e dá mais peso a cores
 * saturadas para que um céu cinzento não vença o verde da mata.
 * Devolve null quando não sobra pixel útil.
 */
export function dominantColorFromPixels(
  data: ArrayLike<number>,
  step = 1,
): string | null {
  const buckets = new Map<
    number,
    { weight: number; r: number; g: number; b: number; n: number }
  >();
  const stride = Math.max(1, Math.floor(step)) * 4;

  for (let i = 0; i + 3 < data.length; i += stride) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 24 || min > 236) continue;

    const saturation = max === 0 ? 0 : (max - min) / max;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { weight: 0, r: 0, g: 0, b: 0, n: 0 };
    bucket.weight += 1 + saturation * 2;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }

  let best: {
    weight: number;
    r: number;
    g: number;
    b: number;
    n: number;
  } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.weight > best.weight) best = bucket;
  }
  if (!best) return null;
  return rgbToHex({
    r: best.r / best.n,
    g: best.g / best.n,
    b: best.b / best.n,
  });
}

/**
 * Escurece a cor (mantendo o matiz) até o texto branco ter contraste mínimo
 * sobre ela. Usado no fundo translúcido sobre a miniatura.
 */
export function readableOverlayColor(
  color: string | null | undefined,
  minContrast = 7,
): string {
  let rgb = hexToRgb(normalizeHexColor(color) ?? GALLERY_FALLBACK_COLOR);
  for (let i = 0; i < 40 && contrastWithWhite(rgb) < minContrast; i += 1) {
    rgb = { r: rgb.r * 0.9, g: rgb.g * 0.9, b: rgb.b * 0.9 };
  }
  return rgbToHex(rgb);
}

/** `rgba()` do fundo translúcido a partir de uma cor hex. */
export function overlayBackground(
  color: string | null | undefined,
  alpha = 0.86,
): string {
  const { r, g, b } = hexToRgb(readableOverlayColor(color));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lê uma imagem no navegador e devolve a cor predominante. Precisa que a
 * imagem permita CORS (o Storage do Supabase permite); se não permitir,
 * devolve null e quem chamou usa o verde da marca.
 */
export function computeDominantColorFromUrl(
  src: string,
  size = 48,
): Promise<string | null> {
  if (typeof window === "undefined" || !src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(
          dominantColorFromPixels(ctx.getImageData(0, 0, size, size).data),
        );
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
