/** CSRF boundary: browser Origin must match the actual HTTP Host and protocol. */
export function isSameOriginRequest(request: Request) {
  try {
    const value = request.headers.get("origin");
    if (!value) return false;
    const origin = new URL(value);
    if (origin.origin !== value) return false;
    const internal = new URL(request.url);
    // Next may reconstruct request.url using its internal listening hostname.
    // Host is the browser's destination; never use client-supplied forwarded hosts.
    const host = request.headers.get("host");
    const destination = host
      ? new URL(`${internal.protocol}//${host}`)
      : internal;
    if (
      destination.username ||
      destination.password ||
      destination.pathname !== "/" ||
      destination.search ||
      destination.hash
    ) {
      // Without Host, request.url includes the route path, which is expected.
      if (host) return false;
    }
    return origin.origin === destination.origin;
  } catch {
    return false;
  }
}
