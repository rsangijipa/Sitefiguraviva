"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Heart, Zap, Gem, BookOpen } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function ConceptsDeepDive() {
  const { conceptsDeepDive } = lauraPerlsContent;
  const [expanded, setExpanded] = useState<string | null>("support");

  const concepts = [
    { key: "support", data: conceptsDeepDive.support, icon: Heart },
    { key: "aggression", data: conceptsDeepDive.aggression, icon: Zap },
    { key: "aesthetics", data: conceptsDeepDive.aesthetics, icon: Gem },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#FDFAF4] relative overflow-hidden border-t border-[#D8CFBE]">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#96551F]/30" />
            <div className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center">
              <BookOpen size={20} className="text-[#005A1F]" />
            </div>
            <div className="h-px w-10 bg-[#96551F]/30" />
          </div>

          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#96551F] block mb-2">
            Aprofundamento Teórico
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#005A1F] leading-tight">
            Explore os{" "}
            <span className="italic text-[#96551F] font-light">Conceitos</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#262B22]/80 font-serif italic max-w-2xl mx-auto">
            Laura Perls desenvolveu conceitos fundamentais que transformaram a
            prática da Gestalt-terapia. Clique em cada cartão para explorar em
            profundidade.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="grid gap-4">
          {concepts.map((concept, index) => {
            const Icon = concept.icon;
            const isExpanded = expanded === concept.key;

            return (
              <motion.div
                key={concept.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="overflow-hidden rounded-2xl border border-[#D8CFBE] bg-white shadow-xs transition-all duration-300"
              >
                {/* Header - Always Visible */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : concept.key)}
                  className="w-full px-6 py-5 bg-white flex items-center justify-between hover:bg-[#FDFAF4] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-[#005A1F]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif text-xl font-bold text-[#005A1F]">
                        {concept.data.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#6B6B63] font-serif italic mt-0.5 line-clamp-1">
                        {concept.data.definition.substring(0, 90)}...
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-1.5 text-[#005A1F]"
                  >
                    <ChevronDown size={22} />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-6 bg-[#FDFAF4]/70 border-t border-[#D8CFBE]">
                        {/* Definition */}
                        <div className="mb-6 p-4 bg-white border-l-4 border-l-[#96551F] border border-[#D8CFBE] rounded-xl shadow-xs">
                          <p className="font-serif text-sm md:text-base text-[#262B22] italic leading-relaxed">
                            "{concept.data.definition}"
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Components */}
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[#005A1F] uppercase tracking-wider text-xs mb-3">
                              <span className="w-2 h-2 bg-[#96551F] rounded-full" />
                              Componentes
                            </h4>
                            <div className="space-y-2.5">
                              {concept.data.components.map((comp, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-[#D8CFBE]"
                                >
                                  <div className="w-7 h-7 rounded-full bg-[#005A1F]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="font-serif font-bold text-xs text-[#005A1F]">
                                      {i + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-xs uppercase tracking-wide text-[#262B22] block">
                                      {comp.name}
                                    </span>
                                    <span className="text-xs text-[#6B6B63] mt-0.5 block leading-relaxed">
                                      {comp.description}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Clinical Applications */}
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[#005A1F] uppercase tracking-wider text-xs mb-3">
                              <span className="w-2 h-2 bg-[#96551F] rounded-full" />
                              Aplicações Clínicas
                            </h4>
                            <div className="space-y-2.5">
                              {concept.data.clinicalApplications.map(
                                (app, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#D8CFBE]"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-[#07614C]/15 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] text-[#07614C] font-bold">
                                        ✓
                                      </span>
                                    </div>
                                    <span className="text-xs text-[#262B22]/90 leading-relaxed">
                                      {app}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 bg-[#005A1F] text-[#FDFAF4] rounded-2xl shadow-xs"
        >
          <h3 className="font-serif text-2xl md:text-3xl text-[#FDFAF4] mb-2 font-bold">
            Quer aprofundar em Laura Perls?
          </h3>
          <p className="text-sm text-[#D8CFBE] font-serif italic mb-6 max-w-xl mx-auto">
            Nossos cursos de formação em Gestalt-terapia exploram esses
            conceitos em profundidade teórica e vivencial.
          </p>
          <a
            href="/formacoes"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FDFAF4] text-[#005A1F] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#F1E9DB] transition-all shadow-xs"
          >
            Ver Formações e Cursos
          </a>
        </motion.div>
      </div>
    </section>
  );
}
