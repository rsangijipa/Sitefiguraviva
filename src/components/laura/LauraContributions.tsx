"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Sparkles, Quote } from "lucide-react";

export function LauraContributions() {
  const { contributions } = lauraPerlsContent;

  return (
    <section className="py-32 bg-[#d9d4c9] relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, #4a3a2a 50px, #4a3a2a 51px)`,
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-[#b8ad96]/30 rotate-45 pointer-events-none hidden md:block" />
      <div className="absolute bottom-40 left-8 w-20 h-20 border border-[#d9d4c9]/40 pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles size={18} className="text-[#a88a4d]" />
            <div className="h-px w-16 bg-[#a88a4d]/50" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8a7a6a]">
              Legado Clínico
            </span>
            <div className="h-px w-16 bg-[#a88a4d]/50" />
            <Sparkles size={18} className="text-[#a88a4d]" />
          </div>

          <h2 className="font-serif text-4xl md:text-6xl text-[#3a2f25] leading-tight tracking-tight">
            Contribuições{" "}
            <span className="italic text-[#5a4838] font-light">
              Fundamentais
            </span>
          </h2>
          <p className="mt-6 text-lg text-[#4a3a2a] font-serif italic max-w-2xl mx-auto">
            Os pilares teóricos e práticos que Laura Perls desenvolveu ao longo
            de sua trajetória
          </p>
        </div>

        {/* Contributions Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {contributions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-[#e8e4db] border border-[#b8ad96] p-8 md:p-10 rounded-sm shadow-sm hover:shadow-xl transition-all duration-700 h-full">
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#a88a4d]/40 to-transparent group-hover:via-[#a88a4d]/70 transition-colors" />

                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#d9d4c9] border border-[#b8ad96] rounded-full flex items-center justify-center shadow-md">
                  <span className="font-serif text-lg font-bold text-[#a88a4d]">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#d9d4c9] border border-[#b8ad96] rounded-full flex items-center justify-center text-[#6a5a4a] mb-10 group-hover:text-[#a88a4d]/50 group-hover:border-[#a88a4d]/20 transition-all duration-500">
                  <Quote size={24} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl text-[#3a2f25] mb-5 tracking-tight group-hover:text-[#4a3a2a] transition-colors">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-[#4a3a2a] font-serif leading-relaxed text-lg italic font-light mb-12">
                  {item.summary}
                </p>

                {/* Implication */}
                <div className="pt-6 border-t border-[#b8ad96]/50">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#8a7a6a] mb-4 transition-colors group-hover:text-[#a88a4d]/40">
                    Implicação Clínica
                  </p>
                  <p className="text-sm text-[#5a4838] font-serif leading-relaxed italic group-hover:text-[#4a3a2a] transition-colors">
                    "{item.implication}"
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
