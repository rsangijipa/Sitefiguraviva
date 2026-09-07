"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function MemoryMiniFooter() {
  return (
    <section className="fv-section fv-section--cream border-t border-border">
      {/* Historic Aesthetic Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="fv-bg fv-bg-laura-archive absolute inset-0 opacity-50 transition-opacity duration-[2000ms]"
          style={{
            backgroundImage: `url('/backgroundlaura1.webp')`,
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

      <div className="fv-container relative z-10 max-w-5xl">
        <Link
          href="/instituto/laura-perls"
          className="block group focus:outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-md border border-border bg-paper/90 p-8 backdrop-blur-md transition-colors duration-500 hover:border-igarape hover:bg-paper md:p-10 group-focus:ring-2 group-focus:ring-primary group-focus:ring-offset-2"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Icon (Now Image) & Title */}
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border transition-colors duration-500 group-hover:border-terra">
                  <Image
                    src="/laura/laura1.jpg"
                    alt="Laura Perls Icon"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="64px"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.3em] text-terra">
                    Memória Viva
                  </span>
                  <h3 className="font-serif text-3xl tracking-tight text-primary">
                    Laura Perls
                  </h3>
                  <p className="mt-1 max-w-sm font-serif text-sm italic text-text/75">
                    "Onde há vida, há esperança e direção."
                  </p>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
                <span className="relative">
                  Explorar Arquivo
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
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
