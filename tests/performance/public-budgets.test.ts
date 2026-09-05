import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

const root = process.cwd();
const file = (relativePath: string) => path.join(root, relativePath);
const read = (relativePath: string) =>
  fs.readFileSync(file(relativePath), "utf8");

describe("public performance budgets", () => {
  it("keeps lightweight fallback artwork inside fixed byte limits", () => {
    expect(
      fs.statSync(file("public/assets/fv/hero-tree-lite.svg")).size,
    ).toBeLessThan(80 * 1024);
    expect(
      fs.statSync(file("public/assets/fv/placeholders/gallery.webp")).size,
    ).toBeLessThan(100 * 1024);
  });

  it("keeps the detailed tree out of the homepage module graph", () => {
    expect(read("src/app/page.tsx")).not.toContain("RainbowTree");
    expect(read("src/components/HomeClient.tsx")).not.toContain("RainbowTree");
  });

  it("does not eagerly preload ambient audio", () => {
    expect(read("src/components/ui/FloatingControls.tsx")).toContain(
      'preload="metadata"',
    );
  });

  it("keeps private providers out of the global application shell", () => {
    const providers = read("src/app/providers.tsx");
    const rootLayout = read("src/app/layout.tsx");

    expect(providers).not.toContain("AuthProvider");
    expect(providers).not.toContain("GamificationProvider");
    expect(providers).not.toContain("AudioProvider");
    expect(rootLayout).not.toContain("PushNotificationManager");
    expect(rootLayout).not.toContain("FloatingAudioPlayer");
  });

  it("renders the homepage hero without a client data dependency", () => {
    const hero = read("src/components/sections/HeroSection.tsx");

    expect(hero).not.toContain('"use client"');
    expect(hero).not.toContain("useInstituteSettings");
    expect(hero).not.toContain("framer-motion");
  });

  it("keeps public chrome independent from remote settings bundles", () => {
    for (const relativePath of [
      "src/components/Footer.tsx",
      "src/components/ui/FloatingControls.tsx",
      "src/components/system/GoogleAnalytics.tsx",
    ]) {
      const source = read(relativePath);
      expect(source).not.toContain("useSiteSettings");
      expect(source).not.toContain("useInstituteSettings");
      expect(source).not.toContain("useConfigSettings");
    }
  });
});
