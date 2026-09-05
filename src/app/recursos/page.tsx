import type { Metadata } from "next";

import ResourcesSection from "@/components/ResourcesSection";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import { PublicSiteFrame } from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Recursos de cuidado",
  description:
    "Práticas digitais de respiração, awareness, escuta corporal e autocuidado.",
  alternates: { canonical: "/recursos" },
};

export default function ResourcesPage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Ferramentas de cuidado"
        title="Pequenas pausas para ampliar a presença."
        description="Experiências breves para respirar, nomear emoções e perceber o corpo. Elas apoiam o autocuidado, mas não substituem acompanhamento profissional."
      />
      <ResourcesSection />
    </PublicSiteFrame>
  );
}
