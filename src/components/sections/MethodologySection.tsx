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
      text: "Um olhar que não julga, mas compreende a totalidade do ser.",
    },
    {
      icon: <Brain className="text-gold" size={24} />,
      title: "Awareness",
      text: "Expandir a consciência para viver plenamente o aqui e agora.",
    },
    {
      icon: <Sparkles className="text-gold" size={24} />,
      title: "Método Vivo",
      text: "Teoria sólida integrada à prática clínica transformadora.",
    },
  ];

  return (
    <section className="section-padding bg-paper relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10" />

      <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Image with Organic Mask */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-[4/5] relative rounded-organic-2 overflow-hidden shadow-soft-xl border border-white/50">
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
            {/* Placeholder Image - Replace with real one */}
            <img
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=1000&auto=format&fit=crop"
              alt="Sessão de Gestalt-Terapia"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
            />
          </div>
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-8 -right-8 bg-white p-6 rounded-organic-3 shadow-premium max-w-[200px]"
          >
            <p className="font-serif text-2xl text-primary font-bold">15+</p>
            <p className="text-xs text-primary/60 uppercase tracking-widest font-bold">
              Anos de experiência clínica
            </p>
          </motion.div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-6 block">
            Nossa Essência
          </span>
          <h2 className="heading-section mb-8">
            Mais que uma técnica, <br />
            <span className="italic font-light text-primary/80">
              uma forma de estar no mundo.
            </span>
          </h2>
          <p className="prose-organic mb-10 text-base">
            O Instituto Figura Viva nasceu para ser um solo fértil onde
            profissionais e buscadores podem lançar raízes profundas na
            Gestalt-Terapia. Acreditamos que a formação técnica é inseparável do
            desenvolvimento humano.
          </p>

          <div className="space-y-8 mb-12">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-3 bg-white rounded-xl shadow-soft-sm border border-gold/10 shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-primary">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {pillar.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            href="#cursos"
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "w-full sm:w-auto shadow-glow-gold",
            )}
          >
            Conheça Nossas Formações <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
