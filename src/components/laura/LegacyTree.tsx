"use client";

import { motion } from "framer-motion";
import { Users, ArrowRight, Globe } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LegacyTree() {
  const { legacyTree } = lauraPerlsContent;
  const founder = legacyTree[0];

  return (
    <section className="py-24 bg-[#e8e4db] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b8ad96] to-transparent" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="leafPattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill="#4a3a2a" />
            </pattern>
          </defs>
          <rect fill="url(#leafPattern)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#a88a4d]/60" />
            <span className="w-10 h-10 rounded-full bg-[#4a3a2a] flex items-center justify-center">
              <Users size={20} className="text-[#e8e4db]" />
            </span>
            <div className="h-px w-12 bg-[#a88a4d]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#8a7a6a] block mb-4">
            Linhagem Terapêutica
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#3a2f25] leading-tight">
            A{" "}
            <span className="italic text-[#5a4838] font-light">
              Árvore do Legado
            </span>{" "}
            de Laura
          </h2>
          <p className="mt-6 text-[#4a3a2a] font-serif italic max-w-2xl mx-auto">
            O pensamento de Laura Perls continua florescendo através de gerações
            de terapeutas que levaram seu trabalho para o mundo inteiro.
          </p>
        </div>

        {/* Tree Visualization */}
        <div className="relative">
          {/* Central Trunk */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center"
          >
            {/* Founder */}
            <div className="relative z-20">
              <div className="w-28 h-28 rounded-full bg-[#4a3a2a] shadow-2xl flex flex-col items-center justify-center border-4 border-[#e8e4db]">
                <span className="font-serif text-3xl text-[#e8e4db] font-bold">
                  {founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="text-[9px] text-[#b8ad96] uppercase tracking-widest mt-1">
                  Fundadora
                </span>
              </div>
              <h3 className="text-center font-serif text-xl text-[#3a2f25] mt-4 font-bold">
                {founder.name}
              </h3>
            </div>

            {/* Branches */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {founder.students.map((student, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="relative"
                >
                  {/* Branch Line */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#a88a4d]" />

                  {/* Student Card */}
                  <div className="w-64 bg-[#d9d4c9] rounded-lg shadow-lg border border-[#b8ad96] overflow-hidden">
                    {/* Student Header */}
                    <div className="bg-[#4a3a2a] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-[#a88a4d]" />
                        <span className="font-bold text-[#e8e4db] text-sm">
                          {student.name}
                        </span>
                      </div>
                    </div>

                    {/* Student Content */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-[#6a5a4a] uppercase tracking-wider font-bold">
                        {student.role}
                      </p>

                      <p className="text-sm text-[#4a3a2a] font-serif italic">
                        "{student.contribution}"
                      </p>

                      {/* Followers */}
                      {student.followers && student.followers.length > 0 && (
                        <div className="pt-3 border-t border-[#b8ad96]">
                          <p className="text-[10px] uppercase tracking-widest text-[#8a7a6a] mb-2">
                            Continuidores
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.followers.map((follower, fIndex) => (
                              <span
                                key={fIndex}
                                className="px-2 py-1 bg-[#a88a4d]/20 text-[#5a4838] text-[10px] rounded-full"
                              >
                                {"name" in follower ? follower.name : follower}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative Arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#d9d4c9] rotate-45 border-r border-b border-[#b8ad96]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Terapeutas Diretos", value: "3+" },
            { label: "Continuidores", value: "50+" },
            { label: "Países", value: "15+" },
            { label: "Anos de Influência", value: "70+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-[#4a3a2a] rounded-lg"
            >
              <span className="block font-serif text-3xl text-[#a88a4d] font-bold">
                {stat.value}
              </span>
              <span className="text-xs text-[#b8ad96] uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#d9d4c9] border border-[#b8ad96] rounded-lg shadow-md">
            <span className="text-[#4a3a2a] font-serif italic">
              Faça parte dessa linhagem terapêutica
            </span>
            <a
              href="/inscricao"
              className="flex items-center gap-2 px-6 py-2 bg-[#4a3a2a] text-[#e8e4db] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#3a2f25] transition-colors"
            >
              Inscrever-se
              <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
