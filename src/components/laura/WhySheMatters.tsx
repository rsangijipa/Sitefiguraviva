"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function WhySheMatters() {
  const { whySheMatters } = lauraPerlsContent;

  return (
    <section className="py-16 md:py-24 bg-[#005A1F] text-[#FDFAF4] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#D8CFBE]/40" />
            <span className="w-9 h-9 rounded-full bg-[#07614C] flex items-center justify-center border border-[#D8CFBE]/30">
              <Quote size={16} className="text-[#FDFAF4]" />
            </span>
            <div className="h-px w-10 bg-[#D8CFBE]/40" />
          </div>

          <span className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#D8CFBE] block mb-2">
            Por Que Laura Importa
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#FDFAF4] leading-tight">
            A <span className="italic text-[#F1E9DB] font-light">Essência</span>{" "}
            de Laura Perls
          </h2>
        </div>

        {/* Quotes Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {whySheMatters.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Quote Card */}
              <div className="bg-[#07614C]/60 rounded-2xl border border-[#D8CFBE]/25 p-6 md:p-7 h-full flex flex-col shadow-sm">
                {/* Quote Icon */}
                <div className="mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#005A1F] border border-[#D8CFBE]/30 flex items-center justify-center">
                    <Quote size={16} className="text-[#F1E9DB]" />
                  </div>
                </div>

                {/* Quote Text */}
                <p className="font-serif text-lg text-[#FDFAF4] italic leading-relaxed flex-1">
                  "{item.quote}"
                </p>

                {/* Context */}
                <div className="mt-5 pt-4 border-t border-[#D8CFBE]/20">
                  <p className="text-xs text-[#D8CFBE] uppercase tracking-wider font-semibold">
                    {item.context}
                  </p>
                </div>
              </div>

              {/* Number Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#96551F] border border-[#FDFAF4]/40 flex items-center justify-center shadow-xs">
                <span className="font-serif text-sm font-bold text-[#FDFAF4]">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block max-w-3xl p-6 bg-[#07614C]/40 rounded-2xl border border-[#D8CFBE]/30">
            <p className="font-serif text-base md:text-lg text-[#FDFAF4] italic leading-relaxed">
              Laura Perls não foi apenas a esposa de Fritz Perls. Ela foi uma
              teórica brilhante, uma clínica dedicada e uma pioneira que trouxe
              rigor acadêmico, consciência corporal e profundidade
              fenomenológica para a Gestalt-terapia. Seu legado continua a
              inspirar gerações de terapeutas ao redor do mundo.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
