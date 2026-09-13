"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ArrowDown, BookOpen } from "lucide-react";
import Image from "next/image";

export function LauraHero() {
  const { hero } = lauraPerlsContent;

  return (
    <section className="relative flex min-h-[82svh] items-center justify-center overflow-hidden bg-[#FDFAF4] py-16 md:py-20 dark:bg-[#0d0906]">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#FE538B]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-[18%] h-64 w-72 rounded-full bg-[#FED701]/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-12 h-80 w-80 rounded-full bg-[#01C94D]/20 blur-3xl pointer-events-none" />

      {/* Decorative Vintage Elements */}
      <div className="absolute top-20 left-12 w-20 h-20 border border-[#96551F]/25 rotate-45 pointer-events-none" />
      <div className="absolute bottom-20 right-16 w-14 h-14 border border-[#005A1F]/20 rotate-12 pointer-events-none" />

      {/* Center Decorative Line */}
      <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-[#4a3c28]/30 to-transparent pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        {/* Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Archive Badge */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#005A1F]/20 text-[10px] tracking-[0.2em] uppercase font-bold text-[#005A1F] bg-white/80 dark:border-[#a8d7b4]/30 dark:bg-[#241b12] dark:text-[#a8d7b4]">
              <BookOpen size={12} aria-hidden="true" />
              Arquivo Histórico
            </span>
            <div className="h-px flex-1 max-w-20 bg-[#96551F]/40" />
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] uppercase tracking-[0.24em] text-[#96551F] font-bold dark:text-[#d4b578]"
            >
              Uma vida dedicada à psicoterapia
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.9] text-[#005A1F] tracking-tight dark:text-[#a8d7b4]">
              Laura <br />{" "}
              <span className="italic text-[#96551F] font-light dark:text-[#d4b578]">
                Posner
              </span>{" "}
              Perls
            </h1>
          </div>

          {/* Quote */}
          <p className="text-lg md:text-xl font-serif text-[#262B22] max-w-lg leading-relaxed italic border-l-2 border-[#96551F] pl-4 py-1 dark:text-[#f5ecd9]">
            {hero.title}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-5 border-t border-[#005A1F]/20">
            {hero.quickFacts.map((fact) => (
              <div key={fact.label} className="group">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[#96551F] mb-1 font-bold dark:text-[#d4b578]">
                  {fact.label}
                </span>
                <span className="font-serif text-[#262B22] text-base tracking-tight dark:text-[#f5ecd9]">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Column (Elegant Vintage Frame) */}
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Soft Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FE538B]/25 via-[#FED701]/30 to-[#01C94D]/25 blur-[60px] rounded-full scale-110" />

          {/* Double Frame Effect */}
          <div className="relative aspect-[3/4] md:aspect-[4/5]">
            {/* Outer Frame */}
            <div className="absolute -inset-3 border-2 border-[#005A1F]/30 rounded-sm" />

            {/* Main Image Container */}
            <div className="relative h-full bg-[#F1E9DB] overflow-hidden rounded-sm shadow-xl border-[8px] border-[#005A1F]">
              {/* Inner Border */}
              <div className="absolute inset-0 border border-[#96551F]/60 z-10 pointer-events-none" />

              {/* Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                {hero.image && (
                  <Image
                    src={hero.image}
                    alt="Laura Perls"
                    fill
                    className="object-cover sepia-[0.3] contrast-[0.95] transition-all duration-1000"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    loading="eager"
                  />
                )}
              </div>

              {/* Subtle Vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(58,47,37,0.2)] pointer-events-none" />

              {/* Paper Texture Overlay on Image */}
              <div
                className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
          </div>

          {/* Legend Tag */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#005A1F] text-[#FDFAF4] px-5 py-2 text-[9px] uppercase tracking-[0.2em] font-bold border border-[#96551F] whitespace-nowrap">
            Acervo vivo · Laura Perls
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#005A1F] text-xs tracking-widest uppercase cursor-pointer dark:text-[#a8d7b4]"
        onClick={() =>
          document
            .getElementById("timeline")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span className="font-bold">Linha do Tempo</span>
        <div className="w-px h-6 bg-[#96551F] relative">
          <ArrowDown
            size={12}
            className="absolute -bottom-2 -left-1.5 animate-bounce text-[#96551F]"
          />
        </div>
      </motion.button>
    </section>
  );
}
