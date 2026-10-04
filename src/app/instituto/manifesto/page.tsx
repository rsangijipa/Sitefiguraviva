import { getPublicPage } from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { DEFAULT_INSTITUTE } from "@/lib/siteSettings";
import type { Metadata } from "next";
import Link from "next/link";

import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Habitar a fronteira: o manifesto que orienta o Instituto Figura Viva.",
  alternates: { canonical: "/instituto/manifesto" },
};

export default async function ManifestoPage() {
  const institute = await getPublicPage("institute", DEFAULT_INSTITUTE);
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Manifesto Figura Viva"
        title={institute.manifesto_title}
        description={institute.manifesto_description}
      />

      <article className="fv-bg fv-bg-manifesto py-20 md:py-28">
        <div className="fv-container max-w-4xl">
          <div className="space-y-8 font-serif text-2xl leading-[1.65] text-primary/90 md:text-3xl">
            {institute.manifesto_body.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          <blockquote className="my-16 border-l-2 border-terra py-3 pl-8 font-serif text-3xl italic leading-snug text-primary md:text-5xl">
            “{institute.quote}”
          </blockquote>

          <p className="max-w-2xl text-lg leading-relaxed text-text/75">
            Figura Viva é nome e direção: perceber a figura que pede atenção,
            respeitar o fundo que a sustenta e permanecer disponível para o
            movimento do que está vivo.
          </p>

          <Link
            href="/instituto"
            className="mt-10 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.14em] text-primary underline underline-offset-4"
          >
            Voltar ao Instituto
          </Link>
        </div>
      </article>
    </PublicSiteFrame>
  );
}
