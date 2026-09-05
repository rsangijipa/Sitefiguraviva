import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Heart, MapPin, Sprout } from "lucide-react";

import { ConsultationCta } from "@/features/public-site/components/ConsultationCta";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import { PublicSiteFrame } from "@/features/public-site/components/PublicSiteFrame";

export const metadata: Metadata = {
  title: "O Instituto",
  description:
    "Conheça a história, os valores e a presença do Instituto Figura Viva em Rondônia.",
  alternates: { canonical: "/instituto" },
};

const values = [
  {
    icon: Heart,
    title: "Rigor que acolhe",
    text: "Densidade teórica, ética e cuidado sem perder a singularidade de cada encontro.",
  },
  {
    icon: Sprout,
    title: "Presença e awareness",
    text: "A percepção do aqui-agora como caminho para escolhas mais conscientes.",
  },
  {
    icon: Compass,
    title: "Olhar situado",
    text: "Uma prática comprometida com território, cultura e perspectivas decoloniais.",
  },
];

export default function InstitutePage() {
  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Instituto Figura Viva"
        title="Um espaço onde estudo, clínica e encontro criam raízes."
        description="Nascemos em Rondônia para cultivar uma Gestalt-terapia viva: teoricamente consistente, sensível ao território e profundamente humana."
        actions={
          <>
            <Link
              href="/instituto/fundadora"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-6 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-primary-dark"
            >
              Conhecer a fundadora <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/instituto/manifesto"
              className="inline-flex min-h-12 items-center rounded-md border border-border bg-paper px-6 text-xs font-bold uppercase tracking-[0.14em] text-primary hover:bg-areia"
            >
              Ler o manifesto
            </Link>
          </>
        }
      />

      <section className="py-20 md:py-28">
        <div className="fv-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="fv-eyebrow mb-4">O que nos orienta</p>
              <h2 className="heading-section text-primary">
                Formação técnica é inseparável de desenvolvimento humano.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {values.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-md border border-border bg-surface p-6">
                  <Icon className="text-gold" size={24} aria-hidden="true" />
                  <h3 className="mt-6 font-serif text-xl text-primary">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text/70">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="fv-bg fv-bg-manifesto border-y border-border bg-areia py-20 md:py-28">
        <div className="fv-container grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="fv-eyebrow mb-4">Fundação e curadoria</p>
            <h2 className="heading-section text-primary">Uma trajetória dedicada à relação.</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-text/75">
              A curadoria integra clínica, docência e pesquisa para construir percursos que acolhem complexidade e mantêm a experiência próxima da vida real.
            </p>
            <Link
              href="/instituto/fundadora"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary hover:text-gold"
            >
              História e currículo <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-md border border-border bg-paper p-8 md:p-10">
            <MapPin className="text-terra" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-3xl text-primary">Presença em Rondônia</h2>
            <p className="mt-4 leading-relaxed text-text/70">
              Rua Santos Dumont, 156 — União, Ouro Preto do Oeste — RO.
              Atividades presenciais e encontros online conectam profissionais de diferentes territórios.
            </p>
            <a
              href="https://maps.google.com/?q=Instituto%20Figura%20Viva%20Ouro%20Preto%20do%20Oeste"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
            >
              Abrir localização
            </a>
          </div>
        </div>
      </section>

      <ConsultationCta />
    </PublicSiteFrame>
  );
}
