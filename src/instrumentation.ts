import * as Sentry from "@sentry/nextjs";
import { isResourceLocation } from "@/lib/observability/resource-privacy";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError:typeof Sentry.captureRequestError = (...args) => {
  if (isResourceLocation(args[1].path)) return;
  return Sentry.captureRequestError(...args);
};
