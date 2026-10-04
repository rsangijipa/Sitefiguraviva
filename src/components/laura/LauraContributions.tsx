"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Sparkles, Quote } from "lucide-react";

export function LauraContributions() {
  const { contributions } = lauraPerlsContent;

  return (
    <section className="py-16 md:py-24 bg-[#FDFAF4] relative overflow-hidden border-t border-[#D8CFBE]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles size={16} className="text-[#96551F]" />
            <div className="h-px w-10 bg-[#96551F]/30" />
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F]">
              Legado Clínico
            </span>
            <div className="h-px w-10 bg-[#96551F]/30" />
            <Sparkles size={16} className="text-[#96551F]" />
          </div>

          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight tracking-tight">
            Contribuições{" "}
            <span className="italic text-[#96551F] font-light">
              Fundamentais
            </span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#262B22]/80 font-serif italic max-w-2xl mx-auto">
            Os pilares teóricos e práticos que Laura Perls desenvolveu ao longo
            de sua trajetória.
          </p>
        </div>

        {/* Contributions Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {contributions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white border border-[#D8CFBE] p-6 md:p-7 rounded-2xl shadow-xs transition-colors duration-300 hover:border-[#005A1F]/40 h-full flex flex-col justify-between">
                <div>
                  {/* Number Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#005A1F] border border-[#FDFAF4]/40 rounded-full flex items-center justify-center shadow-xs">
                    <span className="font-serif text-sm font-bold text-[#FDFAF4]">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-[#005A1F]/10 border border-[#005A1F]/20 rounded-full flex items-center justify-center text-[#005A1F] mb-4">
                    <Quote size={18} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-[#005A1F] mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-[#262B22]/85 font-serif leading-relaxed text-sm italic font-light mb-6">
                    {item.summary}
                  </p>
                </div>

                {/* Implication */}
                <div className="pt-4 border-t border-[#D8CFBE]/60">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#96551F] mb-1.5">
                    Implicação Clínica
                  </p>
                  <p className="text-xs text-[#262B22]/80 font-serif leading-relaxed italic">
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
