"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Wind, Sprout, Sparkles, Fingerprint } from "lucide-react";
import ResourceExperienceShell from "./resources/ResourceExperienceShell";
import { ResourceLoader } from "./resources/ResourceStates";

/*
 * Code splitting: cada recurso interativo (Three.js, canvas, áudio, IA)
 * só entra no bundle quando o usuário realmente o abre.
 */
const BreathingApp = dynamic(() => import("./resources/BreathingApp"), {
  ssr: false,
  loading: () => <ResourceLoader message="Preparando o Guia de Respiração…" />,
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
    title: "Árvore da Awareness",
    description:
      "Visualize e nomeie suas emoções em uma experiência interativa 3D.",
    cta: "Acessar árvore",
    // A Árvore da Awareness é uma experiência imersiva própria (tema escuro,
    // canvas Three.js dedicado) e vive na própria rota, não dentro do shell.
    href: "/recursos/arvore-da-awareness",
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
  const router = useRouter();

  const openResource = (resource) => {
    if (resource.href) {
      router.push(resource.href);
      return;
    }
    setActiveResource(resource.id);
  };

  const closeResource = () => setActiveResource(null);

  const active = RESOURCES.find((r) => r.id === activeResource) ?? null;

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
          <span className="fv-eyebrow mb-4">Ferramentas de Cuidado</span>
          <h2 className="heading-section text-primary">
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
          {RESOURCES.map((resource) => {
            const { id, icon: Icon, title, description, cta } = resource;
            return (
              <li key={id} className="contents">
                <button
                  type="button"
                  className="fv-resource-card"
                  onClick={() => openResource(resource)}
                  aria-haspopup={resource.href ? undefined : "dialog"}
                >
                  <span className="fv-resource-card__icon" aria-hidden="true">
                    <Icon size={28} />
                  </span>
                  <h3 className="fv-resource-card__title">{title}</h3>
                  <p className="fv-resource-card__desc">{description}</p>
                  <span className="fv-resource-card__cta">{cta}</span>
                </button>
              </li>
            );
          })}
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
