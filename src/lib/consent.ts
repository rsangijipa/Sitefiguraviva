"use client";

import { useCallback, useEffect, useState } from "react";
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from "./consent.constants";

/**
 * Cookie consent (LGPD).
 *
 * Strictly necessary cookies (session, CSRF) do not require consent and are not
 * covered here. This module gates *audience measurement* only — Google
 * Analytics is not loaded until the visitor explicitly accepts, and the choice
 * can be revoked at any time from the footer.
 */

export type ConsentState = "granted" | "denied";

const STORAGE_KEY = CONSENT_STORAGE_KEY;

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private mode / blocked storage: treat as undecided rather than crashing.
    return null;
  }
}

function broadcast() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function setConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Ignore: the banner will simply ask again next visit.
  }
  broadcast();
}

export function resetConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
  broadcast();
}

/**
 * `ready` distinguishes "not read yet" (server render / first paint) from
 * "read, and the visitor has not decided". Without it the banner would flash
 * on every load for visitors who already answered.
 */
export function useCookieConsent() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setConsentState(readConsent());

    sync();
    setReady(true);

    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const grant = useCallback(() => setConsent("granted"), []);
  const deny = useCallback(() => setConsent("denied"), []);
  const reset = useCallback(() => resetConsent(), []);

  return { consent, ready, grant, deny, reset };
}
