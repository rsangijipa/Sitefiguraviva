"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ImageIcon, ExternalLink, Quote } from "lucide-react";
import Image from "next/image";

export function LauraGallery() {
  const { gallery } = lauraPerlsContent;

  return (
    <section className="py-16 bg-[#241b12] border-t border-[#4a3c28] relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4a3c28] to-transparent" />

      {/* Decorative Corner Elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#4a3c28]/30 hidden md:block" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#4a3c28]/30 hidden md:block" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <ImageIcon size={18} className="text-[#d4b578]" />
            <div className="h-px w-12 bg-[#c9a768]/60" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8f7c64]">
              Memórias Visuais
            </span>
            <div className="h-px w-12 bg-[#c9a768]/60" />
            <ImageIcon size={18} className="text-[#d4b578]" />
          </div>

          <h2 className="font-serif text-4xl md:text-6xl text-[#f5ecd9] leading-tight tracking-tight">
            Galeria{" "}
            <span className="italic text-[#cbb896] font-light">Histórica</span>
          </h2>

          <div className="max-w-2xl mx-auto mt-8 p-6 bg-[#1b140d] border-l-2 border-[#c9a768] rounded-r-sm">
            <p className="text-lg text-[#e6d7bd] font-serif italic leading-relaxed">
              "O contato é a realidade básica do organismo."
              <span className="block text-sm text-[#8f7c64] mt-2 not-italic">
                — Registros raros integrados ao acervo digital do Instituto
              </span>
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gallery.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="group"
            >
              {/* Polaroid Style Frame */}
              <div className="bg-[#1b140d] p-3 pb-16 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="aspect-square bg-[#3a2d1c] relative overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover sepia-[0.2] contrast-[0.95] group-hover:scale-105 group-hover:sepia-0 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#0d0906]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center text-[#e8e4db] p-8 text-center">
                    <Quote size={24} className="text-[#d4b578] mb-4" />
                    <p className="text-lg font-serif italic mb-6 leading-relaxed">
                      "{item.caption}"
                    </p>
                    <div className="h-px w-12 bg-[#c9a768]/60 mb-4" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4b578] font-bold">
                      {item.credit}
                    </span>
                  </div>
                </div>

                {/* Caption Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="font-serif text-[#f5ecd9] italic text-sm truncate">
                    {item.alt}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#c9a768]/50" />
                    <div className="w-1 h-1 rounded-full bg-[#c9a768]/30" />
                    <div className="w-1 h-1 rounded-full bg-[#c9a768]/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Archive Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a
            href="https://www.stadtarchiv-pforzheim.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-8 py-4 bg-[#0d0906] text-[#e8e4db] text-sm tracking-[0.15em] uppercase font-bold rounded-sm hover:bg-[#c9a768] transition-all shadow-xl hover:shadow-2xl group"
          >
            <span>Explorar Arquivo Municipal de Pforzheim</span>
            <ExternalLink
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>

          <p className="mt-6 text-xs text-[#8f7c64] italic">
            Acervo original preservado na cidade natal de Laura Perls
          </p>
        </motion.div>
      </div>
    </section>
  );
}
