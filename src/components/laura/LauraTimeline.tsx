"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Calendar, MapPin } from "lucide-react";

export function LauraTimeline() {
  const { timeline } = lauraPerlsContent;

  return (
    <section
      id="timeline"
      className="py-32 bg-[#e8e4db] overflow-hidden relative"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b8ad96]/50 to-transparent" />

      {/* Central Line */}
      <div className="absolute left-8 md:left-1/2 top-32 bottom-32 w-px bg-gradient-to-b from-transparent via-[#a88a4d]/40 to-transparent" />

      {/* Decorative Circles */}
      <div className="absolute top-1/4 right-20 w-40 h-40 rounded-full border border-[#b8ad96]/20 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-1/3 left-16 w-24 h-24 rounded-full border border-[#d9d4c9]/30 pointer-events-none hidden lg:block" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#a88a4d]/60" />
            <Calendar size={16} className="text-[#a88a4d]" />
            <div className="h-px w-12 bg-[#a88a4d]/60" />
          </div>
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8a7a6a] block mb-4">
            Jornada de Vida
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-[#3a2f25] leading-tight tracking-tight">
            Crônica{" "}
            <span className="italic text-[#5a4838] font-light">Histórica</span>
          </h2>
          <div className="h-px w-32 bg-[#a88a4d]/40 mx-auto mt-8" />
        </div>

        {/* Timeline Events */}
        <div className="space-y-24 md:space-y-32">
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Timeline Node */}
              <div className="absolute left-2 md:left-1/2 top-0 w-5 h-5 -ml-2.5 rounded-full bg-[#e8e4db] border-2 border-[#a88a4d] z-20 shadow-sm">
                <div className="absolute inset-1 rounded-full bg-[#a88a4d]/30" />
              </div>

              {/* Year Column */}
              <div
                className={`md:w-1/2 flex flex-col justify-start ${index % 2 === 0 ? "md:items-start md:pl-16" : "md:items-end md:pr-16"} pl-12 md:pl-0 pt-1`}
              >
                <div className="relative">
                  <span className="font-serif text-6xl md:text-9xl text-[#d9d4c9] font-bold leading-none select-none tracking-tighter">
                    {event.year}
                  </span>
                  <span
                    className={`absolute ${index % 2 === 0 ? "left-0" : "right-0"} bottom-0 font-serif text-2xl md:text-3xl text-[#4a3a2a] font-bold`}
                  >
                    {event.year}
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div
                className={`md:w-1/2 pl-12 ${index % 2 === 0 ? "md:pr-16 md:pl-0 md:text-right" : "md:pl-16 md:text-left"}`}
              >
                <div className="p-6 md:p-8 bg-[#d9d4c9] border border-[#b8ad96] rounded-sm shadow-sm hover:shadow-md transition-shadow duration-500">
                  <h3 className="font-serif text-2xl md:text-4xl text-[#3a2f25] mb-3 leading-snug tracking-tight">
                    {event.title}
                  </h3>

                  <div
                    className={`flex items-center gap-2 mb-5 text-[#6a5a4a] ${index % 2 === 0 ? "md:justify-end" : ""}`}
                  >
                    <MapPin size={12} />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold">
                      {event.location}
                    </span>
                  </div>

                  <p className="text-[#4a3a2a] font-serif leading-relaxed text-lg md:text-2xl italic">
                    "{event.description}"
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
