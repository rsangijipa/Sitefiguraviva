import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

describe("public accessibility contracts", () => {
  it("names public search fields", () => {
    expect(read("src/app/public-library/LibraryClient.tsx")).toContain(
      'aria-label="Buscar na biblioteca"',
    );
    expect(read("src/app/public-gallery/GalleryClient.tsx")).toContain(
      'aria-label="Buscar momentos"',
    );
  });

  it("uses Portuguese carousel labels", () => {
    for (const relativePath of [
      "src/components/sections/CoursesSection.tsx",
      "src/components/sections/BlogSection.tsx",
      "src/components/ResourcesSection.jsx",
    ]) {
      const source = read(relativePath);
      expect(source).not.toContain('aria-label="Scroll Left"');
      expect(source).not.toContain('aria-label="Scroll Right"');
    }
  });

  it("does not nest a second main landmark in public route clients", () => {
    for (const relativePath of [
      "src/app/public-library/LibraryClient.tsx",
      "src/app/blog/[id]/BlogDetailClient.tsx",
      "src/app/curso/[id]/CourseDetailClient.tsx",
      "src/app/instituto/laura-perls/page.tsx",
    ]) {
      expect(read(relativePath)).not.toMatch(/<\/?main\b/);
    }
  });

  it("exposes one page heading in each public page hero", () => {
    for (const relativePath of [
      "src/components/sections/HeroSection.tsx",
      "src/features/public-site/components/PublicPageHero.tsx",
      "src/app/public-library/LibraryClient.tsx",
      "src/app/public-gallery/GalleryClient.tsx",
    ]) {
      expect(read(relativePath).match(/<h1\b/g) ?? []).toHaveLength(1);
    }
  });

  it("keeps route titles unique from the root title template", () => {
    for (const relativePath of [
      "src/app/public-library/page.tsx",
      "src/app/public-gallery/page.tsx",
      "src/app/blog/[id]/page.tsx",
    ]) {
      expect(read(relativePath)).not.toMatch(
        /title:\s*["'`][^"'`]*\| Instituto Figura Viva/,
      );
    }
  });

  it("uses native buttons for interactive resource cards", () => {
    const resources = read("src/components/ResourcesSection.jsx");
    expect(resources.match(/<motion\.button/g)).toHaveLength(4);
  });
});
