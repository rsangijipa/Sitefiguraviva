import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import { PublicSiteFrame } from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Habitar a fronteira: o manifesto que orienta o Instituto Figura Viva.",
  alternates: { canonical: "/instituto/manifesto" },
};

export default function ManifestoPage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Manifesto Figura Viva"
        title="Habitar a fronteira."
        description="A vida acontece no contato: entre o que sentimos e o que podemos criar, entre a história que nos trouxe e a presença que escolhemos cultivar."
      />

      <article className="fv-bg fv-bg-manifesto py-20 md:py-28">
        <div className="fv-container max-w-4xl">
          <div className="space-y-8 font-serif text-2xl leading-[1.65] text-primary/90 md:text-3xl">
            <p>
              Na Gestalt, a vida acontece na fronteira entre organismo e
              ambiente, entre o que sinto e o que digo, entre o que foi e o que
              pode nascer agora.
            </p>
            <p>
              No Figura Viva, levamos esse encontro a sério — com rigor, ética e
              humanidade. Não oferecemos fórmulas para caber em pessoas. Criamos
              condições para que cada pessoa perceba como está no mundo e
              reconheça novas possibilidades de escolha.
            </p>
            <p>
              Aprender, para nós, é uma experiência inteira. O corpo participa.
              A história participa. O território participa. A diferença
              participa. Teoria e prática se encontram quando o conhecimento
              transforma a qualidade da presença.
            </p>
            <p>
              Sustentamos uma clínica situada, atenta às relações de poder e
              comprometida com modos de cuidado que não apagam singularidades.
              Acolher não é suavizar a realidade: é criar apoio para
              atravessá-la com consciência.
            </p>
          </div>

          <blockquote className="my-16 border-l-2 border-terra py-3 pl-8 font-serif text-3xl italic leading-snug text-primary md:text-5xl">
            “O encontro é a fronteira onde a vida se renova.”
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
