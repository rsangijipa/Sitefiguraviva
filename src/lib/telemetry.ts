import { env } from "@/config/env";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { app } from "@/lib/firebase/client";
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from "@/lib/consent.constants";

type EventName =
  | "page_view"
  | "click"
  | "form_submit"
  | "error"
  | "auth_login"
  | "auth_logout"
  | "feature_usage"
  | "web_vital"
  | "gamification_event";

interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined | null;
}

class TelemetryService {
  private isDev = process.env.NODE_ENV === "development";
  private analytics: any = null;

  constructor() {
    if (typeof window === "undefined") return;

    this.initAnalyticsIfConsented();

    // Pick up the visitor's decision without a reload, and mirror it across
    // tabs, the same way the cookie banner does.
    window.addEventListener(CONSENT_EVENT, () =>
      this.initAnalyticsIfConsented(),
    );
    window.addEventListener("storage", () => this.initAnalyticsIfConsented());
  }

  /**
   * Firebase Analytics is audience measurement, so under the LGPD it waits for
   * the same opt-in as Google Analytics instead of initialising on import.
   */
  private hasConsent(): boolean {
    try {
      return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted";
    } catch {
      return false;
    }
  }

  private initAnalyticsIfConsented() {
    if (this.analytics || !this.hasConsent()) return;

    isSupported()
      .then((supported) => {
        if (!supported || !this.hasConsent()) return;
        try {
          this.analytics = getAnalytics(app);
        } catch (e) {
          if (this.isDev)
            console.warn("[Telemetry] Firebase Analytics init error", e);
        }
      })
      .catch(() => {
        // Silent fallback if analytics is blocked or unsupported
      });
  }

  public track(event: string, properties?: Record<string, any>) {
    if (this.isDev) {
      const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
      console.log(`${scope} [Telemetry] ${event}`, properties);
    }

    // Re-checked per call so revoking consent stops collection immediately.
    if (this.analytics && typeof window !== "undefined" && this.hasConsent()) {
      try {
        logEvent(this.analytics, event, properties || {});
      } catch (e) {
        // Ignore analytics tracking errors
      }
    }
  }

  public error(error: any, context?: Record<string, any>) {
    const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
    console.error(`${scope} [Telemetry Error]`, error, context);
  }

  public identify(userId: string, traits?: Record<string, any>) {
    if (this.isDev) {
      console.log(`[Telemetry] Identify: ${userId}`, traits);
    }
  }
}

export const telemetry = new TelemetryService();
