import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { getLegalSettings } from "@/lib/legal.server";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Instituto Figura Viva coleta, usa e protege os seus dados pessoais, e quais são os seus direitos sob a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default async function PrivacidadePage() {
  const legal = await getLegalSettings();
  return <LegalDocument doc={legal.privacy} type="privacy" />;
}
