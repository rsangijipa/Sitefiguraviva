import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicPage } from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { DEFAULT_FOUNDER, DEFAULT_INSTITUTE } from "@/lib/siteSettings";
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
  const [institute, founder] = await Promise.all([
    getPublicPage("institute", DEFAULT_INSTITUTE),
    getPublicPage("founder", DEFAULT_FOUNDER),
  ]);
  return { institute, founder };
}

export default async function InstitutePage() {
  const { institute, founder } = await getInstituteData();
  const title = institute.title || "Instituto Figura Viva";
  const manifesto =
    institute.manifesto_text ||
    "Aqui, Gestalt-terapia é caminho: estudo, prática e presença para quem deseja cuidar e se formar com densidade.";

  const timeline = [
    {
      year: "2022",
      title: "Fundação do Instituto",
      text: "Nasce o Figura Viva, a partir de uma prática clínica já consolidada em Rondônia.",
    },
    {
      year: "2023",
      title: "Primeiras formações abertas",
      text: "O que era supervisão e grupo de estudo se torna formação estruturada, aberta à região.",
    },
    {
      year: "2024",
      title: "Expansão do campo de atuação",
      text: "Novos ciclos, parcerias e turmas ampliam o alcance do trabalho pelo Norte do país.",
    },
    {
      year: "Hoje",
      title: "Um campo em contato permanente",
      text: "Clínica, docência e pesquisa seguem se atravessando na prática cotidiana do Instituto.",
    },
  ];

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Sobre nós"
        title={title}
        description={
          institute.subtitle ||
          "Um campo aberto para encontro, formação e transformação no coração de Rondônia."
        }
        backgroundImage="/assets/fv/heroes/instituto.png"
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
        {/* 01 — Manifesto */}
        <section className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            01 — Manifesto
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

        {/* 02 — De onde formamos */}
        <section className="mt-20 grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            02 — De onde formamos
          </p>
          <div>
            <h2 className="font-serif text-3xl leading-tight text-primary md:text-4xl">
              Um campo de formação a partir de Rondônia.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary/70">
              Formamos a partir do Norte do país — não como recorte geográfico,
              mas como lugar de escuta. O território molda o que ensinamos: os
              modos de viver, cuidar e se relacionar que aqui se apresentam não
              cabem em modelos importados. Rigor clínico e enraizamento
              territorial caminham juntos.
            </p>
          </div>
        </section>

        {/* 03 — Encontro / Rigor / Território */}
        <section className="mt-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            03 — Fundamentos
          </p>
          <div className="mt-8 grid divide-y divide-primary/10 border-t border-primary/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                title: "Encontro",
                text: "Cuidado ético, escuta e relação como fundamentos.",
              },
              {
                title: "Rigor",
                text: "Formações que aproximam teoria, experiência e prática clínica.",
              },
              {
                title: "Território",
                text: "Uma presença viva na Amazônia e nos diferentes modos de existir.",
              },
            ].map(({ title: panelTitle, text }) => (
              <div key={panelTitle} className="py-8 md:px-8 md:py-2">
                <h3 className="font-serif text-2xl text-primary">
                  {panelTitle}
                </h3>
                <p className="mt-3 leading-relaxed text-primary/65">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — Linha do tempo */}
        <section className="mt-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            04 — Uma história em movimento
          </p>
          <div className="mt-10 grid gap-10 border-l border-primary/15 pl-8 md:grid-cols-4 md:gap-6 md:border-l-0 md:pl-0">
            {timeline.map((item) => (
              <div
                key={item.year}
                className="relative md:border-l md:border-primary/15 md:pl-6"
              >
                <span className="font-serif text-2xl text-gold">
                  {item.year}
                </span>
                <h3 className="mt-2 text-base font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-primary/65">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 05 — Fundadora */}
        <section className="mt-20 grid items-center gap-10 rounded-[2rem] bg-[#eee9df] p-8 md:grid-cols-[0.85fr_1.15fr] md:p-12">
          {founder.image && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl md:mx-0">
              <Image
                src={founder.image}
                alt={founder.name || "Fundadora do Instituto Figura Viva"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 320px"
              />
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
              05 — Fundadora
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
          </div>
        </section>

        {/* 06 — CTA */}
        <section className="mt-20 flex flex-col items-center gap-6 py-8 text-center">
          <h2 className="max-w-xl font-serif text-3xl text-primary md:text-4xl">
            Formação que nasce do encontro.
          </h2>
          <Link
            href="/formacoes"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-gold"
          >
            Conheça nossas formações <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </PublicSiteFrame>
  );
}
