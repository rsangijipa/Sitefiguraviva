# Figura Viva Application Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Figura Viva production-ready, reorganize the public experience into focused pages, preserve the Awareness Tree as an isolated route, and meet the approved UX, accessibility, test, and performance criteria.

**Architecture:** Stabilize the repository before moving product code. Domain pages will compose feature-owned components while shared primitives remain under `src/components`; the Awareness Tree becomes a lazy-loaded feature with one public route and no nested Next.js project. The homepage becomes a server-led six-section composition with small client islands.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Jest/Testing Library, Playwright, Firebase/Supabase, Framer Motion, Three.js/React Three Fiber, Sentry.

**Spec:** `docs/superpowers/specs/2026-09-05-application-modernization-design.md`

## Global Constraints

- Preserve the existing dark botanical visual identity, serif-led typography, restrained gold accents, and institutional voice.
- Keep protected-route authorization on the server.
- Keep existing public URLs working through direct routes or redirects.
- Meet WCAG 2.2 AA interaction requirements and a minimum 44 x 44 px target for primary controls.
- Keep high-detail SVG and 3D code out of the homepage client bundle.
- Do not change course pricing, billing rules, formation content, or institutional positioning.
- Use tests first for every behavioral change and run the scoped test before each commit.

---

### Task 1: Restore deterministic tooling and production builds

**Files:**
- Modify: `next.config.mjs`
- Modify: `tsconfig.json`
- Modify: `jest.config.js`
- Modify: `playwright.config.ts`
- Modify: `package.json`
- Modify: `README.md`
- Create: `tests/config/tooling-config.test.ts`

**Interfaces:**
- Consumes: repository root, `NEXT_DIST_DIR`, and optional `BASE_URL` environment values.
- Produces: deterministic build/typecheck/test discovery and a non-interactive Playwright HTML reporter.

- [ ] **Step 1: Add a failing tooling configuration test**

Create `tests/config/tooling-config.test.ts` that reads the four configuration files and asserts:

```ts
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (name: string) => fs.readFileSync(path.join(root, name), "utf8");

describe("repository tooling boundaries", () => {
  it("pins Next output tracing to this repository", () => {
    expect(read("next.config.mjs")).toContain("outputFileTracingRoot");
    expect(read("next.config.mjs")).toContain("@sentry/nextjs/config");
  });

  it("excludes nested packages and worktrees from root checks", () => {
    expect(read("tsconfig.json")).toContain('".worktrees"');
    expect(read("jest.config.js")).toContain("<rootDir>/.worktrees/");
    expect(read("jest.config.js")).toContain("<rootDir>/src/components/arvoredasemocoes/");
  });

  it("keeps the Playwright report non-interactive", () => {
    expect(read("playwright.config.ts")).toContain('open: "never"');
  });
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `npm test -- tests/config/tooling-config.test.ts --runInBand`

Expected: FAIL because output tracing, worktree exclusions, and reporter options are absent.

- [ ] **Step 3: Pin repository boundaries**

Implement these exact configuration changes:

```js
// next.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: projectRoot,
  // retain existing images, headers, redirects, and package optimization
};
```

Add `.worktrees`, `.next-audit`, and `src/components/arvoredasemocoes` to the root TypeScript exclusions for this stabilization task. Add `<rootDir>/.worktrees/`, `<rootDir>/.next/`, `<rootDir>/.next-audit/`, and `<rootDir>/src/components/arvoredasemocoes/` to Jest ignores. Configure the local Playwright reporter as `[["html", { open: "never" }], ["list"]]`.

- [ ] **Step 4: Document deterministic commands**

Add these commands to `README.md`:

```powershell
$env:NEXT_DIST_DIR='.next-audit'; npm run build
npx playwright install chromium
$env:BASE_URL='http://localhost:3000'; npm run test:e2e -- --project=public
```

Clarify that `npm test` does not discover worktrees or Playwright specs.

- [ ] **Step 5: Verify the tooling foundation**

Run:

```powershell
npm test -- tests/config/tooling-config.test.ts --runInBand
npm run typecheck
npm test -- --runInBand
$env:NEXT_DIST_DIR='.next-audit'; npm run build
```

Expected: configuration test, typecheck, Jest, and production build exit 0. If root typecheck still reports only the embedded Awareness Tree, confirm its exclusion path before proceeding.

- [ ] **Step 6: Commit**

```powershell
git add next.config.mjs tsconfig.json jest.config.js playwright.config.ts package.json README.md tests/config/tooling-config.test.ts
git commit -m "fix: stabilize build and test boundaries"
```

### Task 2: Integrate the Awareness Tree as an isolated feature

**Files:**
- Create: `src/features/awareness-tree/**`
- Create: `src/app/recursos/arvore-da-awareness/page.tsx`
- Create: `src/app/recursos/arvore-da-awareness/loading.tsx`
- Create: `src/app/recursos/arvore-da-awareness/error.tsx`
- Create: `src/features/awareness-tree/__tests__/fallback.test.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Remove after migration: `src/components/arvoredasemocoes/**`

**Interfaces:**
- Consumes: `QualityProfile`, quote/theme data, Firebase client helpers, reduced-motion preference, and browser WebGL support.
- Produces: `AwarenessTreeExperience`, `AwarenessTreeFallback`, and `/recursos/arvore-da-awareness`.

- [ ] **Step 1: Write a failing fallback test**

Create a test that mocks WebGL as unavailable and renders the feature entry:

```tsx
import { render, screen } from "@testing-library/react";
import { AwarenessTreeExperience } from "../components/AwarenessTreeExperience";

it("offers the emotional themes when WebGL is unavailable", async () => {
  render(<AwarenessTreeExperience supportsWebGL={false} />);
  expect(screen.getByRole("heading", { name: /árvore da awareness/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /acolhimento/i })).toBeVisible();
  expect(screen.getByText(/experiência visual indisponível/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/features/awareness-tree/__tests__/fallback.test.tsx --runInBand`

Expected: FAIL because the feature entry does not exist.

- [ ] **Step 3: Move production modules into the feature boundary**

Move `components`, `data`, `hooks`, `lib`, `store`, and `types` from the embedded project to `src/features/awareness-tree`. Rewrite `@/` imports that refer to the embedded package as `@/features/awareness-tree/...`. Reuse the root Firebase client through a small adapter owned by the feature. Do not migrate the embedded `app`, `package.json`, lockfile, Next config, PostCSS config, or TypeScript config.

- [ ] **Step 4: Install and align root dependencies**

Add root dependencies used by the migrated feature:

```powershell
npm install @react-three/fiber @react-three/drei three-stdlib howler zustand
npm install --save-dev @types/howler
```

Keep React and Three.js at the root versions already declared; resolve peer constraints before accepting the lockfile.

- [ ] **Step 5: Implement the resilient entry component**

Expose:

```ts
export interface AwarenessTreeExperienceProps {
  supportsWebGL?: boolean;
}

export function AwarenessTreeExperience(
  props: AwarenessTreeExperienceProps,
): React.ReactElement;
```

Detect WebGL only when the prop is absent. Render a dynamic 3D scene when available and a semantic theme/quote fallback when unavailable. Use `ssr: false` only for the scene island, not the entire route. Audio controls must begin paused and media elements use `preload="metadata"`.

- [ ] **Step 6: Add route-level loading and recovery**

The route page renders an institutional heading, a back link to `/recursos`, and the experience. `loading.tsx` presents a static tree-shaped skeleton. `error.tsx` is a client boundary with a retry button and a link back to `/recursos`.

- [ ] **Step 7: Remove the embedded package and restore TypeScript scope**

Remove `src/components/arvoredasemocoes` after every imported production module has a feature-owned equivalent. Remove its temporary exclusion from `tsconfig.json`.

- [ ] **Step 8: Verify the feature**

Run:

```powershell
npm test -- src/features/awareness-tree/__tests__/fallback.test.tsx --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0 and no import points to `src/components/arvoredasemocoes`.

- [ ] **Step 9: Commit**

```powershell
git add package.json package-lock.json tsconfig.json src/features/awareness-tree src/app/recursos/arvore-da-awareness
git add -u src/components/arvoredasemocoes
git commit -m "feat: integrate awareness tree as isolated feature"
```

### Task 3: Add resilient gallery media

**Files:**
- Create: `src/features/public-site/gallery/gallery-media.ts`
- Create: `src/features/public-site/gallery/GalleryImage.tsx`
- Create: `src/features/public-site/gallery/__tests__/GalleryImage.test.tsx`
- Modify: `src/app/public-gallery/GalleryClient.tsx`
- Modify: `src/app/public-gallery/page.tsx`

**Interfaces:**
- Produces: `normalizeGalleryMedia(photo): GalleryMedia` and `GalleryImage` with stable aspect ratio and branded fallback.
- Consumes: gallery documents with `src`, `url`, `title`, and optional `width`/`height`.

- [ ] **Step 1: Write failing media tests**

Cover URL selection and runtime failure:

```tsx
it("uses the valid src before the fallback", () => {
  expect(normalizeGalleryMedia({ src: "https://example.com/a.jpg", title: "A" }).src)
    .toBe("https://example.com/a.jpg");
});

it("replaces a failed image with a named placeholder", () => {
  render(<GalleryImage src="https://example.com/missing.jpg" alt="Encontro" />);
  fireEvent.error(screen.getByRole("img", { name: "Encontro" }));
  expect(screen.getByRole("status")).toHaveTextContent("Imagem indisponível: Encontro");
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/features/public-site/gallery/__tests__/GalleryImage.test.tsx --runInBand`

Expected: FAIL because the media boundary is absent.

- [ ] **Step 3: Implement normalization and fallback**

`normalizeGalleryMedia` accepts only `http:`, `https:`, or root-relative sources. It returns `/assets/fv/placeholders/gallery.webp` for missing/invalid URLs. `GalleryImage` owns error state, uses a fixed aspect-ratio wrapper, and replaces the failed image with a branded icon and title. It must not recursively retry the failed source.

- [ ] **Step 4: Adopt the boundary in cards and lightbox**

Replace both raw `<img>` elements in `GalleryClient.tsx`. Add `aria-label="Buscar momentos"`, Portuguese lightbox button names, `role="dialog"`, `aria-modal="true"`, Escape handling, and focus return to the opened card.

- [ ] **Step 5: Verify gallery behavior**

Run:

```powershell
npm test -- src/features/public-site/gallery/__tests__/GalleryImage.test.tsx --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```powershell
git add src/features/public-site/gallery src/app/public-gallery
git commit -m "fix: make public gallery media resilient"
```

### Task 4: Repair authentication context and admin routing

**Files:**
- Create: `src/features/auth/auth-intent.ts`
- Create: `src/features/auth/__tests__/auth-intent.test.ts`
- Modify: `src/app/auth/page.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `README.md`
- Modify: `.env.example`

**Interfaces:**
- Produces: `getAuthIntent(searchParams): "student" | "admin"`, `getSafeNextPath(next, role)`, and contextual auth copy.
- Consumes: `mode`, `next`, authenticated role, and optional demo credential environment variables.

- [ ] **Step 1: Write failing routing tests**

```ts
expect(getAuthIntent(new URLSearchParams("next=%2Fadmin"))).toBe("admin");
expect(getSafeNextPath("//evil.example", "student")).toBe("/portal");
expect(getSafeNextPath("/admin", "student")).toBe("/portal");
expect(getSafeNextPath("/admin", "admin")).toBe("/admin");
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/features/auth/__tests__/auth-intent.test.ts --runInBand`

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement safe role-aware intent**

Move next-path validation from the page into the pure helpers. On admin intent, render “Acesso administrativo” and admin-specific supporting copy. Replace the circular ADMIN link with a button/link to `/auth?next=%2Fadmin` that updates the current context without leaving the auth page.

- [ ] **Step 4: Correct demo documentation**

Replace username-only demo instructions with environment-driven examples:

```dotenv
DEMO_ADMIN_EMAIL=admin@figuraviva.local
DEMO_ADMIN_PASSWORD=change-me-locally
```

Do not hard-code a usable production password. README must say that demo credentials are optional local seed values and must match the seeded auth account.

- [ ] **Step 5: Verify authentication logic**

Run:

```powershell
npm test -- src/features/auth/__tests__/auth-intent.test.ts --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```powershell
git add src/features/auth src/app/auth/page.tsx src/components/Navbar.tsx README.md .env.example
git commit -m "fix: clarify role-aware authentication"
```

### Task 5: Create domain pages and shorten the homepage

**Files:**
- Create: `src/features/public-site/components/PublicPageHero.tsx`
- Create: `src/features/public-site/components/ConsultationCta.tsx`
- Create: `src/features/public-site/content/navigation.ts`
- Create: `src/app/instituto/page.tsx`
- Create: `src/app/instituto/fundadora/page.tsx`
- Create: `src/app/instituto/manifesto/page.tsx`
- Create: `src/app/formacoes/page.tsx`
- Create: `src/app/recursos/page.tsx`
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/HomeClient.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Create: `src/features/public-site/__tests__/navigation.test.ts`
- Create: `src/features/public-site/__tests__/homepage-structure.test.tsx`

**Interfaces:**
- Produces: canonical `PUBLIC_NAV_ITEMS`, focused domain routes, and a six-section homepage.
- Consumes: existing server-fetched courses, posts, gallery, founder, institute, team, and SEO records.

- [ ] **Step 1: Write failing navigation and homepage structure tests**

Assert that every primary navigation destination is a canonical page and that the homepage renders no more than three formation cards and three content cards. Assert that the homepage does not render the full manifesto, full founder biography, Instagram embed, interactive resources, or full gallery.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
npm test -- src/features/public-site/__tests__/navigation.test.ts src/features/public-site/__tests__/homepage-structure.test.tsx --runInBand
```

Expected: FAIL because canonical navigation and the focused homepage do not exist.

- [ ] **Step 3: Create shared public-page components and navigation data**

`PUBLIC_NAV_ITEMS` exposes Instituto, Formações, Recursos, Biblioteca, Galeria, and Blog. Both desktop and mobile navigation consume the same array. `PublicPageHero` accepts eyebrow, title, description, and optional actions. `ConsultationCta` owns the canonical WhatsApp URL and institutional CTA copy.

- [ ] **Step 4: Build focused institutional routes**

Compose existing content into the new routes. Each route has one `h1`, its own metadata title without the site suffix, and breadcrumbs/back navigation. The founder route contains the full Lattes link; the manifesto route contains the full manifesto; the institute route contains values, team summary, location, and links to both detail pages.

- [ ] **Step 5: Build formations and resources routes**

`/formacoes` owns the full course listing and calendar affordance. `/recursos` owns the four care-tool cards and links the Awareness Tree card to `/recursos/arvore-da-awareness`. Existing resource modals may remain only when their control is owned by the resources page.

- [ ] **Step 6: Replace the homepage composition**

Keep only hero, capped featured formations, three methodology differentiators, compact testimonials, capped latest content, and final CTA. Remove full institute, founder, memory, resources, FAQ, Instagram, gallery, and all always-mounted modals from `HomeClient`. Replace the high-detail `RainbowTree` with the optimized hero asset introduced in Task 7; until Task 7, use the existing responsive hero background image without the SVG component.

- [ ] **Step 7: Preserve legacy entry points**

Keep hidden compatibility anchors for `#instituto`, `#instituto-sobre`, `#fundadora`, `#cursos`, `#recursos-interativos`, and `#blog` close to links that route to canonical pages. Update all visible navigation and footer links to canonical routes.

- [ ] **Step 8: Verify public architecture**

Run:

```powershell
npm test -- src/features/public-site/__tests__/navigation.test.ts src/features/public-site/__tests__/homepage-structure.test.tsx --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit**

```powershell
git add src/features/public-site src/app/instituto src/app/formacoes src/app/recursos src/app/blog src/app/page.tsx src/components/HomeClient.tsx src/components/Navbar.tsx src/components/Footer.tsx
git commit -m "feat: reorganize public information architecture"
```

### Task 6: Coordinate consent and floating controls

**Files:**
- Modify: `src/lib/consent.ts`
- Modify: `src/components/system/CookieConsent.tsx`
- Modify: `src/components/ui/FloatingControls.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/system/__tests__/CookieConsent.test.tsx`

**Interfaces:**
- Produces: `data-cookie-consent="pending|resolved"` on the document root and a compact consent surface.
- Consumes: existing `useCookieConsent()` state and actions.

- [ ] **Step 1: Write failing consent coordination tests**

Test that unresolved consent sets `data-cookie-consent="pending"`, renders reject and accept buttons, and hides elements marked `data-secondary-floating-control`. Test that either action sets `resolved` and removes the dialog.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/components/system/__tests__/CookieConsent.test.tsx --runInBand`

Expected: FAIL because document state and floating-control coordination are absent.

- [ ] **Step 3: Implement compact responsive consent**

Use a bottom sheet with `max-h-[min(44vh,360px)]` on small screens and the current horizontal layout from `sm` upward. Keep 44 px buttons, reduce mobile copy to two sentences plus the privacy link, and retain the full explanation through `aria-describedby` and the privacy page.

- [ ] **Step 4: Coordinate global floating controls**

Mark secondary controls with `data-secondary-floating-control`. Add CSS that hides them while the document consent state is pending. Keep one WhatsApp control only if its measured bottom offset clears the consent sheet; otherwise hide it until resolution.

- [ ] **Step 5: Verify consent behavior**

Run:

```powershell
npm test -- src/components/system/__tests__/CookieConsent.test.tsx --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/consent.ts src/components/system/CookieConsent.tsx src/components/system/__tests__/CookieConsent.test.tsx src/components/ui/FloatingControls.tsx src/app/globals.css
git commit -m "fix: coordinate cookie consent and floating controls"
```

### Task 7: Optimize public assets and interaction islands

**Files:**
- Create: `public/assets/fv/hero-tree-lite.svg`
- Create: `public/assets/fv/placeholders/gallery.webp`
- Create: `scripts/check-public-budgets.mjs`
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/HomeClient.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Create: `tests/performance/public-budgets.test.ts`

**Interfaces:**
- Produces: `npm run audit:public-assets` and a homepage without high-detail tree code in its module graph.
- Consumes: built `.next-audit` manifests and public asset sizes.

- [ ] **Step 1: Write a failing asset-budget test**

Assert that the lite tree asset is below 80 KB, the gallery placeholder is below 100 KB, no homepage file imports `RainbowTree`, and audio elements referenced by public UI use metadata/none preload.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/performance/public-budgets.test.ts --runInBand`

Expected: FAIL because the lite assets and homepage boundary do not exist.

- [ ] **Step 3: Produce lightweight assets**

Derive `hero-tree-lite.svg` from the existing artwork by flattening repeated definitions and removing animation-only nodes. Create a branded gallery WebP placeholder at the card aspect ratio. Confirm their byte sizes with `Get-Item`.

- [ ] **Step 4: Remove the high-detail tree from the homepage graph**

Render the lite tree through `next/image` or CSS background. Keep decorative artwork `aria-hidden`. Remove the `RainbowTree` import from `src/app/page.tsx`. Preserve the full tree only within the Awareness Tree feature.

- [ ] **Step 5: Reduce animation and hydration cost**

Remove continuous blur from small screens. Ensure reveal animations do not keep invisible content out of the first viewport. Convert non-interactive homepage sections to server components or static children; keep carousels, accordions, and form controls as separate client islands.

- [ ] **Step 6: Add the budget checker**

`scripts/check-public-budgets.mjs` reads `.next-audit` build manifests, reports homepage JS bytes, and exits non-zero above the spec budget. Add `audit:public-assets` to package scripts. The script prints the actual value and limit for every checked budget.

- [ ] **Step 7: Verify asset and bundle constraints**

Run:

```powershell
npm test -- tests/performance/public-budgets.test.ts --runInBand
$env:NEXT_DIST_DIR='.next-audit'; npm run build
npm run audit:public-assets
```

Expected: assets pass fixed byte limits, build exits 0, and the checker prints homepage bundle measurements.

- [ ] **Step 8: Commit**

```powershell
git add public/assets/fv scripts/check-public-budgets.mjs src/components/sections/HeroSection.tsx src/app/page.tsx src/components/HomeClient.tsx src/app/globals.css package.json tests/performance/public-budgets.test.ts
git commit -m "perf: reduce public homepage rendering cost"
```

### Task 8: Complete accessibility and content corrections

**Files:**
- Modify: `src/app/public-library/LibraryClient.tsx`
- Modify: `src/app/public-gallery/GalleryClient.tsx`
- Modify: `src/components/sections/CoursesSection.tsx`
- Modify: `src/components/ResourcesSection.jsx`
- Modify: `src/components/sections/BlogSection.tsx`
- Modify: public content records or fixtures containing joined words/stale dates
- Modify: route metadata files under `src/app/**/page.tsx`
- Create: `tests/accessibility/public-contracts.test.tsx`

**Interfaces:**
- Produces: Portuguese accessible labels, consistent metadata, corrected public copy, and minimum target sizes.
- Consumes: canonical page components from Task 5 and gallery boundary from Task 3.

- [ ] **Step 1: Write failing accessibility contract tests**

Assert named search inputs, Portuguese carousel names, one `h1` per tested route component, explicit dialog labels, and no duplicated site suffix in exported metadata titles.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/accessibility/public-contracts.test.tsx --runInBand`

Expected: FAIL for unnamed searches, English carousel labels, or repeated title suffixes.

- [ ] **Step 3: Apply interaction fixes**

Add visible or screen-reader labels to search controls. Rename carousel controls to “Anterior” and “Próximo” with context such as “Formação anterior”. Apply `min-h-11 min-w-11` to icon and compact text controls. Add visible `focus-visible` rings matching the primary palette.

- [ ] **Step 4: Normalize public copy and metadata**

Correct joined Portuguese words in article titles/excerpts, remove stale “INÍCIO ABR/24”, standardize “Gestalt-terapia”, and ensure route pages pass only the unique title portion to the root metadata template.

- [ ] **Step 5: Verify accessibility contracts**

Run:

```powershell
npm test -- tests/accessibility/public-contracts.test.tsx --runInBand
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```powershell
git add src/app/public-library src/app/public-gallery src/components/sections src/components/ResourcesSection.jsx tests/accessibility
git commit -m "fix: improve public accessibility and content quality"
```

### Task 9: Add public desktop/mobile smoke coverage

**Files:**
- Modify: `e2e/smoke.spec.ts`
- Modify: `playwright.config.ts`
- Create: `e2e/public-visual-contracts.spec.ts`

**Interfaces:**
- Produces: executable Chromium desktop and mobile public-route coverage.
- Consumes: canonical routes from Task 5 and browser installation documented in Task 1.

- [ ] **Step 1: Write the smoke scenarios**

Cover `/`, `/instituto`, `/instituto/fundadora`, `/instituto/manifesto`, `/formacoes`, `/recursos`, `/recursos/arvore-da-awareness`, `/blog`, `/public-library`, `/public-gallery`, and `/auth`. For desktop 1280 x 720 and mobile 390 x 844, assert one visible `h1`, no horizontal document overflow, no native broken images, no console errors, and 2xx navigation.

- [ ] **Step 2: Run the new scenarios and verify RED**

Run:

```powershell
$env:BASE_URL='http://localhost:3000'; npx playwright test e2e/public-visual-contracts.spec.ts --project=public
```

Expected: at least one scenario fails until every canonical route and UI contract is present. If Chromium is missing, install it with the documented command and rerun before changing assertions.

- [ ] **Step 3: Add explicit desktop and mobile public projects**

Use `Desktop Chrome` for `public-desktop` and `iPhone 13` with a 390 x 844 viewport for `public-mobile`. Both use the same public visual contract spec and HTML reporter with `open: "never"`.

- [ ] **Step 4: Correct issues exposed by the scenarios**

Fix the production component responsible for every failing assertion. Keep route expectations unchanged unless the approved specification changed.

- [ ] **Step 5: Verify public smoke coverage**

Run:

```powershell
$env:BASE_URL='http://localhost:3000'; npx playwright test e2e/smoke.spec.ts e2e/public-visual-contracts.spec.ts --project=public-desktop --project=public-mobile
```

Expected: both projects exit 0 with no retained failure screenshots or videos.

- [ ] **Step 6: Commit**

```powershell
git add e2e/smoke.spec.ts e2e/public-visual-contracts.spec.ts playwright.config.ts
git commit -m "test: cover public desktop and mobile journeys"
```

### Task 10: Run the release verification matrix

**Files:**
- Create: `docs/reports/2026-09-05-modernization-verification.md`
- Modify only when a verification failure exposes a defect: the smallest responsible production/test file.

**Interfaces:**
- Produces: reproducible release evidence for the approved acceptance criteria.
- Consumes: all deliverables from Tasks 1–9.

- [ ] **Step 1: Run static verification**

```powershell
npm run lint
npm run typecheck
npm test -- --runInBand
```

Record exit codes, suite count, test count, and elapsed time.

- [ ] **Step 2: Run the isolated production build and budget check**

```powershell
$env:NEXT_DIST_DIR='.next-audit'; npm run build
npm run audit:public-assets
```

Record route status, homepage bundle bytes, and any documented budget exception.

- [ ] **Step 3: Run browser verification**

```powershell
$env:BASE_URL='http://localhost:3000'; npm run test:e2e -- --project=public-desktop --project=public-mobile
```

Record passing route/view combinations and confirm the process terminates without serving the report.

- [ ] **Step 4: Perform final interactive review**

Inspect homepage, auth, formations, institutional pages, library, gallery, resources, and Awareness Tree at 1280 x 720 and 390 x 844. Confirm primary CTAs are visible, consent does not obscure required actions, keyboard focus is visible, gallery failures use branded fallback, and the tree offers its non-WebGL fallback.

- [ ] **Step 5: Write the verification report**

The report contains: commit range, environment, exact commands, outcomes, measured budgets, screenshots/artifact paths, acceptance checklist, and environment-dependent limitations. Every failed acceptance criterion remains explicitly open.

- [ ] **Step 6: Request code review and resolve findings**

Dispatch a reviewer against the modernization commit range and this plan. Correct every Critical and Important finding, rerun the relevant scoped tests, and append the review outcome to the report.

- [ ] **Step 7: Commit release evidence**

```powershell
git add docs/reports/2026-09-05-modernization-verification.md
git commit -m "docs: record modernization verification"
```

## Completion gate

Before reporting completion, rerun the entire Task 10 matrix from a clean process state. Completion requires zero lint errors, zero TypeScript errors, zero intended Jest failures, a successful isolated production build, passing public desktop/mobile smoke tests, and a written result for every acceptance criterion in the specification.
