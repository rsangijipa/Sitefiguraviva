"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LauraTimeline() {
  const { timeline } = lauraPerlsContent;

  return (
    <section
      id="timeline"
      className="py-32 bg-[#0d0c0b] overflow-hidden relative"
    >
      {/* Cinematic Background Line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2d261f] to-transparent" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-stone-600">
            Jornada
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-stone-200 mt-6 leading-tight tracking-tight">
            Crônica Histórica
          </h2>
          <div className="h-px w-24 bg-[#c5a05b]/30 mx-auto mt-8" />
        </div>

        <div className="space-y-32">
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Timeline Dot - Richer Detail */}
              <div className="absolute left-2 md:left-1/2 top-0 w-4 h-4 -ml-2 rounded-full border-2 border-[#c5a05b]/30 bg-[#0d0c0b] z-20" />

              {/* Date Column - Aged Gold look */}
              <div
                className={`md:w-1/2 flex flex-col justify-start ${index % 2 === 0 ? "md:items-start md:pl-20" : "md:items-end md:pr-20"} pl-16 md:pl-0 pt-1`}
              >
                <span className="font-serif text-7xl md:text-9xl text-[#c5a05b]/10 font-bold leading-none select-none tracking-tighter transition-colors group-hover:text-[#c5a05b]/20">
                  {event.year}
                </span>
              </div>

              {/* Content Column */}
              <div
                className={`md:w-1/2 pl-16 ${index % 2 === 0 ? "md:pr-20 md:pl-0 md:text-right" : "md:pl-20 md:text-left"}`}
              >
                <h3 className="font-serif text-2xl md:text-4xl text-stone-200 mb-3 leading-snug tracking-tight">
                  {event.title}
                </h3>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-[#c5a05b]/60 mb-6 font-bold">
                  {event.location}
                </span>
                <p className="text-stone-400 font-serif leading-relaxed text-lg md:text-2xl italic font-light">
                  "{event.description}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
