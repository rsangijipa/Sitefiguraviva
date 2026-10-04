/**
 * Secure Logger Utility
 * Prevents sensitive logs from leaking into production console.
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Errors might still be relevant in production for Sentry or monitoring
    // Or we simply console.error them depending on strategy. We'll keep them for now
    // but without full stacktraces if we want to be overly cautious, or just pass them through.
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
};
