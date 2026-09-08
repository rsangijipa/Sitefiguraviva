"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function WhySheMatters() {
  const { whySheMatters } = lauraPerlsContent;

  return (
    <section className="py-14 bg-[#1b140d] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="quotePattern"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <Quote size={30} fill="#e8e4db" />
            </pattern>
          </defs>
          <rect fill="url(#quotePattern)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a768]/60" />
            <span className="w-10 h-10 rounded-full bg-[#241b12] flex items-center justify-center">
              <Quote size={20} className="text-[#e6d7bd]" />
            </span>
            <div className="h-px w-12 bg-[#c9a768]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#c7b89a] block mb-4">
            Por Que Laura Importa
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#e8e4db] leading-tight">
            A <span className="italic text-[#d4b578] font-light">Essência</span>{" "}
            de Laura Perls
          </h2>
        </div>

        {/* Quotes Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {whySheMatters.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Quote Card */}
              <div className="bg-[#241b12] rounded-lg shadow-xl p-8 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#c9a768]/10 flex items-center justify-center">
                    <Quote size={24} className="text-[#e6d7bd]" />
                  </div>
                </div>

                {/* Quote Text */}
                <p className="font-serif text-xl text-[#e6d7bd] italic leading-relaxed flex-1">
                  "{item.quote}"
                </p>

                {/* Context */}
                <div className="mt-6 pt-4 border-t border-[#4a3c28]">
                  <p className="text-xs text-[#a9987d] uppercase tracking-wider font-bold">
                    {item.context}
                  </p>
                </div>
              </div>

              {/* Decorative Number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#c9a768] flex items-center justify-center shadow-lg">
                <span className="font-serif text-xl font-bold text-[#e6d7bd]">
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
          className="mt-16 text-center"
        >
          <div className="inline-block max-w-3xl p-8 bg-[#241b12]/10 rounded-lg border border-[#c9a768]/30">
            <p className="font-serif text-xl text-[#e8e4db] italic leading-relaxed">
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
