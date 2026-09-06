import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase/admin";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Fundadora",
  description: "Conheça Lília, fundadora do Instituto Figura Viva.",
  alternates: { canonical: "/instituto/fundadora" },
  openGraph: {
    title: "Fundadora | Figura Viva",
    description:
      "A trajetória e a prática que dão forma ao Instituto Figura Viva.",
  },
};

async function getFounder() {
  try {
    const snap = await db.collection("siteSettings").doc("founder").get();
    return snap.data() || {};
  } catch {
    return {};
  }
}

export default async function FounderPage() {
  const founder = await getFounder();
  const name = founder.name || "Lília";
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Fundadora"
        title={name}
        description={
          founder.role ||
          "Gestalt-terapeuta, formadora e guardiã de um campo de encontros."
        }
        actions={
          <Link
            href="/formacoes"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-gold"
          >
            Conheça as formações <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="container mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[0.65fr_1fr] md:py-24">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-stone-100 shadow-xl">
          <Image
            src={founder.image || "/assets/foto-grupo.jpg"}
            alt={`Retrato de ${name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>
        <article className="self-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Trajetória e presença
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-primary md:text-5xl">
            Uma prática feita de relação.
          </h2>
          <p className="mt-7 whitespace-pre-line text-lg leading-relaxed text-primary/70">
            {founder.bio ||
              `${name} construiu sua trajetória a partir da escuta, da prática clínica e do compromisso com uma formação que reconhece a complexidade de cada encontro.`}
          </p>
          {founder.link && (
            <a
              href={founder.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold uppercase tracking-widest text-primary hover:text-gold"
            >
              Ver currículo Lattes <ArrowRight size={15} />
            </a>
          )}
        </article>
      </div>
      <div className="container mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[2rem] border border-gold/20 bg-gold/5 p-8 md:p-12">
          <p className="font-serif text-3xl italic leading-tight text-primary md:text-4xl">
            “A presença começa quando deixamos o encontro nos transformar.”
          </p>
          <Link
            href="/instituto"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-gold"
          >
            <ArrowLeft size={15} /> Voltar ao Instituto
          </Link>
        </div>
      </div>
    </PublicSiteFrame>
  );
}
