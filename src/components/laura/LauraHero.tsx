"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ArrowDown, BookOpen } from "lucide-react";
import Image from "next/image";

export function LauraHero() {
  const { hero } = lauraPerlsContent;

  return (
    <section className="relative flex min-h-[82svh] items-center justify-center overflow-hidden bg-[#FDFAF4] py-16 md:py-20">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#005A1F]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-12 h-80 w-80 rounded-full bg-[#96551F]/5 blur-3xl pointer-events-none" />

      {/* Center Decorative Line */}
      <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-[#D8CFBE] to-transparent pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        {/* Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Archive Badge */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#005A1F]/20 text-[10px] tracking-[0.2em] uppercase font-bold text-[#005A1F] bg-white/90">
              <BookOpen size={12} aria-hidden="true" />
              Arquivo Histórico
            </span>
            <div className="h-px flex-1 max-w-20 bg-[#96551F]/30" />
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] uppercase tracking-[0.24em] text-[#96551F] font-bold"
            >
              Uma vida dedicada à psicoterapia
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.9] text-[#005A1F] tracking-tight">
              Laura <br />{" "}
              <span className="italic text-[#96551F] font-light">Posner</span>{" "}
              Perls
            </h1>
          </div>

          {/* Quote */}
          <p className="text-lg md:text-xl font-serif text-[#262B22] max-w-lg leading-relaxed italic border-l-2 border-[#96551F] pl-4 py-1">
            {hero.title}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-5 border-t border-[#D8CFBE]">
            {hero.quickFacts.map((fact) => (
              <div key={fact.label} className="group">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#96551F] mb-1 font-bold">
                  {fact.label}
                </span>
                <span className="font-serif text-[#262B22] text-base tracking-tight">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Column */}
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Subtle Frame */}
          <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#D8CFBE] bg-[#F1E9DB]">
            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hero.image && (
                <Image
                  src={hero.image}
                  alt="Laura Perls"
                  fill
                  className="object-cover sepia-[0.2] contrast-[0.98] transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  loading="eager"
                />
              )}
            </div>

            {/* Subtle Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,90,31,0.08)] pointer-events-none" />
          </div>

          {/* Legend Tag */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#005A1F] text-[#FDFAF4] px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold border border-[#96551F] whitespace-nowrap shadow-xs">
            Acervo vivo · Laura Perls
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#005A1F] text-[11px] tracking-widest uppercase cursor-pointer"
        onClick={() =>
          document
            .getElementById("timeline")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span className="font-bold">Linha do Tempo</span>
        <div className="w-px h-5 bg-[#96551F] relative">
          <ArrowDown
            size={11}
            className="absolute -bottom-1.5 -left-1.5 animate-bounce text-[#96551F]"
          />
        </div>
      </motion.button>
    </section>
  );
}
