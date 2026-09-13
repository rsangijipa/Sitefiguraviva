import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPublicPage } from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { DEFAULT_FOUNDER } from "@/lib/siteSettings";
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
  return getPublicPage("founder", DEFAULT_FOUNDER);
}

const trajectory = [
  {
    year: "Formação",
    title: "Psicologia e Gestalt-terapia",
    text: "Formação em Psicologia seguida de especialização em Gestalt-terapia, com aprofundamento em trauma, psicoterapia corporal e neurodiversidades.",
  },
  {
    year: "Atuação",
    title: "Clínica, docência e pesquisa",
    text: "Trajetória que integra atendimento clínico, formação de novos terapeutas e produção em pesquisa, sustentada por perspectivas feministas e decoloniais.",
  },
  {
    year: "Contribuição",
    title: "À frente do Figura Viva",
    text: "Conduz o Instituto a partir dessa mesma prática — formando com rigor clínico e presença no território.",
  },
];

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
        backgroundImage="/assets/fv/heroes/fundadora.png"
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
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-primary">
          <Image
            src={founder.image || "/assets/foto-grupo.jpg"}
            alt={`Retrato de ${name}`}
            fill
            className="object-cover sepia-[0.08] saturate-[1.05]"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>
        <article className="self-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Retrato e resumo
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-primary md:text-5xl">
            Uma prática feita de relação.
          </h2>
          <p className="mt-7 whitespace-pre-line text-lg leading-relaxed text-primary/70">
            {founder.bio ||
              `${name} construiu sua trajetória a partir da escuta, da prática clínica e do compromisso com uma formação que reconhece a complexidade de cada encontro.`}
          </p>
        </article>
      </div>

      {/* Trajetória cronológica / formação e atuação / contribuição */}
      <div className="container mx-auto max-w-6xl px-6 pb-16">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
          Trajetória
        </p>
        <div className="mt-8 grid gap-10 border-t border-primary/10 pt-10 md:grid-cols-3">
          {trajectory.map((item) => (
            <div key={item.year}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                {item.year}
              </span>
              <h3 className="mt-2 font-serif text-2xl text-primary">
                {item.title}
              </h3>
              <p className="mt-3 leading-relaxed text-primary/65">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Currículo + CTA */}
      <div className="container mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[2rem] border border-primary/10 bg-[#eee9df] p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Currículo
              </p>
              <p className="mt-3 max-w-xl leading-relaxed text-primary/70 dark:text-[#31513b]">
                Trajetória documentada em detalhe na Plataforma Lattes.
              </p>
            </div>
            {founder.link && (
              <a
                href={founder.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold uppercase tracking-widest text-primary hover:text-gold dark:text-[#173522]"
              >
                Ver currículo Lattes <ArrowRight size={15} />
              </a>
            )}
          </div>
          <Link
            href="/instituto"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-gold dark:text-[#173522]"
          >
            <ArrowLeft size={15} /> Voltar ao Instituto
          </Link>
        </div>
      </div>
    </PublicSiteFrame>
  );
}
