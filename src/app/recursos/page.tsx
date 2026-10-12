import type { Metadata } from "next";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import ResourcesSection from "@/components/ResourcesSection";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Experiências de percepção e pausa, além de materiais de reflexão do Instituto Figura Viva.",
  alternates: { canonical: "/recursos" },
  openGraph: {
    title: "Recursos | Figura Viva",
    description: "Experiências de percepção, pausa e estudo no seu ritmo.",
  },
};

export default function ResourcesPage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Experiências"
        title="Experiências de aprendizagem"
        description="Experiências de percepção e pausa para explorar no seu ritmo."
        notice="Recursos educativos: não substituem acompanhamento profissional."
        backgroundImage="/assets/fv/heroes/recursos.webp"
      />
      <ResourcesSection />
    </PublicSiteFrame>
  );
}
