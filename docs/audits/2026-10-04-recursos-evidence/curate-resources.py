from pathlib import Path
import re

root = Path(__file__).resolve().parents[3]
def write(path, content):
    (root / path).write_text(content.strip() + '\n', encoding='utf-8')
def edit(path, before, after):
    file = root / path
    source = file.read_text(encoding='utf-8')
    assert before in source, (path, before)
    file.write_text(source.replace(before, after), encoding='utf-8')

write('src/components/providers/ThemeProvider.tsx', '''
"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export const THEME_STORAGE_KEY = "theme";
interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
  mounted: boolean;
}
const ThemeContext = createContext<ThemeContextValue>({
  preference: "light", theme: "light", setPreference: () => {}, toggle: () => {}, mounted: false,
});

// Each page load starts light; manual changes last only while the site stays open.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#FDFAF4" : "#12160F");
  }, [theme]);
  const setPreference = useCallback((next: ThemePreference) => setTheme(next === "dark" ? "dark" : "light"), []);
  const toggle = useCallback(() => setTheme(current => current === "light" ? "dark" : "light"), []);
  const value = useMemo(() => ({ preference: theme, theme, setPreference, toggle, mounted }), [theme, setPreference, toggle, mounted]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export const themeInitScript = `(function(){var r=document.documentElement;r.classList.remove("dark");r.style.colorScheme="light";r.dataset.theme="light";})();`;
''')
edit('src/app/layout.tsx', '''themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF4" },
    { media: "(prefers-color-scheme: dark)", color: "#12160F" },
  ],''', 'themeColor: "#FDFAF4",')
edit('src/components/ui/FloatingControls.tsx', '''preference === "light"
        ? "dark"
        : preference === "dark"
          ? "system"
          : "light",''', 'preference === "light" ? "dark" : "light",')

catalog_path = 'src/components/resources/resourceCatalog.tsx'
source = (root / catalog_path).read_text(encoding='utf-8')
prefix = source[:source.index('export const resourceCatalog')]
prefix = re.sub(r'import \{[\s\S]*?\} from "lucide-react";', 'import { BookOpen, Circle, Fingerprint, Flower2, Lightbulb, Mountain, PenLine, Sparkles, Waves } from "lucide-react";', prefix)
write(catalog_path, prefix + '''export const resourceCatalog: ResourceDefinition[] = [
  { slug: "roda-das-emocoes", title: "Roda das Emoções", description: "Encontre palavras para o que você percebe agora.", category: "PERCEBER", duration: "2–5 min", icon: Sparkles, status: "available", privacy: "private", persistence: "optional" },
  { slug: "emotion-tree", title: "Árvore das Emoções", description: "Encontre mensagens de acolhimento entre as folhas.", category: "PERCEBER", duration: "3–8 min", icon: Flower2, status: "available", privacy: "private", persistence: "optional" },
  { slug: "body-map", title: "Mapa Corporal", description: "Localize sensações e perceba sua intensidade.", category: "PERCEBER", duration: "2–5 min", icon: Fingerprint, status: "available", privacy: "private", persistence: "none" },
  { slug: "diario-aqui-e-agora", title: "Diário do Aqui e Agora", description: "Faça um check-in e registre o que se apresenta.", category: "PERCEBER", duration: "3–8 min", icon: PenLine, status: "available", privacy: "private", persistence: "optional" },
  { slug: "necessidades-agora", title: "Necessidades Agora", description: "Reconheça necessidades presentes, no seu tempo.", category: "PERCEBER", duration: "3–5 min", icon: Lightbulb, status: "available", privacy: "private", persistence: "optional" },
  { slug: "sala-de-pausa", title: "Sala de Pausa", description: "Escolha respirar, observar, escutar ou ancorar os sentidos.", category: "REGULAR", duration: "2–10 min", icon: Mountain, status: "available", privacy: "none", persistence: "none", sections: [
    { id: "pause", label: "Pausa livre" }, { id: "breathing", label: "Respiração" }, { id: "grounding", label: "5 · 4 · 3 · 2 · 1" }, { id: "sounds", label: "Escuta" },
  ] },
  { slug: "lago", title: "Lago", description: "Toque a água e acompanhe o movimento das ondas.", category: "REGULAR", duration: "livre", icon: Waves, status: "available", privacy: "none", persistence: "none" },
  { slug: "rio-dos-pensamentos", title: "Rio dos Pensamentos", description: "Observe pensamentos passando, sem precisar afastá-los.", category: "REGULAR", duration: "2–5 min", icon: Waves, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "experience", label: "Experiência" }, { id: "history", label: "Histórico" },
  ] },
  { slug: "figura-e-fundo", title: "Figura e Fundo", description: "Observe como uma figura emerge dentro de um campo.", category: "EXPERIMENTAR", duration: "3–5 min", icon: Circle, status: "available", privacy: "none", persistence: "none" },
  { slug: "banco-de-microcasos", title: "Banco de Microcasos", description: "Explore situações fictícias curtas para estudo.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "home", label: "Início" }, { id: "history", label: "Minha exploração" },
  ] },
  { slug: "cartas-gestalticas", title: "Cartas Gestálticas", description: "Estude conceitos, autores e perguntas para reflexão.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "home", label: "Início" }, { id: "explore", label: "Explorar" }, { id: "review", label: "Revisão" }, { id: "random", label: "Aleatório" }, { id: "favorites", label: "Favoritos" }, { id: "history", label: "Histórico" },
  ] },
  { slug: "ciclo-do-contato", title: "Ciclo do Contato", description: "Explore etapas do contato e aplique-as a uma situação.", category: "APRENDER", duration: "5–10 min", icon: BookOpen, status: "available", privacy: "private", persistence: "optional", sections: [
    { id: "opening", label: "Início" }, { id: "guided", label: "Guiado" }, { id: "free", label: "Explorar" }, { id: "practice", label: "Aplicar" }, { id: "review", label: "Rever" },
  ] },
];

// Old shared URLs lead to the consolidated experience, never to a duplicate card.
export const resourceAliases: Record<string, string> = {
  "intensidade-agora": "body-map",
  "check-in": "diario-aqui-e-agora",
  breathing: "sala-de-pausa",
  "grounding-54321": "sala-de-pausa",
  "sons-para-awareness": "sala-de-pausa",
  "jardim-de-pensamentos": "rio-dos-pensamentos",
  "arvore-das-emocoes": "emotion-tree",
  "mapa-corporal": "body-map",
  respiracao: "sala-de-pausa",
};
''')

path = root / 'src/components/ResourcesSection.jsx'
source = path.read_text(encoding='utf-8')
source = source.replace('  Clock3,\n  LockKeyhole,\n', '')
source = source.replace('import ComingSoonResource from "./resources/ComingSoonResource";\n', '')
for slug in ['breathing','somascan','quiz','grounding-54321','intensidade-agora','check-in','polaridades','duas-cadeiras','jardim-de-pensamentos','sons-para-awareness','fronteiras-de-contato','caso-clinico']:
    pattern = r'  (?:"' + re.escape(slug) + r'"|' + re.escape(slug) + r'): lazy\([\s\S]*?\),\n(?=  ["a-z]|\};)'
    source, count = re.subn(pattern, '', source, count=1)
    assert count == 1, slug
start, end = source.index('function ResourceCard('), source.index('export default function ResourcesSection')
source = source[:start] + '''function ResourceCard({ resource, index }) {
  const Icon = resource.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.1) }}>
      <Link
        href={`/recursos/${resource.slug}`}
        aria-label={`${resource.title}. ${resource.description}`}
        className="group flex h-full items-start gap-3 rounded-md border border-primary/15 bg-paper p-4 transition-colors hover:border-igarape hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-areia text-primary" aria-hidden="true">
          <Icon size={17} strokeWidth={1.6} />
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-tight text-primary">{resource.title}</span>
          <span className="mt-1.5 line-clamp-2 text-sm leading-snug text-text/80">{resource.description}</span>
        </span>
      </Link>
    </motion.div>
  );
}

''' + source[end:]
source = source.replace('''              const comingSoon = items.filter(
                (item) => item.status !== "available",
              );\n''', '')
source = source.replace('''              const visibleComingSoon = isOpen
                ? comingSoon
                : comingSoon.slice(0, 4);\n''', '')
source = re.sub(r'\n                    \{visibleComingSoon.length > 0 && \([\s\S]*?\n                    \)\}', '', source)
source = source.replace('''{resource.status === "coming-soon" ? (
              <ComingSoonResource resource={resource} />
            ) : ActiveApp ? (''', '''{ActiveApp ? (''')
path.write_text(source, encoding='utf-8')

edit('src/app/recursos/[slug]/page.tsx', 'import { notFound }', 'import { notFound, redirect }')
edit('src/app/recursos/[slug]/page.tsx', 'import { resourceCatalog }', 'import { resourceCatalog, resourceAliases }')
edit('src/app/recursos/[slug]/page.tsx', '  const resource = resourceCatalog.find((item) => item.slug === slug);', '  const canonicalSlug = resourceAliases[slug] ?? slug;\n  const resource = resourceCatalog.find((item) => item.slug === canonicalSlug);')
edit('src/app/recursos/[slug]/page.tsx', '  // Pending resources deliberately have no route: their catalog card is informational only.', '  if (resourceAliases[slug]) redirect(`/recursos/${canonicalSlug}`);\n\n  // Retired and unimplemented resources are no longer published.')
write('src/app/recursos/arvore-da-awareness/page.tsx', '''
import { redirect } from "next/navigation";
export default function AwarenessTreePage() { redirect("/recursos/emotion-tree"); }
''')

# Lesson authors see the same curated inventory as public visitors.
write('src/features/interactive-resources/clinicalToolsRegistry.ts', '''
import { resourceCatalog, resourceAliases } from "@/components/resources/resourceCatalog";
export interface ClinicalTool {
  slug: string;
  name: string;
  category: "awareness" | "experiment" | "expression" | "assessment";
  description: string;
  path: string;
  estimatedMinutes: number;
}
export const CLINICAL_TOOLS_REGISTRY: ClinicalTool[] = resourceCatalog.map(resource => ({
  slug: resource.slug,
  name: resource.title,
  category: resource.category === "APRENDER" || resource.category === "EXPERIMENTAR" ? "experiment" : "awareness",
  description: resource.description,
  path: `/recursos/${resource.slug}`,
  estimatedMinutes: Number(resource.duration?.match(/\\d+/)?.[0] ?? 5),
}));
export function getClinicalTool(slug: string): ClinicalTool | undefined {
  const legacy: Record<string, string> = { EmotionWheel: "roda-das-emocoes", "rios-dos-pensamentos": "rio-dos-pensamentos", ciclodocontato: "ciclo-do-contato" };
  const canonical = resourceAliases[slug] ?? legacy[slug] ?? slug;
  return CLINICAL_TOOLS_REGISTRY.find(tool => tool.slug === canonical);
}
''')
print('Curated catalog, compact cards, routes, registry and light-first theme updated.')
