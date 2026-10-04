"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ResourceExperience } from "./resources/ResourceExperience";
import ResourceAppFrame from "./resources/ResourceAppFrame";
import { resourceCatalog } from "./resources/resourceCatalog";
import { emotionTreeFonts } from "./resources/apps/emotion-tree/fonts";
import { useAuth } from "@/context/AuthContext";

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
  "roda-das-emocoes": lazy(
    () => import("./resources/apps/EmotionWheel/EmotionWheelApp"),
  ),
  "emotion-tree": lazy(() =>
    import("./resources/apps/emotion-tree/EmotionTreeApp").then(
      (module) => module.EmotionTreeApp,
    ),
  ),
  lago: lazy(() => import("./resources/apps/lago/LagoApp")),
  "body-map": lazy(() => import("./resources/apps/body-map/BodyMapApp")),
  "diario-aqui-e-agora": lazy(
    () => import("./resources/apps/diario-aqui-e-agora/App"),
  ),
  "necessidades-agora": lazy(
    () => import("./resources/apps/necessidades-agora/NeedsNowApp"),
  ),
  "figura-e-fundo": lazy(() => import("./resources/apps/figura-e-fundo/App")),
  "rio-dos-pensamentos": lazy(() =>
    import("@/features/interactive-resources/thought-river/ThoughtRiverExperience").then(
      (module) => module.ThoughtRiverExperience,
    ),
  ),
  "sala-de-pausa": lazy(
    () => import("./resources/apps/sala-de-pausa/ConsolidatedPauseApp"),
  ),
  "cartas-gestalticas": lazy(
    () => import("./resources/apps/cartas-gestalticas/App"),
  ),
  "banco-de-microcasos": lazy(
    () => import("./resources/apps/banco-de-microcasos/BancoMicrocasosApp"),
  ),
  "ciclo-do-contato": lazy(() => import("./resources/apps/ciclodocontato/App")),
};

const categories = ["PERCEBER", "REGULAR", "EXPERIMENTAR", "APRENDER"];

const needs = [
  { category: null, label: "Mostrar todos", prompt: "Todas as experiências" },
  {
    category: "PERCEBER",
    label: "Perceber",
    prompt: "Quero observar meu corpo",
  },
  { category: "REGULAR", label: "Regular", prompt: "Quero desacelerar" },
  {
    category: "EXPERIMENTAR",
    label: "Experimentar",
    prompt: "Quero entender o que estou sentindo",
  },
  { category: "APRENDER", label: "Aprender", prompt: "Quero estudar" },
];

function ResourceCard({ resource, className = "" }) {
  const Icon = resource.icon;
  return (
    <div className={className}>
      <Link
        href={`/recursos/${resource.slug}`}
        aria-label={`${resource.title}. ${resource.description}`}
        className="group flex h-full items-start gap-3 rounded-md border border-primary/15 bg-paper p-4 transition-colors hover:border-igarape hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-areia text-primary"
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={1.6} />
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-tight text-primary">
            {resource.title}
          </span>
          <span className="resource-card-description mt-1.5 text-sm leading-snug text-text/80">
            {resource.description}
          </span>
        </span>
      </Link>
    </div>
  );
}

export default function ResourcesSection({ initialActiveSlug = null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSlug, setActiveSlug] = useState(initialActiveSlug);
  const [activeSection, setActiveSection] = useState(null);
  const [needFilter, setNeedFilter] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setActiveSlug(initialActiveSlug);
  }, [initialActiveSlug]);

  const resource = resourceCatalog.find((item) => item.slug === activeSlug);
  const ActiveApp = activeSlug ? resourceApps[activeSlug] : null;

  useEffect(() => {
    if (resource?.sections?.[0]) {
      setActiveSection(resource.sections[0].id);
    } else {
      setActiveSection(null);
    }
  }, [resource?.slug, resource?.sections]);

  return (
    <section
      id="recursos-interativos"
      aria-labelledby="resources-title"
      className="bg-surface py-10 sm:py-12"
    >
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* O QUE VOCÊ PRECISA AGORA? */}
        <div className="mx-auto mb-9 max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-terra">
            <Sparkles size={14} aria-hidden="true" />
            Ferramentas de cuidado e formação
          </span>
          <h2
            id="resources-title"
            className="heading-section mt-3 text-primary"
          >
            O que você precisa agora?
          </h2>

          <div
            role="group"
            aria-label="Filtrar recursos por categoria"
            className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
          >
            {needs.map((need) => {
              const isActive = needFilter === need.category;
              return (
                <button
                  key={need.category ?? "all"}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setNeedFilter(need.category);
                    setExpandedCategories({});
                  }}
                  className={`min-h-16 rounded-md border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${need.category === null ? "col-span-2 sm:col-span-1" : ""} ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-primary/15 bg-paper text-primary hover:border-igarape hover:bg-areia"
                  }`}
                >
                  <span className="block font-serif text-base">
                    {need.label}
                  </span>
                  <span
                    className={`mt-1 block text-xs ${isActive ? "text-white/85" : "text-primary/70"}`}
                  >
                    {need.prompt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {categories
            .filter((category) => !needFilter || category === needFilter)
            .map((category) => {
              const items = resourceCatalog.filter(
                (item) => item.category === category,
              );
              const available = items.filter(
                (item) => item.status === "available",
              );
              const isExpanded = Boolean(expandedCategories[category]);
              const expansionVisibility =
                isExpanded || available.length > 4
                  ? "inline-flex"
                  : available.length > 2
                    ? "inline-flex lg:hidden"
                    : "inline-flex sm:hidden";
              const panelId = `resources-${category.toLowerCase()}`;
              const headingId = `category-${category.toLowerCase()}`;

              return (
                <section
                  key={category}
                  aria-labelledby={headingId}
                  className="border-b border-primary/10 pb-7"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3
                        id={headingId}
                        className="font-serif text-2xl text-primary"
                      >
                        {category}
                      </h3>
                      <p className="mt-1 text-sm text-primary/70">
                        {items.length}{" "}
                        {items.length === 1 ? "experiência" : "experiências"}
                      </p>
                    </div>
                  </div>

                  <div id={panelId}>
                    {available.length > 0 && (
                      <div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {available.map((item, index) => (
                            <ResourceCard
                              key={item.slug}
                              resource={item}
                              className={
                                isExpanded || index === 0
                                  ? "block"
                                  : index === 1
                                    ? "hidden sm:block"
                                    : index < 4
                                      ? "hidden lg:block"
                                      : "hidden"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {available.length > 1 && (
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        aria-controls={panelId}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Recolher categoria ${category.toLowerCase()}`
                            : `Ver todos os ${available.length} recursos de ${category.toLowerCase()}`
                        }
                        onClick={() =>
                          setExpandedCategories((current) => ({
                            ...current,
                            [category]: !current[category],
                          }))
                        }
                        className={`${expansionVisibility} min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-primary transition-colors hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
                      >
                        {isExpanded
                          ? "Recolher"
                          : `Ver todos os ${available.length} recursos`}
                        {isExpanded ? (
                          <ChevronUp size={16} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      </div>

      <ResourceExperience
        isOpen={Boolean(resource)}
        title={resource?.title ?? "Recurso interativo"}
        category={resource ? `${resource.category} · Figura Viva` : undefined}
        onClose={() => {
          setActiveSlug(null);
          router.push("/recursos");
        }}
        sections={resource?.sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        className={resource?.slug === "emotion-tree" ? emotionTreeFonts : ""}
      >
        {resource ? (
          <>
            {ActiveApp ? (
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
                  userId={user?.id ?? user?.uid}
                  user={user}
                  onExit={() => {
                    setActiveSlug(null);
                    router.push("/recursos");
                  }}
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
