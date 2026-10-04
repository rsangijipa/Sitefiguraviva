import type { Metadata } from "next";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import ResourcesSection from "@/components/ResourcesSection";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Experiências interativas e materiais de reflexão do Instituto Figura Viva.",
  alternates: { canonical: "/recursos" },
  openGraph: {
    title: "Recursos | Figura Viva",
    description: "Ferramentas para ampliar a percepção e o cuidado.",
  },
};

export default function ResourcesPage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Experiências"
        title="Recursos para a presença"
        description="Ferramentas interativas para observar, sentir e refletir."
        notice="Recursos educativos: não substituem acompanhamento profissional."
        backgroundImage="/assets/fv/heroes/recursos.png"
      />
      <ResourcesSection />
    </PublicSiteFrame>
  );
}
