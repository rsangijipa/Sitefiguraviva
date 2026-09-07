# Branch Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and verify `integration/best-version` as a documented, regression-aware consolidation of the repository branches without modifying `main`.

**Architecture:** Treat `main` as the immutable baseline. Select cohesive domain changes from the product branches, preserve existing contracts when implementations overlap, and validate each integration wave with the repository quality gates. Keep Firebase/Supabase coexistence explicit until a separately verified migration removes the remaining Firebase runtime dependencies.

**Tech Stack:** Next.js 15, React, TypeScript, Jest, ESLint, Supabase, Firebase compatibility layer, Firestore rules, npm.

**Spec:** User request in the conversation: analyze every branch against `main`, document exclusive commits and risks, consolidate the technically superior implementations, and run `npm install`, `npm run build`, `npm run lint`, `npm test`, and `npx tsc --noEmit` after each stage.

## Global Constraints

- Never modify `main`.
- Preserve unrelated user changes in the original checkout.
- Do not select an implementation solely because its commit is newer.
- Do not remove an existing feature without documenting the reason.
- Treat missing production environment variables as an environment blocker, not as a passing build.
- Classify every local and remote branch, including Dependabot refs.

### Task 1: Audit and report

**Files:**
- Modify: `docs/BRANCH-INTEGRATION-REPORT.md`
- Create: `docs/superpowers/plans/2026-09-06-branch-consolidation.md`

- [ ] Capture branch tips, merge-bases, exclusive commits, changed-file areas, overlaps, regressions, and predictable conflicts.
- [ ] Compare the existing consolidation against each product branch and identify code absent from the consolidation.
- [ ] Record recommendations as MERGE, CHERRY-PICK, DISCARD, or REIMPLEMENT.

### Task 2: Validate the consolidated baseline

**Files:**
- No source changes.

- [ ] Run `npm install`.
- [ ] Run `npm run build` with the repository environment available; if unavailable, record the exact missing variables and failure phase.
- [ ] Run `npm run lint`.
- [ ] Run `npm test -- --runInBand`.
- [ ] Run `npx tsc --noEmit`.

### Task 3: Resolve only verified consolidation gaps

**Files:**
- Modify only files proven to contain a regression or a superior missing implementation.
- Test each changed behavior with an existing or new focused test.

- [ ] Do not merge duplicate branch history when equivalent code is already present.
- [ ] Preserve the `main` quiz-bank behavior while retaining the standardized resource-window contracts.
- [ ] Preserve the Supabase repository/storage improvements that have tests and avoid unverified Firebase removal.
- [ ] Re-run all five gates after each correction wave.

### Task 4: Final evidence and handoff

**Files:**
- Modify: `docs/BRANCH-INTEGRATION-REPORT.md`

- [ ] Record exact commands, exit status, suite/test counts, build blocker status, remaining debt, and final structure.
- [ ] Verify `main` still points to its original commit and has no changed working tree.
- [ ] Report the final branch and worktree paths.
