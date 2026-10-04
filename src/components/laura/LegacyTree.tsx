"use client";

import { motion } from "framer-motion";
import { Users, ArrowRight, Globe } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";
import Link from "next/link";

export function LegacyTree() {
  const { legacyTree } = lauraPerlsContent;
  const founder = legacyTree[0];

  return (
    <section className="py-16 md:py-24 bg-[#F1E9DB]/60 relative overflow-hidden border-t border-[#D8CFBE]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/30" />
            <span className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center">
              <Users size={20} className="text-[#005A1F]" />
            </span>
            <div className="h-px w-10 bg-[#96551F]/30" />
          </div>

          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F] block mb-2">
            Linhagem Terapêutica
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight">
            A{" "}
            <span className="italic text-[#96551F] font-light">
              Árvore do Legado
            </span>{" "}
            de Laura
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#262B22]/80 font-serif italic max-w-2xl mx-auto">
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
            transition={{ duration: 0.6 }}
            className="relative flex flex-col items-center"
          >
            {/* Founder */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#005A1F] flex flex-col items-center justify-center border-4 border-white shadow-xs">
                <span className="font-serif text-2xl text-[#FDFAF4] font-bold">
                  {founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span className="text-[9px] text-[#D8CFBE] uppercase tracking-widest font-semibold mt-0.5">
                  Fundadora
                </span>
              </div>
              <h3 className="text-center font-serif text-xl font-bold text-[#005A1F] mt-3">
                {founder.name}
              </h3>
            </div>

            {/* Branches */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {founder.students.map((student, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                  className="relative"
                >
                  {/* Branch Line */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-[#96551F]/40" />

                  {/* Student Card */}
                  <div className="w-72 bg-white rounded-2xl border border-[#D8CFBE] shadow-xs overflow-hidden h-full flex flex-col justify-between">
                    {/* Student Header */}
                    <div className="bg-[#005A1F] px-5 py-3 text-[#FDFAF4]">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-[#D8CFBE]" />
                        <span className="font-bold text-sm font-serif">
                          {student.name}
                        </span>
                      </div>
                    </div>

                    {/* Student Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-[#96551F] uppercase tracking-wider font-bold mb-1.5">
                          {student.role}
                        </p>

                        <p className="text-xs text-[#262B22]/85 font-serif italic leading-relaxed">
                          "{student.contribution}"
                        </p>
                      </div>

                      {/* Followers */}
                      {student.followers && student.followers.length > 0 && (
                        <div className="pt-3 border-t border-[#D8CFBE]/60 mt-3">
                          <p className="text-[10px] uppercase tracking-widest text-[#6B6B63] font-semibold mb-2">
                            Continuadores
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {student.followers.map((follower, fIndex) => (
                              <span
                                key={fIndex}
                                className="px-2.5 py-0.5 bg-[#005A1F]/10 border border-[#005A1F]/20 text-[#005A1F] text-[10px] font-medium rounded-full"
                              >
                                {"name" in follower ? follower.name : follower}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Terapeutas Diretos", value: "3+" },
            { label: "Continuadores", value: "50+" },
            { label: "Países", value: "15+" },
            { label: "Anos de Influência", value: "70+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white border border-[#D8CFBE] rounded-2xl shadow-xs"
            >
              <span className="block font-serif text-3xl text-[#005A1F] font-bold">
                {stat.value}
              </span>
              <span className="text-[10px] text-[#6B6B63] uppercase tracking-widest font-semibold mt-1">
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
          transition={{ delay: 0.2 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-3.5 bg-white border border-[#D8CFBE] rounded-full shadow-xs">
            <span className="text-[#262B22] font-serif italic text-sm">
              Faça parte dessa linhagem terapêutica
            </span>
            <Link
              href="/formacoes"
              className="flex items-center gap-2 px-5 py-2 bg-[#005A1F] text-[#FDFAF4] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#07614C] transition-colors"
            >
              Conhecer Formações
              <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
