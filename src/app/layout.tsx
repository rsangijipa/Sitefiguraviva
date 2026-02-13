import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://figuraviva.com.br"),
  title: {
    default: "Instituto Figura Viva | Gestalt-Terapia & Formação",
    template: "%s | Instituto Figura Viva",
  },
  description:
    "Um espaço vivo de acolhimento clínico e formação profissional em Gestalt-Terapia. Encontros que transformam e florescem.",
  keywords: [
    "Gestalt-Terapia",
    "Psicologia",
    "Formação Clínica",
    "Instituto Figura Viva",
    "Ouro Preto D'Oeste",
    "Richard Sangi",
  ],
  authors: [{ name: "Instituto Figura Viva" }],
  creator: "Richard Sangi",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://figuraviva.com.br",
    title: "Instituto Figura Viva | Gestalt-Terapia & Formação Clínica",
    description:
      "Acolhimento clínico e formação profissional em Gestalt-Terapia. Encontros que transformam vidas.",
    siteName: "Instituto Figura Viva",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Instituto Figura Viva",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instituto Figura Viva",
    description: "Gestalt-Terapia & Formação Clínica em Rondônia.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import { cookies } from "next/headers";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { WebVitalsReporter } from "@/components/system/WebVitalsReporter";
import LenisProvider from "@/components/providers/LenisProvider";
import JsonLd from "@/components/system/JsonLd";
import GoogleAnalytics from "@/components/system/GoogleAnalytics";
import PushNotificationManager from "@/components/system/PushNotificationManager";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has("admin_session_backup");

  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="antialiased bg-paper text-text overflow-x-hidden">
        <a href="#main-content" className="skip-to-content">
          Pular para o conteúdo principal
        </a>
        <Providers>
          <Script
            id="unregister-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (window.navigator && window.navigator.serviceWorker) {
                  window.navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister();
                      console.log('Old Service Worker unregistered');
                    }
                  });
                }
              `,
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Instituto Figura Viva",
              url: "https://figuraviva.com.br",
              logo: "https://figuraviva.com.br/logo.png",
              sameAs: ["https://www.instagram.com/institutofiguraviva/"],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Ouro Preto do Oeste",
                addressRegion: "RO",
                addressCountry: "BR",
              },
            }}
          />
          <WebVitalsReporter />
          <GoogleAnalytics />
          <PushNotificationManager />
          <LenisProvider>{children}</LenisProvider>
          {isImpersonating && <ImpersonationBanner />}
        </Providers>
      </body>
    </html>
  );
}
