"use client";

import { useCallback, useEffect, useState } from "react";
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from "./consent.constants";
import { disableAnalytics } from "./analytics-consent";

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
let fallbackConsent: ConsentState | null | undefined;
const FLOATING_CONTROL_SELECTOR =
  "[data-secondary-floating-control], [data-floating-whatsapp]";

function coordinateConsentSurface(
  consent: ConsentState | null,
  ready: boolean,
) {
  if (!ready || typeof document === "undefined") return;

  const pending = consent === null;
  document.documentElement.dataset.cookieConsent = pending
    ? "pending"
    : "resolved";

  document
    .querySelectorAll<HTMLElement>(FLOATING_CONTROL_SELECTOR)
    .forEach((control) => {
      control.hidden = pending;
    });
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  if (fallbackConsent !== undefined) return fallbackConsent;
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
  if (state !== "granted") disableAnalytics();
  fallbackConsent = state;
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
    fallbackConsent = undefined;
  } catch {
    // Ignore: the banner will simply ask again next visit.
  }
  broadcast();
}

export function resetConsent() {
  disableAnalytics();
  fallbackConsent = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    fallbackConsent = undefined;
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
    const sync = () => {
      const value = readConsent();
      if (value !== "granted") disableAnalytics();
      setConsentState(value);
    };

    sync();
    setReady(true);

    window.addEventListener(CONSENT_EVENT, sync);
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      fallbackConsent = undefined;
      sync();
    };
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  useEffect(() => {
    coordinateConsentSurface(consent, ready);
  }, [consent, ready]);

  const grant = useCallback(() => setConsent("granted"), []);
  const deny = useCallback(() => setConsent("denied"), []);
  const reset = useCallback(() => resetConsent(), []);

  return { consent, ready, grant, deny, reset };
}
