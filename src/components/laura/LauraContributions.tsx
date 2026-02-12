"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Sparkles, Quote } from "lucide-react";

export function LauraContributions() {
  const { contributions } = lauraPerlsContent;

  return (
    <section className="py-32 bg-[#f5f2eb] relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, #8b7355 50px, #8b7355 51px)`,
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-[#d4c4a8]/30 rotate-45 pointer-events-none hidden md:block" />
      <div className="absolute bottom-40 left-8 w-20 h-20 border border-[#e8dfd1]/40 pointer-events-none hidden md:block" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles size={18} className="text-[#c9a86c]" />
            <div className="h-px w-16 bg-[#c9a86c]/50" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080]">
              Legado Clínico
            </span>
            <div className="h-px w-16 bg-[#c9a86c]/50" />
            <Sparkles size={18} className="text-[#c9a86c]" />
          </div>

          <h2 className="font-serif text-4xl md:text-6xl text-[#5c4a32] leading-tight tracking-tight">
            Contribuições{" "}
            <span className="italic text-[#8b6f4e] font-light">
              Fundamentais
            </span>
          </h2>
          <p className="mt-6 text-lg text-[#6b5a45] font-serif italic max-w-2xl mx-auto">
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
              <div className="relative bg-[#faf8f3] border border-[#e8dfd1] p-8 rounded-sm shadow-sm hover:shadow-xl transition-all duration-700 h-full">
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#c9a86c]/40 to-transparent group-hover:via-[#c9a86c]/70 transition-colors" />

                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#f5f2eb] border border-[#d4c4a8] rounded-full flex items-center justify-center shadow-md">
                  <span className="font-serif text-lg font-bold text-[#c9a86c]">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#f0ebe0] border border-[#e8dfd1] rounded-full flex items-center justify-center text-[#8b7355] mb-8 group-hover:bg-[#c9a86c]/10 group-hover:border-[#c9a86c]/30 transition-all duration-500">
                  <Quote size={24} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl text-[#5c4a32] mb-4 tracking-tight group-hover:text-[#6b5a45] transition-colors">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-[#6b5a45] font-serif leading-relaxed text-lg italic mb-8">
                  {item.summary}
                </p>

                {/* Implication */}
                <div className="pt-6 border-t border-[#e8dfd1]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a89080] mb-3 flex items-center gap-2">
                    <span className="w-4 h-px bg-[#c9a86c]/50" />
                    Implicação Clínica
                    <span className="w-4 h-px bg-[#c9a86c]/50" />
                  </p>
                  <p className="text-sm text-[#5c4a32] font-serif leading-relaxed italic">
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
