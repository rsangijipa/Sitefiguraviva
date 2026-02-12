"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ImageIcon, ExternalLink, Quote } from "lucide-react";
import Image from "next/image";

export function LauraGallery() {
  const { gallery } = lauraPerlsContent;

  return (
    <section className="py-32 bg-[#faf8f3] border-t border-[#e8dfd1] relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4c4a8] to-transparent" />

      {/* Decorative Corner Elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#d4c4a8]/30 hidden md:block" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#d4c4a8]/30 hidden md:block" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <ImageIcon size={18} className="text-[#c9a86c]" />
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080]">
              Memórias Visuais
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <ImageIcon size={18} className="text-[#c9a86c]" />
          </div>

          <h2 className="font-serif text-4xl md:text-6xl text-[#5c4a32] leading-tight tracking-tight">
            Galeria{" "}
            <span className="italic text-[#8b6f4e] font-light">Histórica</span>
          </h2>

          <div className="max-w-2xl mx-auto mt-8 p-6 bg-[#f5f2eb] border-l-2 border-[#c9a86c] rounded-r-sm">
            <p className="text-lg text-[#6b5a45] font-serif italic leading-relaxed">
              "O contato é a realidade básica do organismo."
              <span className="block text-sm text-[#a89080] mt-2 not-italic">
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
              <div className="bg-[#f5f2eb] p-3 pb-16 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="aspect-square bg-[#e8dfd1] relative overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover sepia-[0.2] contrast-[0.95] group-hover:scale-105 group-hover:sepia-0 group-hover:contrast-100 transition-all duration-1000"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#5c4a32]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center text-[#f5f2eb] p-8 text-center">
                    <Quote size={24} className="text-[#c9a86c] mb-4" />
                    <p className="text-lg font-serif italic mb-6 leading-relaxed">
                      "{item.caption}"
                    </p>
                    <div className="h-px w-12 bg-[#c9a86c]/60 mb-4" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9a86c] font-bold">
                      {item.credit}
                    </span>
                  </div>
                </div>

                {/* Caption Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="font-serif text-[#5c4a32] italic text-sm truncate">
                    {item.alt}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#c9a86c]/50" />
                    <div className="w-1 h-1 rounded-full bg-[#c9a86c]/30" />
                    <div className="w-1 h-1 rounded-full bg-[#c9a86c]/50" />
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
          className="mt-20 text-center"
        >
          <a
            href="https://www.stadtarchiv-pforzheim.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#5c4a32] text-[#f5f2eb] text-sm tracking-[0.15em] uppercase font-bold rounded-sm hover:bg-[#6b5a45] transition-all shadow-lg hover:shadow-xl group"
          >
            <span>Explorar Arquivo Municipal de Pforzheim</span>
            <ExternalLink
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>

          <p className="mt-6 text-xs text-[#a89080] italic">
            Acervo original preservado na cidade natal de Laura Perls
          </p>
        </motion.div>
      </div>
    </section>
  );
}
