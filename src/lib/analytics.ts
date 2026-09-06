"use client";

// Simple Analytics Helper
// Can be expanded to GA4, Mixpanel, or a Supabase-backed event sink.

export async function trackEvent(
  eventName: string,
  params: Record<string, any> = {},
) {
  // 1. Console Log (Dev)
  if (process.env.NODE_ENV === "development") {
    console.group(`📊 Analytics: ${eventName}`);
    console.table(params);
    console.groupEnd();
  }

  // Production delivery is handled by the telemetry module.
}
