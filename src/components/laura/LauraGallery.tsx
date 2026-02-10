"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import Image from "next/image";

export function LauraGallery() {
  const { gallery } = lauraPerlsContent;

  return (
    <section className="py-32 bg-[#0d0c0b] border-t border-stone-900 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-stone-600">
            Registros
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-stone-200 mt-6 leading-tight tracking-tight">
            Galeria Histórica
          </h2>
          <p className="text-xl text-stone-400 mt-8 max-w-2xl mx-auto font-serif italic font-light leading-relaxed">
            "O contato é a realidade básica do organismo." — Registros raros
            integrados ao acervo digital do Instituto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {gallery.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="aspect-square bg-stone-950 relative overflow-hidden group rounded-sm shadow-2xl border-[8px] border-[#1a1917] p-4"
            >
              <div className="relative w-full h-full bg-[#0d0c0b] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover grayscale sepia-[0.4] brightness-75 group-hover:scale-105 group-hover:sepia-0 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Hover Overlay - Cinematic approach */}
                <div className="absolute inset-0 bg-stone-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center text-stone-200 p-8 text-center backdrop-blur-[4px]">
                  <p className="text-xl font-serif italic mb-6 leading-relaxed">
                    "{item.caption}"
                  </p>
                  <div className="h-px w-8 bg-[#c5a05b]/40 mb-4" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#c5a05b] font-bold">
                    {item.credit}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <a
            href="https://www.stadtarchiv-pforzheim.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase font-bold text-stone-500 hover:text-[#c5a05b] transition-all border-b border-stone-900 pb-2"
          >
            Explorar Arquivo Municipal de Pforzheim{" "}
            <span className="text-[#c5a05b]/50 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
