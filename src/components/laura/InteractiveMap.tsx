"use client";

import { motion } from "framer-motion";
import { MapPin, Globe, Calendar } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function InteractiveMap() {
  const { journeyMap } = lauraPerlsContent;

  return (
    <section className="py-16 md:py-24 bg-[#FDFAF4] text-[#262B22] relative overflow-hidden border-t border-[#D8CFBE]/60">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/30" />
            <span className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center">
              <Globe size={20} className="text-[#005A1F]" />
            </span>
            <div className="h-px w-10 bg-[#96551F]/30" />
          </div>

          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F] block mb-2">
            Jornada Global
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight">
            Onde Laura{" "}
            <span className="italic text-[#96551F] font-light">
              Viveu e Trabalhou
            </span>
          </h2>
        </div>

        {/* Decorative Connecting Line */}
        <svg
          className="mx-auto -mb-2 hidden h-10 w-full max-w-md pointer-events-none md:block"
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 20,50 Q 200,5 300,30 T 580,10"
            fill="none"
            stroke="#96551F"
            strokeWidth="2"
            strokeDasharray="8,8"
            className="opacity-40"
          />
        </svg>

        {/* Map Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {journeyMap.map((country, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Country Card */}
              <div className="bg-white rounded-2xl border border-[#D8CFBE] overflow-hidden h-full shadow-xs transition-all duration-300 hover:border-[#005A1F]/50">
                {/* Header */}
                <div className="bg-[#F1E9DB]/70 border-b border-[#D8CFBE] px-5 py-3.5 flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <h3 className="font-serif text-xl font-bold text-[#005A1F]">
                    {country.country}
                  </h3>
                </div>

                {/* Cities */}
                <div className="p-5 space-y-4">
                  {country.cities.map((city, cityIndex) => (
                    <div
                      key={cityIndex}
                      className="relative pl-5 border-l-2 border-[#D8CFBE]"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#96551F]" />

                      <div className="flex items-center gap-2 mb-0.5">
                        <MapPin size={13} className="text-[#07614C]" />
                        <span className="font-bold text-sm text-[#262B22]">
                          {city.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#96551F] mb-1.5 font-semibold">
                        <Calendar size={11} />
                        <span>{city.year}</span>
                      </div>

                      <p className="text-xs text-[#262B22]/80 font-serif italic leading-relaxed">
                        {city.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Países", value: "3", icon: "🌍" },
            { label: "Anos de Atuação", value: "85", icon: "📅" },
            { label: "Cidades", value: "5", icon: "🏙️" },
            { label: "Gerações Formadas", value: "∞", icon: "👥" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white rounded-2xl border border-[#D8CFBE] shadow-xs"
            >
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <span className="font-serif text-2xl text-[#005A1F] font-bold">
                {stat.value}
              </span>
              <span className="block text-[10px] text-[#6B6B63] uppercase tracking-widest mt-1 font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
