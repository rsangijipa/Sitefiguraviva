import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resourceCatalog, resourceAliases, resolveResourceSlug } from "../resourceCatalog";

const root = process.cwd();
const readSource = (path: string) => readFileSync(join(root, path), "utf8");

describe("public resource deep links", () => {
  it("gives every available catalog item a stable /recursos/[slug] URL", () => {
    const source = readSource("src/components/ResourcesSection.jsx");

    expect(resourceCatalog.some((item) => item.status === "available")).toBe(
      true,
    );
    expect(source).toContain("href={`/recursos/${resource.slug}`}");
  });

  it("publishes exactly twelve implemented resources and no retired entries", () => {
    expect(resourceCatalog).toHaveLength(12);
    expect(resourceCatalog.every(item => item.status === "available")).toBe(true);
    const slugs = resourceCatalog.map(item => item.slug);
    expect(new Set(slugs).size).toBe(12);
    for (const slug of ["quiz", "somascan", "duas-cadeiras", "polaridades", "fronteiras-de-contato", "caso-clinico"]) {
      expect(slugs).not.toContain(slug);
      expect(resourceAliases[slug]).toBeUndefined();
    }
  });

  it("consolidates shared URLs into existing experiences", () => {
    for (const [alias, target] of Object.entries(resourceAliases)) {
      expect(resourceCatalog.some(item => item.slug === alias)).toBe(false);
      expect(resourceCatalog.some(item => item.slug === target)).toBe(true);
    }
    expect(resourceAliases["intensidade-agora"]).toBe("body-map");
    expect(resourceAliases["check-in"]).toBe("diario-aqui-e-agora");
    expect(resourceAliases["jardim-de-pensamentos"]).toBe("rio-dos-pensamentos");
    expect(resourceCatalog.find(item => item.slug === "sala-de-pausa")?.sections?.map(item => item.id)).toEqual(["pause", "breathing", "grounding", "sounds"]);
  });

  it("does not treat inherited object properties as aliases", () => {
    for (const slug of ["constructor", "toString", "__proto__", "unknown-resource"]) {
      expect(resolveResourceSlug(slug)).toBe(slug);
    }
  });

  it("opens only available resources on refresh and returns to the catalog", () => {
    const page = readSource("src/app/recursos/[slug]/page.tsx");
    const section = readSource("src/components/ResourcesSection.jsx");

    expect(page).toContain('resource.status !== "available"');
    expect(page).toContain("initialActiveSlug={resource.slug}");
    expect(section).toContain('router.push("/recursos")');
  });
});
