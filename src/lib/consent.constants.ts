/**
 * Shared between the consent UI (src/lib/consent.ts, client-only) and the
 * telemetry singleton (src/lib/telemetry.ts, imported from both runtimes).
 * Kept free of the "use client" directive so neither side pulls the other's
 * runtime in as a dependency.
 */
export const CONSENT_STORAGE_KEY = "fv:cookie-consent";
export const CONSENT_EVENT = "fv:consent-change";
