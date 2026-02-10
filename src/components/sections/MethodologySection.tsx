"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Brain, ArrowRight } from "lucide-react";
import { buttonVariants } from "../ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <section className="section-padding bg-paper relative overflow-hidden">
      {/* Decorative Background Elements - Light Theme */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Cinematic Image Container with Organic Reveal */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative px-4"
        >
          <div className="aspect-[4/5] relative rounded-organic-2 overflow-hidden shadow-soft-xl border border-white/50">
            <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-10" />
            <img
              src="/essencia.jpg"
              alt="Figura Viva - Nossa Essência"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
            />
          </div>

          {/* Premium Floating Badge - Light Theme Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-8 rounded-organic-3 shadow-premium max-w-[220px] border border-stone-50"
          >
            <p className="font-serif text-3xl text-primary font-bold mb-1">
              15+
            </p>
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
      </div>
    </section>
  );
}
