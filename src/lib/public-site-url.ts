export const OFFICIAL_SITE_ORIGIN = "https://www.institutofiguraviva.com.br";

// Deployment configuration only; never infer canonical URLs from request headers.
export function getPublicSiteOrigin() {
  const url = new URL(process.env.NEXT_PUBLIC_BASE_URL || OFFICIAL_SITE_ORIGIN);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && local)) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "NEXT_PUBLIC_BASE_URL must be an HTTPS origin or local HTTP origin.",
    );
  return url.origin;
}

export function publicContentPath(
  kind: "curso" | "blog",
  item: { id: string; slug?: unknown },
) {
  const slug = typeof item.slug === "string" ? item.slug.trim() : "";
  return `/${kind}/${encodeURIComponent(slug || item.id)}`;
}
