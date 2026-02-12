"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ArrowDown, BookOpen } from "lucide-react";
import Image from "next/image";

export function LauraHero() {
  const { hero } = lauraPerlsContent;

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#f5f2eb]">
      {/* Subtle Cream Light Leaks */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#faf8f3]/60 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#f0ebe0]/50 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

      {/* Decorative Vintage Elements */}
      <div className="absolute top-20 left-12 w-24 h-24 border border-[#d4c4a8]/20 rotate-45 pointer-events-none" />
      <div className="absolute bottom-32 right-16 w-16 h-16 border border-[#c9a86c]/20 rotate-12 pointer-events-none" />

      {/* Center Decorative Line */}
      <div className="absolute left-1/2 top-24 bottom-24 w-px bg-gradient-to-b from-transparent via-[#d4c4a8]/30 to-transparent pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
        {/* Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Archive Badge */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[#d4c4a8] text-[10px] tracking-[0.3em] uppercase font-bold text-[#8b7355] bg-[#faf8f3] shadow-sm">
              <BookOpen size={12} />
              Arquivo Histórico
            </span>
            <div className="h-px flex-1 max-w-20 bg-[#d4c4a8]/50" />
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] uppercase tracking-[0.4em] text-[#a89080] font-bold"
            >
              Uma vida dedicada à psicoterapia
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-[#5c4a32] tracking-tight">
              Laura <br />{" "}
              <span className="italic text-[#8b6f4e] font-light">Posner</span>{" "}
              Perls
            </h1>
          </div>

          {/* Quote */}
          <p className="text-xl md:text-2xl font-serif text-[#6b5a45] max-w-lg leading-relaxed italic border-l-2 border-[#c9a86c]/60 pl-6 py-2">
            {hero.title}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#e8dfd1]">
            {hero.quickFacts.map((fact, i) => (
              <div key={i} className="group">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-[#a89080] mb-1 font-bold">
                  {fact.label}
                </span>
                <span className="font-serif text-[#5c4a32] text-lg tracking-tight">
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
          <div className="absolute inset-0 bg-[#c9a86c]/10 blur-[80px] rounded-full scale-110" />

          {/* Double Frame Effect */}
          <div className="relative aspect-[3/4] md:aspect-[4/5]">
            {/* Outer Frame */}
            <div className="absolute -inset-4 border-2 border-[#d4c4a8]/40 rounded-sm" />

            {/* Main Image Container */}
            <div className="relative h-full bg-[#faf8f3] overflow-hidden rounded-sm shadow-2xl border-[12px] border-[#f5f2eb]">
              {/* Inner Border */}
              <div className="absolute inset-0 border border-[#e8dfd1] z-10 pointer-events-none" />

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
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(92,74,50,0.15)] pointer-events-none" />

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
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#f5f2eb] text-[#8b7355] px-8 py-2 text-[9px] uppercase tracking-[0.35em] font-bold border border-[#d4c4a8] whitespace-nowrap shadow-lg">
            <span className="text-[#c9a86c]">★</span> Acervo Digital No. 742-LP{" "}
            <span className="text-[#c9a86c]">★</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#a89080] text-xs tracking-widest uppercase cursor-pointer"
        onClick={() =>
          document
            .getElementById("timeline")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span className="font-bold">Linha do Tempo</span>
        <div className="w-px h-8 bg-[#d4c4a8] relative">
          <ArrowDown
            size={12}
            className="absolute -bottom-2 -left-1.5 animate-bounce text-[#c9a86c]"
          />
        </div>
      </motion.div>
    </section>
  );
}
