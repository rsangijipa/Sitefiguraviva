"use client";

import { motion } from "framer-motion";
import { lauraPerlsContent } from "@/content/laura-perls";
import { ImageIcon, ExternalLink, Quote } from "lucide-react";
import Image from "next/image";

export function LauraGallery() {
  const { gallery } = lauraPerlsContent;

  return (
    <section className="py-16 md:py-24 bg-[#FDFAF4] border-t border-[#D8CFBE] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <ImageIcon size={16} className="text-[#96551F]" />
            <div className="h-px w-10 bg-[#96551F]/30" />
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F]">
              Memórias Visuais
            </span>
            <div className="h-px w-10 bg-[#96551F]/30" />
            <ImageIcon size={16} className="text-[#96551F]" />
          </div>

          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight tracking-tight">
            Galeria{" "}
            <span className="italic text-[#96551F] font-light">Histórica</span>
          </h2>

          <div className="max-w-2xl mx-auto mt-6 p-5 bg-white border-l-4 border-l-[#96551F] border border-[#D8CFBE] rounded-2xl shadow-xs">
            <p className="text-sm md:text-base text-[#262B22] font-serif italic leading-relaxed">
              "O contato é a realidade básica do organismo."
              <span className="block text-xs text-[#6B6B63] mt-2 not-italic font-sans">
                — Registros raros integrados ao acervo digital do Instituto
              </span>
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              {/* Polaroid Style Frame */}
              <div className="bg-white p-3.5 pb-6 rounded-2xl border border-[#D8CFBE] shadow-xs transition-all duration-300 hover:border-[#005A1F]/40 hover:-translate-y-1">
                {/* Image Container */}
                <div className="aspect-square bg-[#F1E9DB] rounded-xl relative overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover sepia-[0.15] contrast-[0.98] group-hover:scale-105 group-hover:sepia-0 transition-all duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#005A1F]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-[#FDFAF4] p-6 text-center">
                    <Quote size={20} className="text-[#F1E9DB] mb-3" />
                    <p className="text-sm font-serif italic mb-4 leading-relaxed">
                      "{item.caption}"
                    </p>
                    <div className="h-px w-10 bg-[#D8CFBE]/40 mb-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8CFBE] font-bold">
                      {item.credit}
                    </span>
                  </div>
                </div>

                {/* Caption Area */}
                <div className="pt-4 text-center">
                  <p className="font-serif text-[#262B22] font-semibold text-xs truncate">
                    {item.alt}
                  </p>
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
          className="mt-12 text-center"
        >
          <a
            href="https://www.stadtarchiv-pforzheim.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#005A1F] text-[#FDFAF4] text-xs tracking-[0.15em] uppercase font-bold rounded-full hover:bg-[#07614C] transition-all shadow-xs group"
          >
            <span>Explorar Arquivo Municipal de Pforzheim</span>
            <ExternalLink
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>

          <p className="mt-4 text-xs text-[#6B6B63] italic">
            Acervo original preservado na cidade natal de Laura Perls
          </p>
        </motion.div>
      </div>
    </section>
  );
}
