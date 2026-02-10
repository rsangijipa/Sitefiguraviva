import { env } from "@/config/env";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { app } from "@/lib/firebase/client"; // Ensure app is exported from client init

type EventName =
  | "page_view"
  | "click"
  | "form_submit"
  | "error"
  | "auth_login"
  | "auth_logout"
  | "feature_usage"
  | "web_vital"
  | "gamification_event"; // Added for tracking gamification

interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined | null;
}

class TelemetryService {
  private isDev = process.env.NODE_ENV === "development";
  private analytics: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      isSupported()
        .then((supported) => {
          if (supported) {
            this.analytics = getAnalytics(app);
          }
        })
        .catch((err) => console.warn("Firebase Analytics not supported", err));
    }
  }

  public track(event: string, properties?: Record<string, any>) {
    // 1. Dev Logging
    if (this.isDev) {
      const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
      console.log(`${scope} [Telemetry] ${event}`, properties);
    }

    // 2. Client-Side Analytics (Firebase)
    if (this.analytics && typeof window !== "undefined") {
      try {
        logEvent(this.analytics, event, properties || {});
      } catch (e) {
        if (this.isDev) console.warn("Analytics Error", e);
      }
    }

    // 3. Server-Side Analytics (Future Sentry/PostHog)
    if (typeof window === "undefined") {
      // TODO: Add Server-Side Analytics provider here
    }
  }

  public error(error: any, context?: Record<string, any>) {
    const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
    console.error(`${scope} [Telemetry Error]`, error, context);
    // TODO: Sentry.captureException(error, { extra: context });
  }

  public identify(userId: string, traits?: Record<string, any>) {
    if (this.isDev) {
      console.log(`[Telemetry] Identify: ${userId}`, traits);
    }
    // TODO: Set user context for Sentry/PostHog
  }
}

export const telemetry = new TelemetryService();
