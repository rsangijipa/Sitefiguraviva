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
    title: "Instituto Figura Viva | Gestalt-Terapia",
    description: "Um espaço vivo de acolhimento clínico e formação profissional em Gestalt-Terapia.",
    icons: {
        icon: "/favicon.ico",
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
