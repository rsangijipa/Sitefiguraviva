"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/lib/consent";
import { disableAnalytics, validAnalyticsId } from "@/lib/analytics-consent";
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
export default function GoogleAnalytics() {
  const { consent, ready } = useCookieConsent();
  const id = validAnalyticsId(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
  const initialized = useRef(false);
  useEffect(() => {
    if (!id || !ready || consent !== "granted") {
      disableAnalytics();
      return;
    }
    const analytics = window as AnalyticsWindow;
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = false;
    analytics.dataLayer ??= [];
    analytics.gtag ??= function (..._args: unknown[]) {
      analytics.dataLayer!.push(arguments);
    };
    if (!initialized.current) {
      analytics.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      analytics.gtag("js", new Date());
      initialized.current = true;
    }
    analytics.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    analytics.gtag("config", id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    return disableAnalytics;
  }, [id, ready, consent]);
  if (!id || !ready || consent !== "granted") return null;
  return (
    <Script
      id="figure-viva-analytics-loader"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
    />
  );
}
