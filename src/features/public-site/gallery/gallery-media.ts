export const GALLERY_PLACEHOLDER_SRC = "/assets/fv/placeholders/gallery.webp";

export interface GalleryMediaInput {
  src?: unknown;
  url?: unknown;
  title?: unknown;
  width?: unknown;
  height?: unknown;
}

export interface GalleryMedia {
  src: string;
  title: string;
  width: number;
  height: number;
}

function isSupportedSource(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const source = value.trim();
  if (source.startsWith("/") && !source.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(source);
    // A legacy record accidentally stored the site home as an image source.
    // It makes the browser try to frame a page protected by X-Frame-Options.
    if (
      /(^|\.)institutofiguraviva\.com\.br$/i.test(url.hostname) &&
      (url.pathname === "/" || url.pathname === "")
    ) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function positiveDimension(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export function normalizeGalleryMedia(photo: GalleryMediaInput): GalleryMedia {
  const candidate = isSupportedSource(photo.src)
    ? photo.src.trim()
    : isSupportedSource(photo.url)
      ? photo.url.trim()
      : GALLERY_PLACEHOLDER_SRC;

  return {
    src: candidate,
    title:
      typeof photo.title === "string" && photo.title.trim()
        ? photo.title.trim()
        : "Momento Figura Viva",
    width: positiveDimension(photo.width, 1200),
    height: positiveDimension(photo.height, 900),
  };
}
