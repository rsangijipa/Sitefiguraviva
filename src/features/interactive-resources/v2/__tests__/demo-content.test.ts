import { TextEncoder } from "node:util";
import content from "../../../../../supabase/manual/recursos-demo-content.json";
import { resourceCatalog } from "@/components/resources/resourceCatalog";
import { DECKS, EditorialConfigSchema, editorialIssues } from "../editorial-schema";

beforeAll(() => { Object.assign(globalThis, { TextEncoder }); });
const configurations = Object.fromEntries(Object.entries(content).map(([key, value]) => [key, EditorialConfigSchema.parse(value)]));
const formats = (key: string) => new Set(configurations[key].items.map(item => item.format));

describe("conteúdo de demonstração dos recursos", () => {
  it("cobre todos os recursos do catálogo e passa na conferência do editor", () => {
    expect(Object.keys(configurations).sort()).toEqual(resourceCatalog.filter(item => item.visibility !== "hidden").map(item => item.slug).sort());
    for (const [key, configuration] of Object.entries(configurations)) {
      expect(configuration.resourceKey).toBe(key);
      expect({ key, issues: editorialIssues(configuration) }).toEqual({ key, issues: [] });
    }
  });

  it("não inventa páginas nem usa arte ou áudio sem curadoria", () => {
    for (const configuration of Object.values(configurations)) {
      expect(configuration.audio).toEqual([]);
      for (const item of configuration.items) {
        expect(item.asset).toBe("");
        expect(item.references.every(reference => reference.pages === "")).toBe(true);
      }
    }
  });

  it("tem material para cada modo que filtra por formato", () => {
    expect(formats("figura-e-fundo")).toEqual(new Set(["perceptivo", "clinico", "sessao"]));
    expect(formats("ciclo-do-contato")).toEqual(new Set(["zinker", "phg", "ribeiro"]));
    expect(formats("casoteca")).toEqual(new Set(["microcaso", "caso-longo"]));
    expect(configurations["atelie-do-experimento"].items[0].alternatives.map(item => item.id).sort()).toEqual(["desafio", "suporte"]);
  });

  it("organiza as cartas em baralhos existentes, com relações válidas", () => {
    const cards = configurations["cartas-gestalticas"].items;
    const ids = new Set(cards.map(item => item.id));
    const decks = new Set<string>(DECKS.map(deck => deck.id));
    for (const card of cards) {
      expect(decks.has(card.deck)).toBe(true);
      expect(card.relatedConcepts.filter(id => !ids.has(id))).toEqual([]);
    }
    for (const deck of DECKS) expect(cards.filter(card => card.deck === deck.id).length).toBeGreaterThan(0);
  });
});
