import { env } from '@/config/env';

type EventName =
    | 'page_view'
    | 'click'
    | 'form_submit'
    | 'error'
    | 'auth_login'
    | 'auth_logout'
    | 'feature_usage'
    | 'web_vital';

interface TelemetryProperties {
    [key: string]: string | number | boolean | undefined | null;
}

class Telemetry {
    private isDev = env.NODE_ENV === 'development';

    public track(event: EventName, properties?: TelemetryProperties) {
        if (this.isDev) {
            console.groupCollapsed(`[Telemetry] ${event}`);
            console.dir(properties, { depth: null });
            console.groupEnd();
            return;
        }

        // TODO: Integrate with Production Provider (e.g., PostHog, Segment, Firebase Analytics)
        // For now, we just ensure it doesn't crash
        try {
            // placeholder for prod implementation
            // window.gtag('event', event, properties);
        } catch (e) {
            // Fail silently
        }
    }

    public error(error: any, context?: TelemetryProperties) {
        this.track('error', {
            message: error?.message || String(error),
            stack: error?.stack,
            ...context,
        });
    }
}

export const telemetry = new Telemetry();
