"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      text: "A formação mudou minha prática clínica. Sinto-me muito mais segura para estar com meus pacientes e intervir com criatividade.",
      author: "Marina S.",
      role: "Psicóloga Clínica",
      location: "São Paulo, SP",
    },
    {
      id: 2,
      text: "Um espaço de aprendizado acolhedor e rigoroso. A união da teoria com a vivência prática faz toda a diferença.",
      author: "Carlos E.",
      role: "Estudante de Psicologia",
      location: "Minas Gerais",
    },
    {
      id: 3,
      text: "Encontrei no Instituto Figura Viva a comunidade que eu buscava. Trocas ricas e supervisão de altíssima qualidade.",
      author: "Fernanda L.",
      role: "Gestalt-Terapeuta",
      location: "Online",
    },
  ];

  return (
    <section className="fv-section fv-section--sand fv-bg fv-bg-testimonials">
      <div className="fv-container">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="fv-eyebrow mb-4"
          >
            Vozes que Florescem
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="heading-section"
          >
            O impacto da nossa <br />
            <span className="italic font-light">Comunidade</span>
          </motion.h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="fv-card group relative p-10"
            >
              <div className="absolute right-8 top-8 rotate-180 text-terra/15 transition-colors group-hover:text-terra/25">
                <Quote size={48} />
              </div>

              <div className="flex gap-1 mb-6 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              <p className="relative z-10 mb-8 font-serif text-xl leading-relaxed text-text">
                "{t.text}"
              </p>

              <div className="mt-auto flex items-center gap-4 border-t border-border/70 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-areia text-sm font-bold text-primary">
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">{t.author}</p>
                  <p className="text-xs text-muted uppercase tracking-wider">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
