"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Sparkles, Quote } from "lucide-react";

export function LauraContributions() {
  const { contributions } = lauraPerlsContent;

  return (
    <section className="py-16 bg-[#1b140d] relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, #e6d7bd 50px, #e6d7bd 51px)`,
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-[#4a3c28]/30 rotate-45 pointer-events-none hidden md:block" />
      <div className="absolute bottom-40 left-8 w-20 h-20 border border-[#3a2d1c]/40 pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles size={18} className="text-[#d4b578]" />
            <div className="h-px w-16 bg-[#c9a768]/50" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8f7c64]">
              Legado Clínico
            </span>
            <div className="h-px w-16 bg-[#c9a768]/50" />
            <Sparkles size={18} className="text-[#d4b578]" />
          </div>

          <h2 className="font-serif text-4xl md:text-6xl text-[#f5ecd9] leading-tight tracking-tight">
            Contribuições{" "}
            <span className="italic text-[#cbb896] font-light">
              Fundamentais
            </span>
          </h2>
          <p className="mt-6 text-lg text-[#e6d7bd] font-serif italic max-w-2xl mx-auto">
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
              <div className="relative bg-[#241b12] border border-[#4a3c28] p-8 md:p-10 rounded-sm shadow-sm hover:shadow-xl transition-all duration-700 h-full">
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#c9a768]/40 to-transparent group-hover:via-[#c9a768]/70 transition-colors" />

                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#1b140d] border border-[#4a3c28] rounded-full flex items-center justify-center shadow-md">
                  <span className="font-serif text-lg font-bold text-[#d4b578]">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#1b140d] border border-[#4a3c28] rounded-full flex items-center justify-center text-[#a9987d] mb-10 group-hover:text-[#d4b578]/50 group-hover:border-[#c9a768]/20 transition-all duration-500">
                  <Quote size={24} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl text-[#f5ecd9] mb-5 tracking-tight group-hover:text-[#e6d7bd] transition-colors">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-[#e6d7bd] font-serif leading-relaxed text-lg italic font-light mb-12">
                  {item.summary}
                </p>

                {/* Implication */}
                <div className="pt-6 border-t border-[#4a3c28]/50">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#8f7c64] mb-4 transition-colors group-hover:text-[#d4b578]/40">
                    Implicação Clínica
                  </p>
                  <p className="text-sm text-[#cbb896] font-serif leading-relaxed italic group-hover:text-[#e6d7bd] transition-colors">
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
