"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Wind, Sprout, Sparkles, Fingerprint } from "lucide-react";
import ResourceExperienceShell from "./resources/ResourceExperienceShell";
import { ResourceLoader } from "./resources/ResourceStates";
import { useToast } from "@/context/ToastContext";

/*
 * Code splitting: cada recurso interativo (Three.js, canvas, áudio, IA)
 * só entra no bundle quando o usuário realmente o abre.
 */
const BreathingApp = dynamic(() => import("./resources/BreathingApp"), {
  ssr: false,
  loading: () => <ResourceLoader message="Preparando o Guia de Respiração…" />,
});
const FeelingsTree = dynamic(() => import("./FeelingsTree"), {
  ssr: false,
  loading: () => <ResourceLoader message="Preparando a Árvore da Emoção…" />,
});
const MentalHealthQuiz = dynamic(() => import("./resources/MentalHealthQuiz"), {
  ssr: false,
  loading: () => (
    <ResourceLoader message="Preparando o Quiz de Saúde Mental…" />
  ),
});
const SomaScan = dynamic(() => import("./somascan/App"), {
  ssr: false,
  loading: () => <ResourceLoader message="Preparando o SomaScan…" />,
});

const RESOURCES = [
  {
    id: "breathing",
    icon: Wind,
    title: "Guia de Respiração",
    description:
      "Uma pausa guiada para reduzir a ansiedade e reconectar com o agora.",
    cta: "Iniciar prática",
    loadingMessage: "Preparando o Guia de Respiração…",
  },
  {
    id: "tree",
    icon: Sprout,
    title: "Árvore da Emoção",
    description:
      "Visualize e nomeie suas emoções em uma experiência interativa 3D.",
    cta: "Acessar árvore",
    loadingMessage: "Preparando a Árvore da Emoção…",
  },
  {
    id: "somascan",
    icon: Fingerprint,
    title: "SomaScan",
    description:
      "Mapeamento corporal consciente para escutar o que o corpo diz.",
    cta: "Iniciar scan",
    loadingMessage: "Preparando o SomaScan…",
  },
  {
    id: "quiz",
    icon: Sparkles,
    title: "Quiz de Saúde Mental",
    description:
      "Mindful Roots: um check-in rápido de 14 dias para sua saúde emocional.",
    cta: "Fazer check-in",
    loadingMessage: "Preparando o Quiz de Saúde Mental…",
  },
];

export default function ResourcesSection() {
  const [activeResource, setActiveResource] = useState(null);
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

  const closeResource = () => setActiveResource(null);

  const active = RESOURCES.find((r) => r.id === activeResource) ?? null;

  return (
    <section
      id="recursos-interativos"
      className="py-24 bg-fv-creme border-t border-fv-nevoa relative transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-fv-terra-barro mb-4 block">
            Ferramentas de Cuidado
          </span>
          <h2 className="heading-section text-fv-verde-raiz">
            Recursos{" "}
            <span className="italic text-fv-verde-igarape font-light">
              Interativos
            </span>
          </h2>
          <p className="text-lg text-fv-pedra mt-4">
            Espaços digitais desenhados para cultivar a presença e a awareness
            no seu dia a dia.
          </p>
        </motion.div>

        {/*
         * Grid único auto-fit minmax(240px, 1fr): mesma altura, padding,
         * posição de ícone/título/descrição/CTA em todos os cards, sem
         * carrossel horizontal e sem larguras fixas que deixavam buracos.
         */}
        <ul className="fv-resource-grid list-none p-0 m-0">
          {RESOURCES.map(({ id, icon: Icon, title, description, cta }) => (
            <li key={id} className="contents">
              <button
                type="button"
                className="fv-resource-card"
                onClick={() => setActiveResource(id)}
                aria-haspopup="dialog"
              >
                <span className="fv-resource-card__icon" aria-hidden="true">
                  <Icon size={28} />
                </span>
                <h3 className="fv-resource-card__title">{title}</h3>
                <p className="fv-resource-card__desc">{description}</p>
                <span className="fv-resource-card__cta">{cta}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ResourceExperienceShell
        isOpen={!!active}
        onClose={closeResource}
        title={active?.title ?? ""}
        loadingMessage={active?.loadingMessage}
      >
        {activeResource === "breathing" && (
          <BreathingApp onClose={closeResource} />
        )}

        {activeResource === "tree" && (
          <FeelingsTree
            isModal
            onClose={closeResource}
            userLevel={userLevel}
            userXP={userXP}
            unlockedLeavesCount={unlockedLeaves}
            onLeafDiscovered={handleLeafDiscovered}
          />
        )}

        {activeResource === "somascan" && (
          <div className="w-full min-h-full bg-fv-creme">
            <SomaScan />
          </div>
        )}

        {activeResource === "quiz" && (
          <MentalHealthQuiz onClose={closeResource} />
        )}
      </ResourceExperienceShell>
    </section>
  );
}
