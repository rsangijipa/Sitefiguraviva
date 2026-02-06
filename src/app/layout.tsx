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

import { cookies } from 'next/headers';
import ImpersonationBanner from '@/components/admin/ImpersonationBanner';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const isImpersonating = cookieStore.has('admin_session_backup');

    return (
        <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`}>
            <body className="antialiased bg-paper text-text overflow-x-hidden">
                <Providers>
                    {children}
                    {isImpersonating && <ImpersonationBanner />}
                </Providers>
            </body>
        </html>
    );
}
