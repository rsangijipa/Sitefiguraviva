import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const readSource = (path: string) => readFileSync(join(root, path), "utf8");

describe("universal resource shell boundary", () => {
  it("keeps operational navigation out of resource content roots", () => {
    const contentRoots = [
      "src/components/resources/apps/ciclodocontato/App.tsx",
      "src/components/resources/apps/fronteiras-de-contato/App.tsx",
      "src/components/resources/apps/cartas-gestalticas/App.tsx",
      "src/components/resources/apps/emotion-tree/EmotionTreeApp.tsx",
      "src/components/resources/apps/banco-de-microcasos/pages/PlayerView.tsx",
      "src/components/resources/apps/banco-de-microcasos/pages/ClosureView.tsx",
      "src/components/resources/apps/banco-de-microcasos/pages/HistoryView.tsx",
    ];

    for (const path of contentRoots) {
      const source = readSource(path);
      expect(source).not.toMatch(/components\/(Header|TopHeader)/);
      expect(source).not.toMatch(/<Header\b|<TopHeader\b/);
    }
  });

  it("uses ResourceExperience as the only catalog shell", () => {
    const source = readSource("src/components/ResourcesSection.jsx");

    expect(source).toContain('from "./resources/ResourceExperience"');
    expect(source).not.toContain("ResourceModalShell");
  });

  it("does not let resource content navigate back to the catalog", () => {
    const home = readSource(
      "src/components/resources/apps/banco-de-microcasos/pages/HomeView.tsx",
    );

    expect(home).not.toMatch(/onClose|Recursos · Aprender/);
  });
});
