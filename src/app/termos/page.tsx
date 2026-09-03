import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalSettings } from "@/lib/legal.server";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Condições de uso do site, do conteúdo e dos serviços educacionais do Instituto Figura Viva.",
  alternates: { canonical: "/termos" },
};

export default async function TermosPage() {
  const legal = await getLegalSettings();
  return <LegalDocument doc={legal.terms} type="terms" />;
}
