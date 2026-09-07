"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Sprout,
  Sparkles,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BreathingApp from "./resources/apps/breathing/BreathingApp";
import { App as QuizBank } from "./Quiz/App";
import SomaScan from "./resources/apps/soma-scan/App";
import ResourceModalShell from "./resources/ResourceModalShell";
import ResourceAppFrame from "./resources/ResourceAppFrame";
import { EmotionTreeApp } from "./resources/apps/emotion-tree/EmotionTreeApp";

export default function ResourcesSection() {
  const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'emotion-tree' | 'quiz' | 'somascan'
  const scrollContainerRef = useRef(null);
  const openResource = (resource) => {
    setActiveResource(resource);
  };

  const closeResource = () => {
    setActiveResource(null);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="recursos-interativos"
      className="py-24 bg-surface border-t border-stone-100 relative overflow-hidden transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">
            Ferramentas de Cuidado
          </span>
          <h2 className="heading-section text-primary">
            Recursos{" "}
            <span className="italic text-accent font-light">Interativos</span>
          </h2>
          <p className="text-lg text-text/80 mt-4">
            Espaços digitais desenhados para cultivar a presença e a awareness
            no seu dia a dia.
          </p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative w-full">
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-12 w-12 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-12 w-12 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-6 pb-12 px-6 md:px-0 scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
            {/* Breathing App Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-80 md:w-auto snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => openResource("breathing")}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <Wind size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Guia de Respiração
              </h3>
              <p className="text-text/60 text-sm mb-6 flex-grow">
                Uma pausa guiada para reduzir a ansiedade e reconectar com o
                agora.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent group-hover:text-primary transition-colors">
                Iniciar Prática
              </span>
            </motion.div>

            {/* Feelings Tree Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-80 md:w-auto snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => openResource("emotion-tree")}
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                <Sprout size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Árvore da Awareness
              </h3>
              <p className="text-text/60 text-sm mb-6 flex-grow">
                Visualize e nomeie suas emoções em uma experiência interativa
                3D.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold group-hover:text-primary transition-colors">
                Acessar Árvore
              </span>
            </motion.div>

            {/* SomaScan Card (NEW) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-80 md:w-auto snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => openResource("somascan")}
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 mb-6 group-hover:scale-110 transition-transform">
                <Fingerprint size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                SomaScan
              </h3>
              <p className="text-text/60 text-sm mb-6 flex-grow">
                Mapeamento corporal consciente para escutar o que o corpo diz.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 group-hover:text-primary transition-colors">
                Iniciar Scan
              </span>
            </motion.div>

            {/* Mental Health Quiz Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-80 md:w-auto snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => openResource("quiz")}
            >
              <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center text-sage mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Banco de Quizzes
              </h3>
              <p className="text-text/60 text-sm mb-6 flex-grow">
                MenteQuiz: questionários e reflexões sobre saúde mental,
                comportamento e autoconhecimento.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
                Explorar Quizzes
              </span>
            </motion.div>
          </div>

          {/* Visual Scroll Controls */}
          <div className="flex md:hidden items-center justify-center gap-6 mt-4 opacity-70 hover:opacity-100 transition-opacity pb-4">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-stone-300 w-1/3 rounded-full"
                animate={{ x: [0, 80, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
              />
            </div>

            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
              aria-label="Scroll Right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <ResourceModalShell
        open={!!activeResource}
        title={
          activeResource === "emotion-tree"
            ? "Árvore das Emoções"
            : activeResource === "breathing"
              ? "Guia de Respiração"
              : activeResource === "somascan"
                ? "SomaScan"
                : "Banco de Quizzes"
        }
        onClose={closeResource}
        className={activeResource === "emotion-tree" ? "bg-[#0f1727]" : ""}
      >
        {activeResource === "breathing" && (
          <ResourceAppFrame title="Guia de Respiração">
            <div className="resource-app resource-app--light">
              <BreathingApp onClose={closeResource} />
            </div>
          </ResourceAppFrame>
        )}
        {activeResource === "emotion-tree" && (
          <ResourceAppFrame title="Árvore das Emoções">
            <div className="resource-app resource-app--tree">
              <EmotionTreeApp />
            </div>
          </ResourceAppFrame>
        )}
        {activeResource === "somascan" && (
          <ResourceAppFrame title="SomaScan">
            <div className="resource-app resource-app--light">
              <SomaScan />
            </div>
          </ResourceAppFrame>
        )}
        {activeResource === "quiz" && (
          <ResourceAppFrame title="Banco de Quizzes">
            <div className="resource-app resource-app--light">
              <QuizBank />
            </div>
          </ResourceAppFrame>
        )}
      </ResourceModalShell>
    </section>
  );
}
