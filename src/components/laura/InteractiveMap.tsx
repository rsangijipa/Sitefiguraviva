"use client";

import { motion } from "framer-motion";
import { MapPin, Globe, Calendar } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function InteractiveMap() {
  const { journeyMap } = lauraPerlsContent;

  return (
    <section className="py-14 md:py-24 bg-[#0d0906] relative overflow-hidden">
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

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a768]/60" />
            <span className="w-12 h-12 rounded-full bg-[#241b12] flex items-center justify-center">
              <Globe size={24} className="text-[#262B22]" />
            </span>
            <div className="h-px w-12 bg-[#c9a768]/60" />
          </div>

          <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#e6d7bd] block mb-4">
            Jornada Global
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#e8e4db] leading-tight">
            Onde Laura{" "}
            <span className="italic text-[#d4b578] font-light">
              Viviu e Trabalhou
            </span>
          </h2>
        </div>

        {/* Decorative Connecting Line: sits in normal flow, between the
            header and the cards, so it can never overlap the title text
            regardless of viewport (it used to be `absolute inset-0` over the
            whole section with hardcoded pixel coordinates, which cut
            straight through "Jornada Global" once the section got taller). */}
        <svg
          className="mx-auto -mb-2 hidden h-10 w-full max-w-md pointer-events-none md:block"
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 20,50 Q 200,5 300,30 T 580,10"
            fill="none"
            stroke="#c9a768"
            strokeWidth="2"
            strokeDasharray="10,10"
            className="animate-pulse"
          />
        </svg>

        {/* Map Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
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
              <div className="laura-card-lift bg-[#241b12] rounded-lg border border-[#4a3c28] overflow-hidden h-full transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a768]/60">
                {/* Header */}
                <div className="bg-[#3a2d1c] px-5 py-3 flex items-center gap-3">
                  <span className="text-2xl text-[#e8e4db]">
                    {country.flag}
                  </span>
                  <h3 className="font-serif text-xl text-[#e8e4db]">
                    {country.country}
                  </h3>
                </div>

                {/* Cities */}
                <div className="p-5 space-y-3">
                  {country.cities.map((city, cityIndex) => (
                    <div
                      key={cityIndex}
                      className="relative pl-6 border-l-2 border-[#4a3c28]"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#c9a768]" />

                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-[#6B6B63]" />
                        <span className="font-bold text-[#262B22]">
                          {city.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#6B6B63] mb-2 font-medium">
                        <Calendar size={10} />
                        <span>{city.year}</span>
                      </div>

                      <p className="text-sm text-[#262B22] font-serif italic">
                        {city.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Decorative Footer */}
                <div className="px-5 py-2 bg-[#1b140d] flex justify-center">
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
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { label: "Países", value: "3", icon: "🌍" },
            { label: "Anos de Atuação", value: "85", icon: "📅" },
            { label: "Cidades", value: "5", icon: "🏙️" },
            { label: "Gerações Formadas", value: "∞", icon: "👥" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-3 bg-[#241b12]/10 rounded-md border border-[#c9a768]/30"
            >
              <span className="text-2xl block mb-1">{stat.icon}</span>
              <span className="font-serif text-2xl text-[#262B22] font-bold">
                {stat.value}
              </span>
              <span className="block text-xs text-[#6B6B63] uppercase tracking-widest mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
