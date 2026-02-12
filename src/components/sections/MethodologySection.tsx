"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Brain, ArrowRight } from "lucide-react";
import { buttonVariants } from "../ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SectionShell from "../ui/SectionShell";

export default function MethodologySection() {
  const pillars = [
    {
      icon: <Heart className="text-gold" size={24} />,
      title: "Acolhimento",
      text: "Um olhar que não julga, mas compreende a totalidade do ser em sua fenomenologia.",
    },
    {
      icon: <Brain className="text-gold" size={24} />,
      title: "Awareness",
      text: "Expandir a consciência para viver plenamente o aqui e agora, com presença.",
    },
    {
      icon: <Sparkles className="text-gold" size={24} />,
      title: "Método Vivo",
      text: "Teoria sólida integrada à prática clínica transformadora e em constante evolução.",
    },
  ];

  return (
    <SectionShell
      className="bg-paper"
      containerClassName="grid lg:grid-cols-2 gap-16 items-center"
    >
      {/* Left: Cinematic Image Container with Organic Reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative lg:scale-110"
      >
        {/* Magic Reflection Wrapper - Efeito de Reflexo Aquático */}
        <div className="magic-reflection mb-40 lg:mb-56 group">
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 10, rotateX: 3 }}
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
            className="aspect-[3/4] md:aspect-[4/5] relative rounded-organic-1 overflow-hidden shadow-soft-2xl border-[12px] border-white/10 backdrop-blur-sm cursor-pointer p-1"
          >
            {/* Inner Translucent Guard */}
            <div className="absolute inset-0 border border-white/30 rounded-organic-1 z-30 pointer-events-none" />

            {/* Magic Shimmer Overlay - Brilho Efervescente */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div className="absolute inset-y-0 -left-1/2 w-64 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] blur-3xl animate-magic-shimmer" />
            </div>

            {/* Dynamic Aura - Atmosfera Mágica */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-gold/30 opacity-50 z-10 mix-blend-overlay group-hover:opacity-80 transition-opacity duration-1000" />

            <img
              src="/essencia.jpg"
              alt="Instituto Figura Viva - Nossa Essência"
              className="w-full h-full object-cover transform transition-transform duration-[2000ms] group-hover:scale-110 rounded-organic-1"
            />
          </motion.div>

          {/* Subtle light ripple below for extra "magic" feel */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-gold/10 blur-[50px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>

        {/* Premium Floating Badge - Light Theme Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-8 rounded-organic-3 shadow-premium shadow-glow-gold/10 max-w-[220px] border border-stone-50 z-30"
        >
          <p className="font-serif text-3xl text-primary font-bold mb-1">15+</p>
          <div className="h-0.5 w-8 bg-gold/40 mb-3" />
          <p className="text-[10px] text-primary/60 uppercase tracking-widest font-bold leading-tight">
            Anos de excelência clínica e humana
          </p>
        </motion.div>
      </motion.div>

      {/* Right: Content Layer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
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

        <p className="prose-organic mb-10 text-base lg:text-lg">
          O Instituto Figura Viva nasceu para ser um solo fértil onde
          profissionais e buscadores podem lançar raízes profundas na
          Gestalt-Terapia. Acreditamos que a formação técnica é inseparável do
          desenvolvimento humano e da sensibilidade estética.
        </p>

        <div className="space-y-6 mb-12">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="group flex items-start gap-5 hover:translate-x-1 transition-transform"
            >
              <div className="p-3 bg-white rounded-xl shadow-soft-sm border border-gold/10 shrink-0 group-hover:shadow-soft-md transition-shadow">
                {pillar.icon}
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-primary mb-1">
                  {pillar.title}
                </h4>
                <p className="text-sm text-muted leading-relaxed font-light">
                  {pillar.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="#cursos"
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "w-full sm:w-auto shadow-glow-gold uppercase tracking-widest text-xs font-bold px-8",
            )}
          >
            Conheça as Formações <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </SectionShell>
  );
}
