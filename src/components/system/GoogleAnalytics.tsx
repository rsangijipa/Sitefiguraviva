"use client";

import Script from "next/script";
import { useSEOSettings } from "@/hooks/useSiteSettings";
import { useCookieConsent } from "@/lib/consent";

export default function GoogleAnalytics() {
  const { data: seo } = useSEOSettings();
  const { consent } = useCookieConsent();
  const gaId = seo?.googleAnalyticsId;

  // LGPD: audience measurement only runs after explicit opt-in.
  if (!gaId || consent !== "granted") return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
