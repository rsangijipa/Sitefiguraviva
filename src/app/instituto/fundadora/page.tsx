import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ConsultationCta } from "@/features/public-site/components/ConsultationCta";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import { PublicSiteFrame } from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "Fundadora",
  description:
    "Conheça a trajetória clínica, docente e de pesquisa de Lilian Vanessa Nicacio Gusmão Vianei.",
  alternates: { canonical: "/instituto/fundadora" },
};

export default function FounderPage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Fundação e curadoria"
        title="Lilian Vanessa Nicacio Gusmão Vianei"
        description="Psicóloga, Gestalt-terapeuta e pesquisadora. Uma trajetória que aproxima clínica, docência e compromisso com as singularidades do território."
      />

      <article className="py-20 md:py-28">
        <div className="fv-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-md border border-border bg-areia lg:sticky lg:top-32">
              <Image
                src="/assets/lilian-vanessa.jpeg"
                alt="Lilian Vanessa, fundadora do Instituto Figura Viva"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="fv-eyebrow mb-4">Uma prática em movimento</p>
            <h2 className="font-serif text-4xl leading-tight text-primary md:text-5xl">
              Clínica e formação como lugares de encontro.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-[1.85] text-text/78">
              <p>
                Sua trajetória integra atendimento clínico, formação de
                profissionais e pesquisa. O trabalho parte da Gestalt-terapia e
                dialoga com psicoterapia corporal, trauma, neurodiversidades e
                perspectivas feministas e decoloniais.
              </p>
              <p>
                No Instituto Figura Viva, essa experiência sustenta uma
                curadoria que não separa teoria de vida. Cada percurso busca
                oferecer repertório técnico e, ao mesmo tempo, ampliar a
                capacidade de presença diante do outro.
              </p>
              <p>
                A docência é compreendida como uma relação: um campo onde
                perguntas podem amadurecer, diferenças são reconhecidas e
                conhecimento se constrói com responsabilidade ética.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
              <a
                href="http://lattes.cnpq.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-6 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-primary-dark"
              >
                Currículo Lattes completo{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <Link
                href="/instituto/manifesto"
                className="inline-flex min-h-12 items-center rounded-md border border-border px-6 text-xs font-bold uppercase tracking-[0.14em] text-primary hover:bg-areia"
              >
                Ler o manifesto
              </Link>
            </div>
          </div>
        </div>
      </article>

      <ConsultationCta />
    </PublicSiteFrame>
  );
}
