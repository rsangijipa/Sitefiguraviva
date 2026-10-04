import * as Sentry from "@sentry/nextjs";

// Action Required for navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of your transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  // Disable Sentry in development
  enabled: process.env.NODE_ENV === "production",

  // Filter out common noise
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    // Facebook borked
    "fb_xd_fragment",
    // ISP injecting ads
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // Chrome extensions
    "chrome-extension://",
    "moz-extension://",
  ],

  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception && process.env.NODE_ENV === "production") {
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  },
});
