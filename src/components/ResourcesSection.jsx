"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { ResourceExperience } from "./resources/ResourceExperience";
import ResourceAppFrame from "./resources/ResourceAppFrame";
import ComingSoonResource from "./resources/ComingSoonResource";
import { resourceCatalog } from "./resources/resourceCatalog";
import { emotionTreeFonts } from "./resources/apps/emotion-tree/fonts";

const ResourceLoading = () => (
  <div
    className="flex h-full items-center justify-center bg-paper"
    role="status"
    aria-label="Carregando recurso"
  >
    <div className="text-center">
      <div
        className="h-5 w-5 animate-spin border-2 border-accent border-t-transparent rounded-full mx-auto"
        aria-hidden="true"
      />
      <span className="mt-3 block text-sm text-text/60">
        Preparando recurso...
      </span>
    </div>
  </div>
);

const lazy = (loader) =>
  dynamic(loader, {
    ssr: false,
    loading: ResourceLoading,
  });

const resourceApps = {
  "roda-das-emocoes": lazy(() =>
    import("@/features/interactive-resources/emotion-wheel/EmotionWheelExperience").then(
      (module) => module.EmotionWheelExperience,
    ),
  ),
  breathing: lazy(() => import("./resources/apps/breathing/BreathingApp")),
  "emotion-tree": lazy(() =>
    import("./resources/apps/emotion-tree/EmotionTreeApp").then(
      (module) => module.EmotionTreeApp,
    ),
  ),
  somascan: lazy(() => import("./resources/apps/soma-scan/App")),
  quiz: lazy(() => import("./Quiz/App").then((module) => module.App)),
  lago: lazy(() => import("./resources/apps/lago/LagoApp")),
  "grounding-54321": lazy(() => import("./resources/apps/grounding-54321/App")),
  "body-map": lazy(() => import("./resources/apps/body-map/BodyMapApp")),
  "intensidade-agora": lazy(
    () => import("./resources/apps/intensidade-agora/IntensidadeAgoraApp"),
  ),
  "diario-aqui-e-agora": lazy(
    () => import("./resources/apps/diario-aqui-e-agora/App"),
  ),
  "check-in": lazy(() => import("./resources/apps/check-in/CheckInApp")),
  "necessidades-agora": lazy(
    () => import("./resources/apps/necessidades-agora/NeedsNowApp"),
  ),
  "figura-e-fundo": lazy(() => import("./resources/apps/figura-e-fundo/App")),
  polaridades: lazy(
    () => import("./resources/apps/polaridades/PolaridadesApp"),
  ),
  "duas-cadeiras": lazy(() => import("./resources/apps/duas-cadeiras/App")),
  "jardim-de-pensamentos": lazy(
    () => import("./resources/apps/jardim-de-pensamentos/JardimPensamentosApp"),
  ),
  "sala-de-pausa": lazy(
    () => import("./resources/apps/sala-de-pausa/SalaDePausaApp"),
  ),
  "cartas-gestalticas": lazy(
    () => import("./resources/apps/cartas-gestalticas/App"),
  ),
  "banco-de-microcasos": lazy(
    () => import("./resources/apps/banco-de-microcasos/BancoMicrocasosApp"),
  ),
  "fronteiras-de-contato": lazy(
    () => import("./resources/apps/fronteiras-de-contato/App"),
  ),
  "ciclo-do-contato": lazy(() => import("./resources/apps/ciclodocontato/App")),
  "caso-clinico": lazy(
    () => import("./resources/apps/casoclinicointerativo/App"),
  ),
};

const categories = ["PERCEBER", "REGULAR", "EXPERIMENTAR", "APRENDER"];

function ResourceCard({ resource, index, onOpen }) {
  const Icon = resource.icon;
  const available = resource.status === "available";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.14) }}
      onClick={() => onOpen(resource.slug)}
      aria-label={`${resource.title}. ${resource.description}`}
      className="group relative min-h-52 overflow-hidden rounded-2xl border border-primary/15 bg-paper p-5 text-left shadow-[0_10px_30px_rgba(41,54,39,0.06)] transition duration-200 hover:-translate-y-1 hover:border-terra/45 hover:shadow-[0_16px_34px_rgba(41,54,39,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-3"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-terra/0 transition-colors group-hover:bg-terra/70" />
      <span className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-areia text-primary transition group-hover:border-terra/25 group-hover:text-terra">
          <Icon size={21} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/65">
          {available ? "Disponível" : "Em preparação"}
        </span>
      </span>

      <span className="mt-5 block font-serif text-2xl leading-tight text-primary">
        {resource.title}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-text/72">
        {resource.description}
      </span>

      <span className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary/60">
        {resource.duration ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            {resource.duration}
          </span>
        ) : null}
        {resource.privacy === "private" ? (
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole size={14} aria-hidden="true" />
            Conteúdo pessoal
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

export default function ResourcesSection() {
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [openCategories, setOpenCategories] = useState({});

  const resource = resourceCatalog.find((item) => item.slug === activeSlug);
  const ActiveApp = activeSlug ? resourceApps[activeSlug] : null;

  const handleOpen = (slug) => {
    setActiveSlug(slug);
    const found = resourceCatalog.find((item) => item.slug === slug);
    if (found?.sections?.[0]) {
      setActiveSection(found.sections[0].id);
    } else {
      setActiveSection(null);
    }
  };

  const toggleCategory = (category) => {
    setOpenCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  return (
    <section
      id="recursos-interativos"
      aria-labelledby="resources-title"
      className="border-t border-primary/10 bg-surface py-16 sm:py-20"
    >
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-terra">
            <Sparkles size={14} aria-hidden="true" />
            Ferramentas de cuidado e formação
          </span>
          <h2
            id="resources-title"
            className="heading-section mt-3 text-primary"
          >
            Recursos <span className="italic text-accent">Interativos</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text/75 sm:text-lg">
            Convites digitais para observar, sentir e refletir — no seu ritmo,
            sem substituir acompanhamento profissional.
          </p>
        </header>

        <div className="space-y-10">
          {categories.map((category) => {
            const items = resourceCatalog.filter(
              (item) => item.category === category,
            );
            const isOpen = Boolean(openCategories[category]);
            const visibleItems = isOpen ? items : items.slice(0, 4);
            const hasHiddenItems = items.length > 4;
            const panelId = `resources-${category.toLowerCase()}`;
            const headingId = `category-${category.toLowerCase()}`;

            return (
              <section
                key={category}
                aria-labelledby={headingId}
                className="border-b border-primary/10 pb-10"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h3
                      id={headingId}
                      className="font-serif text-2xl text-primary"
                    >
                      {category}
                    </h3>
                    <p className="mt-1 text-sm text-primary/55">
                      {items.length}{" "}
                      {items.length === 1 ? "experiência" : "experiências"}
                    </p>
                  </div>
                  {hasHiddenItems ? (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleCategory(category)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/15 px-4 text-xs font-bold uppercase tracking-widest text-primary transition hover:border-terra hover:text-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {isOpen ? "Recolher" : "Ver todos"}
                      {isOpen ? (
                        <ChevronUp size={18} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={18} aria-hidden="true" />
                      )}
                    </button>
                  ) : null}
                </div>

                <div
                  id={panelId}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {visibleItems.map((item, index) => (
                    <ResourceCard
                      key={item.slug}
                      resource={item}
                      index={index}
                      onOpen={handleOpen}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <ResourceExperience
        isOpen={Boolean(resource)}
        title={resource?.title ?? "Recurso interativo"}
        category={resource ? `${resource.category} · Figura Viva` : undefined}
        onClose={() => setActiveSlug(null)}
        sections={resource?.sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        className={resource?.slug === "emotion-tree" ? emotionTreeFonts : ""}
      >
        {resource ? (
          <>
            {resource.status === "coming-soon" ? (
              <ComingSoonResource resource={resource} />
            ) : ActiveApp ? (
              <div
                className={
                  resource.slug === "emotion-tree"
                    ? "resource-app--tree h-full min-h-0"
                    : "h-full min-h-0"
                }
              >
                <ActiveApp
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>
            ) : (
              <ResourceAppFrame
                title={resource.title}
                status="error"
                errorMessage="Este recurso ainda não possui uma implementação disponível."
              >
                {null}
              </ResourceAppFrame>
            )}
          </>
        ) : null}
      </ResourceExperience>
    </section>
  );
}

export { resourceApps };
