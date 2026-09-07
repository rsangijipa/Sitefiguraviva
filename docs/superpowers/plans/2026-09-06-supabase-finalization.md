# Supabase Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Supabase the sole application backend and organize public content and therapeutic resources by domain.

**Architecture:** Feature modules are the seam for all persistence. Firebase adapters are removed only after every caller uses a Supabase feature module.

**Tech Stack:** Next.js, TypeScript, Supabase Auth/Postgres/Storage/Realtime, Jest.

**Spec:** `docs/superpowers/specs/2026-09-06-supabase-finalization-design.md`

## Global Constraints

- Preserve existing public URLs and authorization behavior.
- Create or update Supabase SQL migrations before code depends on a new table/RPC.
- Delete a Firebase file only after `rg` has no imports or dynamic imports for it.
- Run the stated verification at each task and all final gates at the end.

### Task 1: Establish a repeatable audit baseline

**Files:**
- Modify: `scripts/check-no-firebase.mjs`
- Test: `tests/architecture/no-firebase-runtime.test.ts`

- [ ] Add category output for runtime, configuration, scripts and dependencies.
- [ ] Run `npm run audit:no-firebase` and record the zero-findings exit condition.
- [ ] Run `npm test -- tests/architecture/no-firebase-runtime.test.ts --runInBand`.

### Task 2: Migrate critical runtime modules

**Files:**
- Modify: `src/lib/certificates/issuer.ts`, `src/lib/progress/progressService.ts`, `src/lib/gamification/*`, `src/lib/metrics/kpi.ts`, `src/app/api/billing/webhook/route.ts`
- Create: focused Supabase repository tests under each feature.

- [ ] Write a failing test for certificate idempotency against the Supabase adapter.
- [ ] Replace Firestore reads/writes with server Supabase queries and transactional RPC/upsert patterns.
- [ ] Write and apply required SQL migrations for idempotent webhook/event state.
- [ ] Run focused tests, then `npm run typecheck`.

### Task 3: Migrate actions, pages, hooks and profile storage

**Files:**
- Modify: Firebase-importing files in `src/actions`, `src/app/actions`, `src/app/admin`, `src/hooks`, `src/components/profile`.
- Create: feature adapters only where no Supabase interface exists.

- [ ] For each Firebase import, write a focused behavioral test or extend its existing test.
- [ ] Replace direct Firebase access with the relevant feature module.
- [ ] Move avatar uploads to Supabase Storage and persist URL in `profiles`.
- [ ] Run affected Jest tests and `npm run typecheck` after each domain.

### Task 4: Organize public content and therapeutic resources

**Files:**
- Create/Move: `src/features/resources/therapeutic/*`.
- Move: public blog, gallery and library implementation below `src/features/public-site/<domain>`.
- Modify: thin route adapters in `src/app/recursos`, public content pages and affected imports.

- [ ] Add route-contract tests proving old public paths render after the moves.
- [ ] Move implementation files without changing public URL paths.
- [ ] Update imports through feature public entrypoints.
- [ ] Run route-contract tests and `npm run lint`.

### Task 5: Remove Firebase configuration and legacy files

**Files:**
- Modify: `.env.example`, `next.config.mjs`, `src/config/env.ts`, `package.json`.
- Delete after audit: `src/lib/firebase/*`, awareness-tree Firebase adapters, Firebase scripts/rules/tests.

- [ ] Run `rg -n "@/lib/firebase|firebase-admin|firebase/firestore|from ['\"]firebase" src scripts` and resolve every result.
- [ ] Remove Firebase environment variables, CSP allowlist entries, packages and scripts.
- [ ] Delete confirmed-unused adapters and migration scripts.
- [ ] Run `npm install` only if the lockfile must be updated, then `npm run audit:no-firebase`.

### Task 6: Final verification and cleanup

**Files:**
- Modify only files needed to correct validation failures.

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test -- --runInBand`.
- [ ] Run `npm run build` followed by `npm run typecheck` sequentially.
- [ ] Run `npm run audit:no-firebase` and require zero findings.
- [ ] Commit each coherent domain migration and report remaining external requirements, if any.
