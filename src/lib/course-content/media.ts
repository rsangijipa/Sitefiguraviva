/**
 * Helpers for media authored in the lesson editor.
 *
 * Admins paste YouTube links in several shapes (watch, youtu.be, embed,
 * shorts, live, with timestamps or playlist params) or just the bare ID.
 * Splitting on "v=" kept trailing params such as "&t=30s" in the ID and
 * broke the embed, so parsing goes through URL instead.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function getYouTubeVideoId(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let candidate: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first === "watch") candidate = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(first ?? ""))
      candidate = second ?? null;
  }

  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
}

/**
 * Accepts only http(s) or same-site relative links for author-provided URLs,
 * so a pasted "javascript:" or "data:" value never becomes a clickable href.
 */
export function safeContentUrl(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
