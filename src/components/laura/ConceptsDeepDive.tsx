"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Heart, Zap, Gem, BookOpen } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

const icons = [Sparkles, Heart, Zap, Gem, BookOpen];

export function ConceptsDeepDive() {
  const { conceptsDeepDive } = lauraPerlsContent;
  const [expanded, setExpanded] = useState<string | null>("support");

  const concepts = [
    { key: "support", data: conceptsDeepDive.support, icon: Heart },
    { key: "aggression", data: conceptsDeepDive.aggression, icon: Zap },
    { key: "aesthetics", data: conceptsDeepDive.aesthetics, icon: Gem },
  ];

  return (
    <section className="py-24 bg-[#faf8f3] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#c9a86c]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5c4a32]/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86c]/60" />
            <span className="w-10 h-10 rounded-full bg-[#f5f2eb] border-2 border-[#c9a86c] flex items-center justify-center">
              <BookOpen size={20} className="text-[#5c4a32]" />
            </span>
            <div className="h-px w-12 bg-[#c9a86c]/60" />
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#a89080] block mb-4">
            Aprofundamento Teórico
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a32] leading-tight">
            Explore os{" "}
            <span className="italic text-[#8b6f4e] font-light">Conceitos</span>
          </h2>
          <p className="mt-6 text-[#6b5a45] font-serif italic max-w-2xl mx-auto">
            Laura Perls desenvolveu conceitos fundamentais que transformaram a
            prática da Gestalt-terapia. Clique em cada cartão para explorar em
            profundidade.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="grid gap-6">
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
                className="overflow-hidden rounded-lg border border-[#e8dfd1] shadow-md hover:shadow-lg transition-shadow duration-500"
              >
                {/* Header - Always Visible */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : concept.key)}
                  className="w-full px-8 py-6 bg-[#f5f2eb] flex items-center justify-between hover:bg-[#f0ebe0] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#5c4a32] flex items-center justify-center">
                      <Icon size={24} className="text-[#f5f2eb]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif text-2xl text-[#5c4a32]">
                        {concept.data.title}
                      </h3>
                      <p className="text-sm text-[#8b7355] font-serif italic mt-1">
                        {concept.data.definition.substring(0, 80)}...
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-2"
                  >
                    <ChevronDown size={24} className="text-[#c9a86c]" />
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 py-8 bg-[#faf8f3] border-t border-[#e8dfd1]">
                        {/* Definition */}
                        <div className="mb-8 p-6 bg-[#f0ebe0] border-l-4 border-[#c9a86c] rounded-r-sm">
                          <p className="font-serif text-lg text-[#5c4a32] italic leading-relaxed">
                            "{concept.data.definition}"
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Components */}
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[#5c4a32] uppercase tracking-widest text-xs mb-6">
                              <span className="w-2 h-2 bg-[#c9a86c] rounded-full" />
                              Componentes
                            </h4>
                            <div className="space-y-4">
                              {concept.data.components.map((comp, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-3 p-4 bg-white rounded-sm border border-[#e8dfd1]"
                                >
                                  <div className="w-8 h-8 rounded-full bg-[#c9a86c]/20 flex items-center justify-center shrink-0">
                                    <span className="font-serif font-bold text-[#8b6f4e]">
                                      {i + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#5c4a32] block">
                                      {comp.name}
                                    </span>
                                    <span className="text-sm text-[#6b5a45]">
                                      {comp.description}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Clinical Applications */}
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[#5c4a32] uppercase tracking-widest text-xs mb-6">
                              <span className="w-2 h-2 bg-[#5c4a32] rounded-full" />
                              Aplicações Clínicas
                            </h4>
                            <div className="space-y-3">
                              {concept.data.clinicalApplications.map(
                                (app, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-[#5c4a32]/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] text-[#5c4a32]">
                                        ✓
                                      </span>
                                    </div>
                                    <span className="text-[#6b5a45] leading-relaxed">
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
          className="mt-16 text-center p-8 bg-[#5c4a32] rounded-lg shadow-xl"
        >
          <h3 className="font-serif text-2xl text-[#f5f2eb] mb-4">
            Quer aprender mais sobre Laura Perls?
          </h3>
          <p className="text-[#d4c4a8] font-serif italic mb-6">
            Nossos cursos de formação em Gestalt-terapia exploram esses
            conceitos em profundidade
          </p>
          <a
            href="/cursos"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a86c] text-[#5c4a32] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#d4b96a] transition-colors"
          >
            Ver Cursos
          </a>
        </motion.div>
      </div>
    </section>
  );
}
