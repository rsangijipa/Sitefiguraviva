"use client";

import { motion } from "framer-motion";
import { MessageCircle, Quote } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function Testimonials() {
  const { testimonials } = lauraPerlsContent;

  return (
    <section className="py-24 bg-[#faf8f3] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4c4a8] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4c4a8] to-transparent" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="w-10 h-10 rounded-full bg-[#f5f2eb] border-2 border-[#c9a86c] flex items-center justify-center">
              <MessageCircle size={20} className="text-[#5c4a32]" />
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080] block mb-4">
            O Que Dizem
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a32] leading-tight">
            <span className="italic text-[#8b6f4e] font-light">
              Depoimentos
            </span>{" "}
            de Terapeutas
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 left-6 w-10 h-10 rounded-full bg-[#5c4a32] flex items-center justify-center z-10 shadow-lg">
                <Quote size={18} className="text-[#f5f2eb]" />
              </div>

              {/* Card */}
              <div className="bg-[#f5f2eb] rounded-lg shadow-lg border border-[#e8dfd1] p-6 pt-10 h-full flex flex-col">
                {/* Quote */}
                <p className="font-serif text-[#5c4a32] italic leading-relaxed mb-6 flex-1">
                  "{testimonial.text}"
                </p>

                {/* Divider */}
                <div className="h-px w-12 bg-[#c9a86c]/40 mx-auto mb-4" />

                {/* Author */}
                <div className="text-center">
                  <p className="font-bold text-[#5c4a32]">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-[#8b7355] uppercase tracking-wider">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-[#a89080] mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f5f2eb] rotate-45 border-r border-b border-[#e8dfd1]" />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#5c4a32] rounded-lg shadow-xl">
            <div className="text-left">
              <p className="font-serif text-[#f5f2eb] italic">
                Tem um depoimento sobre Laura Perls?
              </p>
              <p className="text-xs text-[#d4c4a8] mt-1">
                Compartilhe sua experiência com a comunidade
              </p>
            </div>
            <a
              href="/contato"
              className="px-6 py-2 bg-[#c9a86c] text-[#5c4a32] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#d4b96a] transition-colors"
            >
              Enviar
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
