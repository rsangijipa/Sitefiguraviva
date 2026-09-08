"use client";

import { motion } from "framer-motion";
import { MapPin, Globe, Calendar } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function InteractiveMap() {
  const { journeyMap } = lauraPerlsContent;

  return (
    <section className="py-14 bg-[#0d0906] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 800 400">
          <defs>
            <pattern
              id="mapPattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#e8e4db" />
            </pattern>
          </defs>
          <rect fill="url(#mapPattern)" width="100%" height="100%" />
        </svg>
      </div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <path
          d="M 200,150 Q 300,100 400,120 T 600,100"
          fill="none"
          stroke="#c9a768"
          strokeWidth="2"
          strokeDasharray="10,10"
          className="animate-pulse"
        />
      </svg>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a768]/60" />
            <span className="w-12 h-12 rounded-full bg-[#241b12] flex items-center justify-center">
              <Globe size={24} className="text-[#f5ecd9]" />
            </span>
            <div className="h-px w-12 bg-[#c9a768]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#c7b89a] block mb-4">
            Jornada Global
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#e8e4db] leading-tight">
            Onde Laura{" "}
            <span className="italic text-[#d4b578] font-light">
              Viviu e Trabalhou
            </span>
          </h2>
        </div>

        {/* Map Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {journeyMap.map((country, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connection Line (except last) */}
              {index < journeyMap.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-px bg-[#c9a768]/50 z-10" />
              )}

              {/* Country Card */}
              <div className="bg-[#241b12] rounded-lg shadow-xl overflow-hidden h-full">
                {/* Header */}
                <div className="bg-[#3a2d1c] px-6 py-4 flex items-center gap-3">
                  <span className="text-3xl">{country.flag}</span>
                  <h3 className="font-serif text-2xl text-[#e8e4db]">
                    {country.country}
                  </h3>
                </div>

                {/* Cities */}
                <div className="p-6 space-y-4">
                  {country.cities.map((city, cityIndex) => (
                    <div
                      key={cityIndex}
                      className="relative pl-6 border-l-2 border-[#4a3c28]"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#c9a768]" />

                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-[#a9987d]" />
                        <span className="font-bold text-[#e6d7bd]">
                          {city.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#8f7c64] mb-2">
                        <Calendar size={10} />
                        <span>{city.year}</span>
                      </div>

                      <p className="text-sm text-[#cbb896] font-serif italic">
                        {city.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Decorative Footer */}
                <div className="px-6 py-3 bg-[#1b140d] flex justify-center">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a768]/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a768]/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a768]/40" />
                  </div>
                </div>
              </div>

              {/* Animated Arrow */}
              {index < journeyMap.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#c9a768] rotate-45 z-20 animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Países", value: "3", icon: "🌍" },
            { label: "Anos de Atuação", value: "85", icon: "📅" },
            { label: "Cidades", value: "5", icon: "🏙️" },
            { label: "Gerações Formadas", value: "∞", icon: "👥" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-[#241b12]/10 rounded-lg border border-[#c9a768]/30"
            >
              <span className="text-3xl block mb-2">{stat.icon}</span>
              <span className="font-serif text-3xl text-[#e8e4db] font-bold">
                {stat.value}
              </span>
              <span className="block text-xs text-[#c7b89a] uppercase tracking-widest mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
