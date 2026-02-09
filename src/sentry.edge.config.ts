import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // PII Scrubbing (SEN-01)
  beforeSend(event) {
    // 1. Scrub User Data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // 2. Scrub Emails from Messages
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    if (event.message) {
      event.message = event.message.replace(emailRegex, "[EMAIL]");
    }

    if (event.exception?.values) {
      event.exception.values.forEach((exception) => {
        if (exception.value) {
          exception.value = exception.value.replace(emailRegex, "[EMAIL]");
        }
      });
    }

    return event;
  },
});
