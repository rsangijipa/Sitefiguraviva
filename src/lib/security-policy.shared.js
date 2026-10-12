/** Canonical CSP directives for static public and dynamic protected pages. */
export function contentSecurityPolicy(nonce = null, development = false) {
  if (nonce !== null && !/^[A-Za-z0-9+/=_-]+$/.test(nonce))
    throw new Error("Invalid CSP nonce");
  return (
    [
      "default-src 'self'",
      "manifest-src 'self'",
      `script-src 'self' ${nonce ? `'nonce-${nonce}' 'strict-dynamic'` : "'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://www.gstatic.com https://*.behold.so https://w.behold.so"}${development ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co https://firebasestorage.googleapis.com https://storage.googleapis.com https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://*.behold.so",
      "media-src 'self' blob: data: https://*.supabase.co https://firebasestorage.googleapis.com https://storage.googleapis.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.behold.so https://w.behold.so https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com https://firebasestorage.googleapis.com https://*.sentry.io",
      "frame-src 'self' https://www.youtube.com https://*.behold.so https://*.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ") + ";"
  );
}
