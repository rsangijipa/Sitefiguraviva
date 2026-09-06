import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Leaf } from "lucide-react";
import { db } from "@/lib/firebase/admin";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "O Instituto",
  description:
    "Conheça a essência, a história e o campo de atuação do Instituto Figura Viva.",
  alternates: { canonical: "/instituto" },
  openGraph: {
    title: "O Instituto | Figura Viva",
    description: "Um campo de estudo, cuidado e presença em Rondônia.",
  },
};

async function getInstituteData() {
  try {
    const [institute, founder] = await Promise.all([
      db.collection("siteSettings").doc("institute").get(),
      db.collection("siteSettings").doc("founder").get(),
    ]);
    return { institute: institute.data() || {}, founder: founder.data() || {} };
  } catch {
    return { institute: {}, founder: {} };
  }
}

export default async function InstitutePage() {
  const { institute, founder } = await getInstituteData();
  const title = institute.title || "Instituto Figura Viva";
  const manifesto =
    institute.manifesto_text ||
    "Aqui, Gestalt-terapia é caminho: estudo, prática e presença para quem deseja cuidar e se formar com densidade.";

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Sobre nós"
        title={title}
        description={
          institute.subtitle ||
          "Um campo aberto para encontro, formação e transformação no coração de Rondônia."
        }
        actions={
          <Link
            href="/instituto/fundadora"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-gold"
          >
            Conheça a fundadora <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Nossa essência
          </p>
          <div>
            <h2 className="font-serif text-4xl leading-tight text-primary md:text-5xl">
              Presença que se torna prática.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-primary/70">
              {manifesto}
            </p>
          </div>
        </section>
        <section className="mt-20 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: HeartHandshake,
              title: "Encontro",
              text: "Cuidado ético, escuta e relação como fundamentos.",
            },
            {
              icon: Compass,
              title: "Rigor",
              text: "Formações que aproximam teoria, experiência e prática clínica.",
            },
            {
              icon: Leaf,
              title: "Território",
              text: "Uma presença viva na Amazônia e nos diferentes modos de existir.",
            },
          ].map(({ icon: Icon, title: cardTitle, text }) => (
            <article
              key={cardTitle}
              className="rounded-3xl border border-primary/10 bg-white/60 p-7"
            >
              <Icon className="text-gold" size={22} />
              <h3 className="mt-6 font-serif text-2xl text-primary">
                {cardTitle}
              </h3>
              <p className="mt-3 leading-relaxed text-primary/65">{text}</p>
            </article>
          ))}
        </section>
        <section className="mt-20 rounded-[2rem] bg-[#eee9df] p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Uma história em movimento
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl text-primary">
            A memória da fundadora continua abrindo caminhos.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-primary/70">
            {founder.name
              ? `${founder.name} conduz este campo com uma prática dedicada à formação e ao cuidado.`
              : "Conheça quem sustenta este campo de presença, estudo e cuidado."}
          </p>
          <Link
            href="/instituto/fundadora"
            className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold uppercase tracking-widest text-primary hover:text-gold"
          >
            Ler trajetória <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </PublicSiteFrame>
  );
}
