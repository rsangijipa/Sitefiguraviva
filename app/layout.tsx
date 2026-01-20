import type { Metadata } from "next";
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
    title: {
        default: "Instituto Figura Viva | Gestalt-Terapia & Formação",
        template: "%s | Instituto Figura Viva"
    },
    description: "Um espaço vivo de acolhimento clínico e formação profissional em Gestalt-Terapia. Encontros que transformam e florescem.",
    keywords: ["Gestalt-Terapia", "Psicologia", "Formação Clínica", "Instituto Figura Viva", "Porto Velho", "Richard Sangi"],
    authors: [{ name: "Instituto Figura Viva" }],
    creator: "Richard Sangi",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://figuraviva.com.br",
        title: "Instituto Figura Viva | Gestalt-Terapia",
        description: "Acolhimento clínico e formação profissional em Gestalt-Terapia.",
        siteName: "Instituto Figura Viva",
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`}>
            <body className="antialiased bg-paper text-text overflow-x-hidden">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
