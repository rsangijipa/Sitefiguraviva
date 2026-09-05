# Task 1 — Shared resource-window contract

## Outcome

Implemented the reusable `ResourceWindow` shell for future care tools. It provides a title-named modal dialog, full resource viewport sizing, and global Portuguese back/close controls. `Modal` now accepts an optional `ariaLabel` without changing existing callers.

## TDD record

### RED

Added `src/components/resources/__tests__/ResourceWindow.test.tsx` before production code. The focused command below failed as expected because the `ResourceWindow` module did not yet exist:

```text
Cannot find module '../ResourceWindow'
```

Command:

```text
npm test -- src/components/resources/__tests__/ResourceWindow.test.tsx --runInBand
```

### GREEN

Added the minimal shared wrapper and optional dialog accessible name support. The same focused test then passed:

```text
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

## Files

- Created `src/components/resources/ResourceWindow.tsx`
- Created `src/components/resources/__tests__/ResourceWindow.test.tsx`
- Modified `src/components/ui/Modal.tsx`

## Self-review

- `ariaLabel` is optional, so all existing `Modal` callers retain their prior contract and behavior.
- The dialog receives its accessible name from the resource title.
- Both global controls use the supplied `onClose` handler and Portuguese accessible labels.
- The wrapper uses the required 90dvh, 96vw/1440px, paper, and rounded-corner resource-window values; it keeps the site's backdrop, safe-area wrapper, focus-ring, icon, and button treatments.
- `git diff --check` completed cleanly.
- Focused Jest test passed. Jest still emits pre-existing Sentry deprecation and multiple-lockfile warnings; no test assertion or runtime errors occurred.

## Commit

`fd85da2 feat: add shared resource window`
