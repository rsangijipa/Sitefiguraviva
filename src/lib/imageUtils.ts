/**
 * Helper utility to sanitize image URLs.
 * If an image points to a suspended legacy Firebase Storage bucket (lithe-transport-479116-m2),
 * it returns a local fallback asset to prevent 402/403 network errors.
 */
export function getImageSrc(
  url: string | null | undefined,
  fallback: string = "/assets/foto-grupo.jpg",
): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return fallback;
  }

  // Check for suspended legacy Firebase storage URLs
  if (
    url.includes("lithe-transport-479116-m2") ||
    url.includes("firebasestorage.app") ||
    /supabase\.co\/storage\/v1\/object\/public\/uploads\//i.test(url)
  ) {
    return fallback;
  }

  return url;
}
