import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resourceCatalog } from "../resourceCatalog";

const root = process.cwd();
const readSource = (path: string) => readFileSync(join(root, path), "utf8");

describe("Rio dos Pensamentos integration", () => {
  const resource = resourceCatalog.find(
    (item) => item.slug === "rio-dos-pensamentos",
  );

  it("publishes the specified card without duplicating the catalog entry", () => {
    expect(
      resourceCatalog.filter((item) => item.slug === "rio-dos-pensamentos"),
    ).toHaveLength(1);
    expect(resource).toMatchObject({
      title: "Rio dos Pensamentos",
      description: "Observe pensamentos passando, sem precisar afastá-los.",
      category: "REGULAR",
      duration: "2–5 min",
      status: "available",
      privacy: "private",
      persistence: "optional",
    });
    expect(resource?.sections?.map((section) => section.id)).toEqual([
      "experience",
      "history",
    ]);
  });

  it("loads the canvas experience only through the client-side resource boundary", () => {
    const source = readSource("src/components/ResourcesSection.jsx");

    expect(source).toContain('"rio-dos-pensamentos": lazy(');
    expect(source).toContain(
      "@/features/interactive-resources/thought-river/ThoughtRiverExperience",
    );
  });

  it("provides portal and saved-history routes through the typed experience surface", () => {
    const page = readSource(
      "src/app/portal/recursos/rio-dos-pensamentos/page.tsx",
    );
    const historyPage = readSource(
      "src/app/portal/recursos/rio-dos-pensamentos/historico/page.tsx",
    );

    expect(page).toContain("<ThoughtRiverExperience />");
    expect(historyPage).toContain(
      '<ThoughtRiverExperience initialView="history" />',
    );
  });
});
