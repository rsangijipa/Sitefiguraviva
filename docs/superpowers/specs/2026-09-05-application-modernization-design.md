# Application Modernization Design

## Objective

Prepare Figura Viva for reliable production use while preserving its visual identity. The modernization covers the public information architecture, shared UI, accessibility, authentication entry points, the student/admin shells, the Awareness Tree, build configuration, automated tests, and runtime performance.

## Product principles

- Preserve the current dark botanical identity, serif-led typography, restrained gold accents, and warm institutional tone.
- Make the public homepage a concise conversion surface rather than an exhaustive institutional archive.
- Give every substantial subject a stable, linkable page.
- Keep the Awareness Tree as a first-class route, isolated from the main application bundle.
- Prefer progressive loading and server-rendered content over large client-side composition roots.
- Treat WCAG 2.2 AA, 44 x 44 px touch targets, reduced motion, keyboard navigation, and resilient media as acceptance criteria.

## Information architecture

The public navigation will expose these destinations:

- `/`: value proposition, featured formations, core differentiators, social proof, latest content, and final consultation CTA.
- `/instituto`: institutional story, values, location, and team summary.
- `/instituto/fundadora`: full founder biography and external academic profile.
- `/instituto/manifesto`: manifesto and ethical-political positioning.
- `/instituto/laura-perls`: existing memory archive.
- `/formacoes`: complete formation catalog and calendar entry point.
- `/recursos`: interactive care tools directory.
- `/recursos/arvore-da-awareness`: isolated Awareness Tree experience.
- `/blog`: public article listing.
- `/public-library`: curated library.
- `/public-gallery`: institutional gallery.
- `/auth`: shared authentication entry for students and administrators.

Legacy homepage anchors remain temporarily available and redirect or link to the corresponding pages. Existing external WhatsApp, Lattes, Instagram, maps, email, and course links remain available.

## Homepage

The homepage contains six sections in this order:

1. Hero with one primary consultation CTA and one formations CTA.
2. Featured formations, capped at three items.
3. Three institutional differentiators.
4. Short social-proof section.
5. Latest library/blog content, capped at three items.
6. Final consultation CTA and footer.

The hero keeps the botanical artwork but uses a reduced-complexity representation on the initial route. The full interactive or high-detail tree belongs only to the Awareness Tree route. Primary copy and CTA must be visible in a 1280 x 720 viewport and in a 390 x 844 viewport without being obscured by consent or floating controls.

## Directory architecture

Application code will be organized by product domain without a full rewrite:

```text
src/
  app/                         # route composition only
  components/
    ui/                        # reusable primitives
    layout/                    # shared navigation and shells
    system/                    # consent, telemetry, global feedback
  features/
    public-site/
      components/
      content/
    auth/
      components/
    portal/
      components/
    admin/
      components/
    awareness-tree/
      components/
      data/
      hooks/
      lib/
      store/
      types/
```

Routes import domain components from `features`. Cross-domain primitives stay in `components`. Server actions and service/repository layers remain in their existing top-level folders unless moving them is necessary to repair an import boundary. The embedded standalone project currently under `src/components/arvoredasemocoes` is removed after its production code is migrated; its nested `package.json`, lockfile, app router, config, and duplicate Firebase setup do not remain in the main TypeScript program.

## Awareness Tree

The tree remains available and is integrated as a lazy-loaded feature at `/recursos/arvore-da-awareness`.

- Internal aliases resolve from `src/features/awareness-tree` or use explicit relative imports within the feature.
- Required runtime dependencies are installed at the application root and version-aligned with React 19 and Three.js.
- The route loads the 3D runtime only after navigation to the feature.
- A lightweight loading state and a recoverable error state are present.
- Reduced-motion preferences disable decorative motion.
- A low-quality mode is selected for constrained devices and can be changed by the user.
- Audio is opt-in and media files use preload metadata rather than eager download.
- The page remains usable when WebGL is unavailable by showing the theme/quote controls in a non-3D fallback.

## Public media resilience

Gallery items pass through a single media-normalization boundary.

- Remote URLs are validated and normalized before rendering.
- A failed image renders a branded placeholder with its title, not the browser broken-image indicator.
- Image cards retain their dimensions while loading or failing.
- Local fallback assets are used only when a record has no valid media URL.
- Tests cover successful load, failed load, missing URL, filtering, and modal navigation.

## Authentication and role routing

`/auth` remains the canonical login page. It receives an optional safe `next` path and adjusts supporting copy when the destination is administrative.

- Email fields accept email credentials only.
- Demo documentation uses a syntactically valid email address; no username-only credential is advertised.
- Successful authentication resolves the account role and sends the user to the safe requested destination or the role default.
- The ADMIN link changes the auth context instead of linking into a redirect loop.
- Invalid credentials, unavailable providers, and configuration failures use clear inline feedback.
- Student and admin protected routes continue to enforce authorization on the server.

## Consent and floating controls

Cookie consent uses a compact bottom sheet on small screens and a horizontal panel on larger screens. It never overlaps the main CTA, search controls, or form submission controls.

While consent is unresolved:

- secondary floating controls are hidden or moved above the consent surface;
- the WhatsApp affordance remains available only when it does not obscure either consent action;
- both actions meet the 44 x 44 px target requirement;
- focus order follows explanatory text, privacy link, reject, and accept.

## Accessibility and content quality

- Every search field has a visible label or accessible name.
- Carousel controls use Portuguese accessible names and 44 x 44 px targets.
- Icon-only controls have explicit names and visible focus indicators.
- Heading levels describe page structure without duplicate visual/semantic headings.
- Broken or unavailable media is announced accurately.
- Public copy is normalized to remove joined words, stale dates, and inconsistent terminology.
- Metadata uses a single title template so pages do not repeat “Instituto Figura Viva”.
- Color contrast is validated for body text, small labels, interactive states, and focus indicators.

## Performance architecture

- The homepage server-renders static content and limits client components to interactive islands.
- Homepage modals are loaded only after the triggering interaction or moved to canonical detail routes.
- High-detail SVG/3D code is absent from the homepage client bundle.
- Below-the-fold sections use code splitting where interaction requires client JavaScript.
- Images use responsive sizes, modern formats where available, stable aspect ratios, and meaningful loading priority.
- Audio is never fetched eagerly.
- Continuous blur animations are removed on mobile and reduced for desktop.
- Production verification records route bundle sizes and Lighthouse/Web Vitals once the build is healthy.

Target budgets for the public homepage on a production build:

- DOM elements after hydration: at most 1,500.
- Initial HTML transfer, compressed: at most 200 KB.
- Initial JavaScript transfer, compressed: at most 250 KB.
- Largest Contentful Paint on a mid-tier mobile profile: at most 2.5 seconds.
- Cumulative Layout Shift: at most 0.1.
- Interaction to Next Paint: at most 200 ms where the audit environment supports it.

## Build and test health

- `next.config.mjs` declares the repository root for output tracing and keeps audit builds isolated through `NEXT_DIST_DIR`.
- The Sentry configuration uses the supported import path and production options are reviewed for unnecessary bundle expansion.
- The root TypeScript program contains only application source intended for compilation.
- Jest ignores `.worktrees`, build artifacts, Playwright suites, and other embedded package boundaries.
- Playwright reuses an explicit `BASE_URL`, provides public desktop/mobile smoke coverage, and documents browser installation.
- Test commands terminate after reporting results and do not leave the HTML reporter server running.

## Delivery sequence

1. Restore deterministic build, typecheck, Jest discovery, and Playwright configuration.
2. Migrate and isolate the Awareness Tree.
3. Add media resilience and repair gallery sources.
4. Repair authentication context, redirects, and demo documentation.
5. Create the public page architecture and shorten the homepage.
6. Refine consent, floating controls, responsive layout, and accessibility.
7. Optimize assets and client/server boundaries.
8. Run the complete verification matrix and record remaining environment-dependent checks.

Each stage must leave its scoped tests green before the next stage begins.

## Acceptance criteria

The modernization is complete when all of the following are true:

- Production build exits successfully from the repository directory.
- TypeScript exits with zero errors.
- Jest runs only the intended unit/integration suites and exits with zero failures.
- Public Playwright smoke tests cover desktop and mobile and exit with zero failures.
- Homepage, auth, formations, institutional pages, library, gallery, resources, and Awareness Tree render without console errors.
- No gallery card displays a native broken-image indicator.
- Admin access does not enter a redirect loop and the documented demo credential matches the form contract.
- Homepage content and main CTAs remain unobscured at 390 x 844 and 1280 x 720.
- The homepage meets the defined DOM and transfer budgets, or a measured exception is documented with a follow-up owner.
- Navigation, forms, consent, dialogs, filters, and carousels are keyboard operable with visible focus.

## Non-goals

- Replacing the visual identity or introducing a new design system.
- Rewriting Firebase/Supabase business logic unrelated to the reviewed flows.
- Splitting the repository into separately deployed applications.
- Redesigning every protected admin form or every LMS lesson screen in this modernization pass.
- Changing course content, pricing, billing policy, or institutional positioning.
