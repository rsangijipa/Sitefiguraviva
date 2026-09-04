"use client";

import { Sparkles, Heart, Brain, ArrowRight } from "lucide-react";
import { buttonVariants } from "../ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SectionShell from "../ui/SectionShell";

/**
 * Nossa Essência.
 *
 * A coluna com a foto e o selo "15+ anos" foi removida: o texto é o argumento
 * desta seção, e a moldura orgânica com brilho, reflexo e rotação no hover era
 * o bloco mais pesado da home — três animações simultâneas atrás de uma imagem
 * decorativa. Sem ela a seção passa a coluna única, com os três pilares em
 * grade, e o respiro faz o trabalho que a foto fazia.
 */
export default function MethodologySection() {
  const pillars = [
    {
      icon: <Heart className="text-gold" size={22} />,
      title: "Acolhimento",
      text: "Um olhar que não julga, mas compreende a totalidade do ser em sua fenomenologia.",
    },
    {
      icon: <Brain className="text-gold" size={22} />,
      title: "Awareness",
      text: "Expandir a consciência para viver plenamente o aqui e agora, com presença.",
    },
    {
      icon: <Sparkles className="text-gold" size={22} />,
      title: "Método Vivo",
      text: "Teoria sólida integrada à prática clínica transformadora e em constante evolução.",
    },
  ];

  return (
    <SectionShell className="bg-paper">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-gold/50" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold">
            Nossa Essência
          </span>
        </div>

        <h2 className="heading-section mb-8">
          Mais que uma técnica, <br />
          <span className="italic font-light text-primary/80">
            uma forma de estar no mundo.
          </span>
        </h2>

        <p className="text-base lg:text-lg leading-[1.7] text-muted max-w-[65ch]">
          O Instituto Figura Viva nasceu para ser um solo fértil onde
          profissionais e buscadores podem lançar raízes profundas na
          Gestalt-Terapia. Acreditamos que a formação técnica é inseparável do
          desenvolvimento humano e da sensibilidade estética.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="group flex items-start gap-4">
            <div className="p-3 bg-surface rounded-xl shadow-soft-sm border border-gold/15 shrink-0 transition-shadow duration-200 group-hover:shadow-soft-md">
              {pillar.icon}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-primary mb-1">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {pillar.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <Link
          href="#cursos"
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "w-full sm:w-auto uppercase tracking-widest text-xs font-bold px-8",
          )}
        >
          Conheça as Formações <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </SectionShell>
  );
}
