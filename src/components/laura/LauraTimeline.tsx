"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { Calendar, MapPin } from "lucide-react";

export function LauraTimeline() {
  const { timeline } = lauraPerlsContent;

  return (
    <section
      id="timeline"
      className="py-16 md:py-24 bg-[#FDFAF4] overflow-hidden relative border-t border-[#D8CFBE]"
    >
      {/* Central Line */}
      <div className="absolute left-8 md:left-1/2 top-32 bottom-32 w-px bg-gradient-to-b from-transparent via-[#96551F]/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/40" />
            <Calendar size={16} className="text-[#005A1F]" />
            <div className="h-px w-10 bg-[#96551F]/40" />
          </div>
          <span className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#96551F] block mb-2">
            Jornada de Vida
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight tracking-tight">
            Crônica{" "}
            <span className="italic text-[#96551F] font-light">Histórica</span>
          </h2>
          <div className="h-px w-16 bg-[#96551F]/40 mx-auto mt-4" />
        </div>

        {/* Timeline Events */}
        <div className="space-y-10 md:space-y-14">
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Timeline Node */}
              <div className="absolute left-2 md:left-1/2 top-1.5 w-5 h-5 -ml-2.5 rounded-full bg-[#FDFAF4] border-2 border-[#005A1F] z-20 shadow-xs flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#96551F]" />
              </div>

              {/* Year Column */}
              <div
                className={`md:w-1/2 flex flex-col justify-start ${index % 2 === 0 ? "md:items-start md:pl-16" : "md:items-end md:pr-16"} pl-12 md:pl-0 pt-1`}
              >
                <div className="relative">
                  <span className="font-serif text-5xl md:text-7xl text-[#D8CFBE]/60 font-bold leading-none select-none tracking-tighter">
                    {event.year}
                  </span>
                  <span
                    className={`absolute ${index % 2 === 0 ? "left-0" : "right-0"} bottom-0 font-serif text-xl md:text-2xl text-[#005A1F] font-bold`}
                  >
                    {event.year}
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div
                className={`md:w-1/2 pl-12 ${index % 2 === 0 ? "md:pr-16 md:pl-0 md:text-right" : "md:pl-16 md:text-left"}`}
              >
                <div className="p-6 md:p-7 bg-white border border-[#D8CFBE] rounded-2xl shadow-xs transition-colors duration-300 hover:border-[#005A1F]/40">
                  <h3 className="font-serif text-xl md:text-2xl text-[#005A1F] mb-2 leading-snug tracking-tight font-bold">
                    {event.title}
                  </h3>

                  <div
                    className={`flex items-center gap-1.5 mb-3 text-[#07614C] ${index % 2 === 0 ? "md:justify-end" : ""}`}
                  >
                    <MapPin size={12} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                      {event.location}
                    </span>
                  </div>

                  <p className="text-[#262B22]/85 font-serif leading-relaxed text-sm md:text-base italic">
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
