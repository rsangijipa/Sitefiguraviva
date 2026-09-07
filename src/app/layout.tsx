import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import "@/components/resources/apps/emotion-tree/emotion-tree.css";
import Providers from "./providers";

/**
 * As duas famílias do Design System v1 (seção 3.2).
 *
 * Fraunces é serifa humanista variável: o eixo `opsz` acerta o contraste do
 * desenho para cada tamanho, e `SOFT`/`WONK` permitem que o mesmo tipo se
 * comporte de modo sóbrio no registro Institucional e expressivo no
 * Confluência. Substitui a Cormorant Garamond, que tinha eixo único e um
 * traço fino demais para corpo de título.
 *
 * Karla é grotesca humanista ligeiramente estreita — economiza largura em
 * card sem perder legibilidade em corpo pequeno. Substitui a Lato.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-serif",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
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
    // Social card comes from src/app/opengraph-image.tsx (file convention).
  },
  twitter: {
    card: "summary_large_image",
    title: "Instituto Figura Viva",
    description: "Gestalt-Terapia & Formação Clínica em Rondônia.",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Figura Viva",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  // Sobrescrito em tempo de execução pelo ThemeProvider; estes são os padrões
  // que o navegador usa antes do JS, por preferência do sistema.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF4" },
    { media: "(prefers-color-scheme: dark)", color: "#12160F" },
  ],
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
import CookieConsent from "@/components/system/CookieConsent";
import { themeInitScript } from "@/components/providers/ThemeProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has("admin_session_backup");

  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${karla.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Antes da primeira pintura: sem isto o tema escuro aparece só depois
            da hidratação e a pessoa leva um flash de tela clara na cara. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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
                      console.error('Old Service Worker unregistered');
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
              logo: "https://figuraviva.com.br/icon-512x512.png",
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
          <CookieConsent />
          <main
            id="main-content"
            className="flex-1 w-full outline-none"
            tabIndex={-1}
          >
            <LenisProvider>{children}</LenisProvider>
          </main>
          {isImpersonating && <ImpersonationBanner />}
        </Providers>
      </body>
    </html>
  );
}
