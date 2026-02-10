"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

export function LauraHero() {
  const { hero } = lauraPerlsContent;

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#0d0c0b]">
      {/* Cinematic Light Leak - Rich Sepia Tone */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#2d261f]/30 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a1917]/50 rounded-full blur-[120px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="flex items-center gap-4">
            <span className="inline-block px-4 py-1 rounded-sm border border-[#2d261f] text-[10px] tracking-[0.4em] uppercase font-bold text-stone-500 bg-[#141312]/80 backdrop-blur-sm">
              Arquivo Histórico
            </span>
            <div className="h-px w-12 bg-[#2d261f]" />
          </div>

          <h1 className="font-serif text-5xl md:text-8xl leading-[0.85] text-stone-200 tracking-tighter">
            Laura <br />{" "}
            <span className="italic text-[#c5a05b] font-light">Posner</span>{" "}
            Perls
          </h1>

          <p className="text-xl md:text-3xl font-serif text-stone-400 max-w-lg leading-relaxed italic border-l border-[#2d261f] pl-8">
            {hero.title}
          </p>

          <div className="grid grid-cols-2 gap-10 pt-10 border-t border-[#1a1917]">
            {hero.quickFacts.map((fact, i) => (
              <div key={i} className="group">
                <span className="block text-[10px] uppercase tracking-[0.3em] text-stone-600 mb-2 group-hover:text-[#c5a05b]/60 transition-colors">
                  {fact.label}
                </span>
                <span className="font-serif text-stone-300 text-xl tracking-tight">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Column (Dramatic Vintage Frame) */}
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Soft Shadow Glow */}
          <div className="absolute inset-0 bg-[#c5a05b]/5 blur-[100px] rounded-full scale-110" />

          <div className="aspect-[3/4] md:aspect-[4/5] bg-stone-950 relative overflow-hidden rounded-sm shadow-[0_0_120px_rgba(0,0,0,0.8)] border-[20px] border-[#141312]">
            {/* Real Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hero.image && (
                <Image
                  src={hero.image}
                  alt="Laura Perls"
                  fill
                  className="object-cover grayscale sepia-[0.5] brightness-75 transition-all duration-1000"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  loading="eager"
                />
              )}
            </div>
            {/* Dramatic Vintage Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.95)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Legend Tag - Minimalist Archive style */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#141312] text-stone-600 px-8 py-2.5 text-[9px] uppercase tracking-[0.4em] font-bold border border-stone-900 whitespace-nowrap shadow-2xl">
            Acervo Digital No. 742-LP
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 text-xs tracking-widest uppercase cursor-pointer"
        onClick={() =>
          document
            .getElementById("timeline")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span>Linha do Tempo</span>
        <ArrowDown size={14} className="animate-bounce" />
      </motion.div>
    </section>
  );
}
