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

class Telemetry {
  private isDev = env.NODE_ENV === "development";
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

  public track(event: EventName, properties?: TelemetryProperties) {
    if (this.isDev) {
      console.groupCollapsed(`[Telemetry] ${event}`);
      console.dir(properties, { depth: null });
      console.groupEnd();
    }

    if (this.analytics) {
      try {
        logEvent(this.analytics, event as string, properties as any);
      } catch (e) {
        // Fail silently
        if (this.isDev) console.warn("Analytics Error", e);
      }
    }
  }

  public error(error: any, context?: TelemetryProperties) {
    this.track("error", {
      message: error?.message || String(error),
      stack: error?.stack,
      ...context,
    });
    // Could also integrate Sentry here
  }
}

export const telemetry = new Telemetry();
