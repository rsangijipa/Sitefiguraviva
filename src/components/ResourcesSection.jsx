"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Sprout,
  Sparkles,
  Fingerprint,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BreathingApp from "./resources/BreathingApp";
import FeelingsTree from "./FeelingsTree";
import MentalHealthQuiz from "./resources/MentalHealthQuiz";
import SomaScan from "./somascan/App";
import { Modal, ModalContent, ModalBody } from "./ui/Modal";
import { useToast } from "@/context/ToastContext";

export default function ResourcesSection() {
  const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'tree' | 'quiz' | 'somascan'
  const scrollContainerRef = useRef(null);
  const { addToast } = useToast();

  // Gamification Local State MVPs
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [unlockedLeaves, setUnlockedLeaves] = useState(0);

  const handleLeafDiscovered = (xpGained) => {
    setUserXP((prev) => {
      const nextXP = prev + xpGained;
      if (nextXP >= userLevel * 50) {
        setUserLevel((lvl) => lvl + 1);
        setTimeout(
          () =>
            addToast(
              `Parabéns! Você alcançou o Nível ${userLevel + 1} 🌟`,
              "success",
            ),
          800,
        );
      }
      return nextXP;
    });
    setUnlockedLeaves((prev) => prev + 1);
    addToast(`+${xpGained} XP! Nova folha de sabedoria.`, "success");
  };

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
      className="fv-section fv-section--cream fv-bg fv-bg-resources border-t border-border/60"
    >
      <div className="fv-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center max-w-2xl mx-auto"
        >
          <span className="fv-eyebrow mb-4">
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
          <div className="absolute left-0 top-0 bottom-12 w-12 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-12 w-12 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

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
              className="fv-card group relative w-80 shrink-0 cursor-pointer snap-center items-center overflow-hidden p-8 text-center md:w-auto"
              onClick={() => openResource("breathing")}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-accent/10 text-accent transition-transform group-hover:scale-105">
                <Wind size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Guia de Respiração
              </h3>
              <p className="mb-6 flex-grow text-sm text-text/75">
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
              className="fv-card group relative w-80 shrink-0 cursor-pointer snap-center items-center overflow-hidden p-8 text-center md:w-auto"
              onClick={() => openResource("tree")}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-gold/15 text-gold-dark transition-transform group-hover:scale-105">
                <Sprout size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Árvore da Awareness
              </h3>
              <p className="mb-6 flex-grow text-sm text-text/75">
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
              className="fv-card group relative w-80 shrink-0 cursor-pointer snap-center items-center overflow-hidden p-8 text-center md:w-auto"
              onClick={() => openResource("somascan")}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-terra/10 text-terra transition-transform group-hover:scale-105">
                <Fingerprint size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                SomaScan
              </h3>
              <p className="mb-6 flex-grow text-sm text-text/75">
                Mapeamento corporal consciente para escutar o que o corpo diz.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-terra transition-colors group-hover:text-primary">
                Iniciar Scan
              </span>
            </motion.div>

            {/* Mental Health Quiz Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="fv-card group relative w-80 shrink-0 cursor-pointer snap-center items-center overflow-hidden p-8 text-center md:w-auto"
              onClick={() => openResource("quiz")}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-sage/10 text-sage transition-transform group-hover:scale-105">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Quiz de Saúde Mental
              </h3>
              <p className="mb-6 flex-grow text-sm text-text/75">
                Mindful Roots: Um check-in rápido de 14 dias para sua saúde
                emocional.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
                Fazer Check-in
              </span>
            </motion.div>
          </div>

          {/* Visual Scroll Controls */}
          <div className="flex md:hidden items-center justify-center gap-6 mt-4 opacity-70 hover:opacity-100 transition-opacity pb-4">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-transparent p-3 text-muted transition-colors hover:border-border hover:bg-areia hover:text-primary"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-areia">
              <motion.div
                className="h-full w-1/3 rounded-full bg-nevoa"
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
              className="rounded-full border border-transparent p-3 text-muted transition-colors hover:border-border hover:bg-areia hover:text-primary"
              aria-label="Scroll Right"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Transition Overlay */}
      {/* Full Screen Transition Overlay */}
      <Modal isOpen={!!activeResource} onClose={closeResource}>
        <ModalContent size="xl" className="bg-paper p-0">
          {/* Wrapper Exit Button (Global for all resources) */}
          <div className="absolute top-6 left-6 z-50">
            <button
              onClick={closeResource}
              className="flex items-center gap-2 rounded-md border border-border bg-paper/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text backdrop-blur transition-colors hover:border-igarape hover:bg-areia hover:text-primary active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              <span className="hidden md:inline">Voltar</span>
            </button>
          </div>

          {/* Premium Close Button (Top Right) */}
          <button
            onClick={closeResource}
            className="group absolute right-6 top-6 z-50 flex items-center gap-2 rounded-md border border-border bg-paper/90 py-2 pl-3 pr-2 text-primary backdrop-blur transition-colors hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
              Fechar
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-areia transition-colors group-hover:bg-white/20">
              <span className="text-xl leading-none -mt-1">×</span>
            </div>
          </button>

          <ModalBody className="p-0">
            {activeResource === "breathing" && (
              <BreathingApp onClose={closeResource} />
            )}

            {activeResource === "tree" && (
              <FeelingsTree
                isModal={true}
                onClose={closeResource}
                userLevel={userLevel}
                userXP={userXP}
                unlockedLeavesCount={unlockedLeaves}
                onLeafDiscovered={handleLeafDiscovered}
              />
            )}

            {activeResource === "somascan" && (
              <div className="relative h-full min-h-[80vh] w-full bg-paper">
                <SomaScan />
              </div>
            )}

            {activeResource === "quiz" && (
              <MentalHealthQuiz onClose={closeResource} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
}
