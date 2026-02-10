"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Sparkles } from "lucide-react";

export function LauraContributions() {
  const { contributions } = lauraPerlsContent;

  return (
    <section className="py-32 bg-[#0d0c0b] relative overflow-hidden">
      {/* Background Texture Overlay - Subtle cinematic grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-stone-600">
            Fundamentos
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-stone-200 mt-6 leading-tight tracking-tight">
            Contribuições Clínicas
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {contributions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="group relative bg-[#141312]/50 backdrop-blur-sm border border-stone-900 p-8 md:p-10 rounded-sm hover:border-[#c5a05b]/20 hover:bg-[#1a1917]/80 transition-all duration-700"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c5a05b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-12 h-12 bg-stone-950 border border-stone-900 rounded-full flex items-center justify-center text-stone-600 mb-10 group-hover:text-[#c5a05b]/50 group-hover:border-[#c5a05b]/20 transition-all duration-500">
                <Sparkles size={20} strokeWidth={1} />
              </div>

              <h3 className="font-serif text-2xl text-stone-100 mb-5 tracking-tight group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-stone-400 font-serif leading-relaxed text-lg italic font-light mb-12">
                {item.summary}
              </p>

              <div className="pt-10 border-t border-stone-900/50">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-600 mb-4 transition-colors group-hover:text-[#c5a05b]/40">
                  Implicação Clínica
                </p>
                <p className="text-sm text-stone-500 font-serif leading-relaxed italic group-hover:text-stone-400 transition-colors">
                  "{item.implication}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
