"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function MemoryMiniFooter() {
  return (
    <section className="relative py-24 bg-paper overflow-hidden border-t border-stone-200">
      {/* Historic Aesthetic Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60 transition-opacity duration-[2000ms]"
          style={{
            backgroundImage: `url('/backgroundlaura1.jpeg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Subtle light gradient for better card separation */}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-transparent to-paper/80 z-10" />

        {/* Fine Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.1] pointer-events-none z-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <Link
          href="/instituto/laura-perls"
          className="block group focus:outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white/70 backdrop-blur-md p-8 md:p-10 hover:bg-white/90 hover:border-gold/30 hover:shadow-2xl transition-all duration-700 group-focus:ring-2 group-focus:ring-gold/50 group-focus:ring-offset-2"
          >
            {/* Gloss Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-100/0 via-white/50 to-stone-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Icon (Now Image) & Title */}
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-stone-100 group-hover:border-gold/40 group-hover:scale-105 transition-all duration-700 shadow-sm flex-shrink-0">
                  <Image
                    src="/laura/laura1.jpg"
                    alt="Laura Perls Icon"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="64px"
                  />
                </div>
                <div>
                  <span className="block text-[10px] tracking-[0.3em] uppercase text-gold font-bold mb-1.5">
                    Memória Viva
                  </span>
                  <h3 className="font-serif text-3xl text-stone-800 group-hover:text-primary transition-colors duration-300 tracking-tight">
                    Laura Perls
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 max-w-sm italic font-serif">
                    "Onde há vida, há esperança e direção."
                  </p>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-stone-400 group-hover:text-gold transition-colors duration-300">
                <span className="relative">
                  Explorar Arquivo
                  <span className="absolute left-0 -bottom-1 w-0 h-px bg-gold group-hover:w-full transition-all duration-500" />
                </span>
                <ArrowRight
                  size={18}
                  className="transform group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
