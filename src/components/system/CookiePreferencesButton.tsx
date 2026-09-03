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
      className="hover:text-paper transition-soft min-h-[44px] flex items-center uppercase tracking-[0.2em] font-bold text-[10px]"
    >
      Cookies
    </button>
  );
}
