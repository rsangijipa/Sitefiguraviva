"use client";

import { useCookieConsent } from "@/lib/consent";

/**
 * Lets a visitor revoke or revisit their cookie choice, which the LGPD
 * requires to be as easy as giving it. Resetting brings the banner back.
 */
export default function CookiePreferencesButton() {
  const { ready, reset } = useCookieConsent();

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={reset}
      className="flex min-h-[44px] items-center py-1 text-left transition-soft hover:text-gold-light"
    >
      Preferências de cookies
    </button>
  );
}
