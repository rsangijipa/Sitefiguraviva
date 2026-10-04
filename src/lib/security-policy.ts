/** Nonces protect dynamic authenticated pages without disabling static public caching. */
export function protectedContentSecurityPolicy(
  nonce: string,
  development = false,
) {
  if (!/^[A-Za-z0-9+/=_-]+$/.test(nonce)) throw new Error("Invalid CSP nonce");
  return (
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co https://firebasestorage.googleapis.com https://storage.googleapis.com https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com",
      "media-src 'self' blob: data: https://*.supabase.co https://firebasestorage.googleapis.com https://storage.googleapis.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com https://firebasestorage.googleapis.com https://*.sentry.io",
      "frame-src 'self' https://www.youtube.com https://*.supabase.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ") + ";"
  );
}
