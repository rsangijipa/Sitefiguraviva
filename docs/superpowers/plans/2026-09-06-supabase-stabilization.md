# Supabase Stabilization and Codebase Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Organize the application by domain, remove unused Firebase code, and leave a stable Supabase-only beta.

**Architecture:** Keep Next.js routes in `src/app`, move domain interfaces and implementations into `src/modules`, and isolate Supabase adapters in `src/infrastructure`. Migrate one domain at a time, preserving route contracts and deleting legacy files only after import and test scans are clean.

**Tech Stack:** Next.js, TypeScript, Supabase Auth, Supabase Postgres/RPC, Supabase Storage, Jest, Playwright.

**Spec:** User-provided Supabase migration and stabilization specification in the preceding conversation.

## Global Constraints

- Supabase is the only runtime data and authentication platform.
- Preserve existing route contracts and user-facing behavior.
- Do not delete a file until `rg` confirms there are no imports.
- Each domain must pass typecheck and focused tests before the next domain.

---

### Task 1: Establish inventory and safety baseline

**Files:**
- Create: `docs/superpowers/plans/2026-09-06-supabase-stabilization.md`
- Inspect: `package.json`, `src/app`, `src/actions`, `src/lib`, `src/services`, `src/features`, `src/infrastructure`

- [ ] Run `npm run typecheck`, `npm test -- --runInBand`, and `npm run audit:no-firebase`; record current failures.
- [ ] Generate an import inventory with `rg -l "@/lib/firebase|firebase-admin|from \"firebase/" src`.
- [ ] Mark each result as active runtime, test-only, migration-only, or comment/type-only.
- [ ] Commit the inventory and plan before moving files.

### Task 2: Create domain module seams

**Files:**
- Create: `src/modules/{auth,users,courses,enrollments,content,events,billing,progress,certificates,assessments,gamification,analytics}/`
- Modify: affected imports under `src/app`, `src/actions`, `src/lib`, `src/services`

- [ ] Move only already-Supabase implementations first, preserving public exports through compatibility adapters.
- [ ] Define small interfaces for reads, writes, and authorization at each domain seam.
- [ ] Add focused tests for each adapter before changing callers.
- [ ] Run typecheck and focused tests; commit each domain separately.

### Task 3: Migrate remaining runtime domains

**Files:** `src/actions/*`, `src/app/api/*`, `src/lib/*`, `src/services/*`, `src/components/*`

- [ ] Replace Firebase Admin reads/writes with Supabase service-client adapters.
- [ ] Replace browser Firestore listeners with Supabase queries and explicit refresh/revalidation.
- [ ] Normalize timestamps to ISO strings at module interfaces.
- [ ] Preserve authorization checks using Supabase session claims and RLS/service-role boundaries.
- [ ] Add regression tests for upload, billing, portal dashboard, progress, certificates, and admin operations.

### Task 4: Add missing Supabase schemas and storage adapters

**Files:**
- Create: `supabase/migrations/<timestamp>_public_docs.sql`
- Create/modify: `src/infrastructure/storage/*`
- Modify: `src/app/api/upload/route.ts`

- [ ] Create `public_docs` with metadata, publication status, owner, and storage path.
- [ ] Upload files to Supabase Storage with signed URLs and validated MIME/extensions.
- [ ] Add RLS policies for admin writes and public published reads.
- [ ] Verify bucket paths and deletion behavior with integration tests.

### Task 5: Remove Firebase configuration and legacy code

**Files:** `.env.example`, `next.config.mjs`, `package.json`, `src/config/env.ts`, Firebase directories, legacy scripts/tests

- [ ] Remove Firebase environment variables after all runtime imports are gone.
- [ ] Remove Firebase CSP domains and package dependencies.
- [ ] Remove migration-only Firebase scripts and Firestore rules tests.
- [ ] Delete `src/lib/firebase/*` and other legacy adapters only after `rg` import checks.

### Task 6: Reorganize frontend surfaces

**Files:** `src/components`, `src/hooks`, `src/app`

- [ ] Group components under `ui`, `layout`, `public`, `portal`, and `admin`.
- [ ] Move domain hooks next to their module or keep thin aliases in `src/hooks`.
- [ ] Standardize loading, error, empty, and date rendering states.
- [ ] Run Playwright smoke tests for public, portal, and admin flows.

### Task 7: Final stability gate

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test -- --runInBand`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run build`.
- [ ] Run `npm run audit:no-firebase` and require zero runtime/config/dependency findings.
- [ ] Review git diff and commit the final cleanup.
