import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resourceCatalog } from "../resourceCatalog";

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

  it("keeps resources in preparation informational rather than actionable", () => {
    const source = readSource("src/components/ResourcesSection.jsx");

    expect(resourceCatalog.some((item) => item.status === "coming-soon")).toBe(
      true,
    );
    expect(source).toContain("if (!available)");
    expect(source).toContain("Em preparação.");
  });

  it("opens only available resources on refresh and returns to the catalog", () => {
    const page = readSource("src/app/recursos/[slug]/page.tsx");
    const section = readSource("src/components/ResourcesSection.jsx");

    expect(page).toContain('resource.status !== "available"');
    expect(page).toContain("initialActiveSlug={resource.slug}");
    expect(section).toContain('router.push("/recursos")');
  });
});
