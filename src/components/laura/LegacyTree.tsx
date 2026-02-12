"use client";

import { motion } from "framer-motion";
import { Users, ArrowRight, Globe } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LegacyTree() {
  const { legacyTree } = lauraPerlsContent;
  const founder = legacyTree[0];

  return (
    <section className="py-24 bg-[#f5f2eb] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4c4a8] to-transparent" />
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
              <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill="#5c4a32" />
            </pattern>
          </defs>
          <rect fill="url(#leafPattern)" width="100%" height="100%" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="w-10 h-10 rounded-full bg-[#5c4a32] flex items-center justify-center">
              <Users size={20} className="text-[#f5f2eb]" />
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080] block mb-4">
            Linhagem Terapêutica
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a32] leading-tight">
            A{" "}
            <span className="italic text-[#8b6f4e] font-light">
              Árvore do Legado
            </span>{" "}
            de Laura
          </h2>
          <p className="mt-6 text-[#6b5a45] font-serif italic max-w-2xl mx-auto">
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
              <div className="w-28 h-28 rounded-full bg-[#5c4a32] shadow-2xl flex flex-col items-center justify-center border-4 border-[#f5f2eb]">
                <span className="font-serif text-3xl text-[#f5f2eb] font-bold">
                  {founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="text-[9px] text-[#d4c4a8] uppercase tracking-widest mt-1">
                  Fundadora
                </span>
              </div>
              <h3 className="text-center font-serif text-xl text-[#5c4a32] mt-4 font-bold">
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
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#c9a86c]" />

                  {/* Student Card */}
                  <div className="w-64 bg-[#faf8f3] rounded-lg shadow-lg border border-[#e8dfd1] overflow-hidden">
                    {/* Student Header */}
                    <div className="bg-[#5c4a32] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-[#c9a86c]" />
                        <span className="font-bold text-[#f5f2eb] text-sm">
                          {student.name}
                        </span>
                      </div>
                    </div>

                    {/* Student Content */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-[#8b7355] uppercase tracking-wider font-bold">
                        {student.role}
                      </p>

                      <p className="text-sm text-[#6b5a45] font-serif italic">
                        "{student.contribution}"
                      </p>

                      {/* Followers */}
                      {student.followers && student.followers.length > 0 && (
                        <div className="pt-3 border-t border-[#e8dfd1]">
                          <p className="text-[10px] uppercase tracking-widest text-[#a89080] mb-2">
                            Continuidores
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.followers.map((follower, fIndex) => (
                              <span
                                key={fIndex}
                                className="px-2 py-1 bg-[#c9a86c]/20 text-[#8b6f4e] text-[10px] rounded-full"
                              >
                                {"name" in follower ? follower.name : follower}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative Arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#faf8f3] rotate-45 border-r border-b border-[#e8dfd1]" />
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
              className="text-center p-6 bg-[#5c4a32] rounded-lg"
            >
              <span className="block font-serif text-3xl text-[#c9a86c] font-bold">
                {stat.value}
              </span>
              <span className="text-xs text-[#d4c4a8] uppercase tracking-widest">
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
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#faf8f3] border border-[#d4c4a8] rounded-lg shadow-md">
            <span className="text-[#6b5a45] font-serif italic">
              Faça parte dessa linhagem terapêutica
            </span>
            <a
              href="/inscricao"
              className="flex items-center gap-2 px-6 py-2 bg-[#5c4a32] text-[#f5f2eb] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#4a3f2a] transition-colors"
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
