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
    <section className="section-padding bg-white relative">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block"
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

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-paper p-8 rounded-2xl border border-stone-100 shadow-soft-sm relative group hover:shadow-soft-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="absolute top-8 right-8 text-gold/10 rotate-180 group-hover:text-gold/20 transition-colors">
                <Quote size={48} />
              </div>

              <div className="flex gap-1 mb-6 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              <p className="text-primary/80 leading-relaxed font-serif text-lg mb-8 relative z-10">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4 border-t border-primary/5 pt-6 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-primary font-bold text-sm">
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
