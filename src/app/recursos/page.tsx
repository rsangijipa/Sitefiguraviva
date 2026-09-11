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
        description="Ferramentas interativas para observar, sentir e refletir. Use-as como convites de autocuidado, nunca como diagnóstico."
      />
      <ResourcesSection />
      <div className="container mx-auto max-w-6xl px-6 py-8">
        <p className="border-t border-primary/10 pt-6 text-sm leading-relaxed text-primary/70">
          <strong className="text-primary">Aviso:</strong> estes recursos são
          educativos e não substituem acompanhamento profissional.
        </p>
      </div>
    </PublicSiteFrame>
  );
}
