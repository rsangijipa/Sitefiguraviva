export function validAnalyticsId(value: string | undefined) {
  return value && /^G-[A-Z0-9]+$/.test(value) ? value : null;
}

export function disableAnalytics() {
  if (typeof window === "undefined") return;
  const id = validAnalyticsId(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
  if (id)
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const domains = window.location.hostname.split(".");
  const paths = window.location.pathname.split("/");
  const cookiePaths = new Set([
    "/",
    ...paths.map((_, index) => paths.slice(0, index + 1).join("/") || "/"),
  ]);
  for (const name of names)
    for (const path of cookiePaths) {
      const expired = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
      document.cookie = expired;
      for (let index = 0; index < domains.length - 1; index++) {
        document.cookie = `${expired}; Domain=${domains.slice(index).join(".")}`;
      }
    }
}
