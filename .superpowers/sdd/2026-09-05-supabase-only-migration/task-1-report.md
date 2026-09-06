# Task 1 report: Firebase-removal safety gate

## Files changed

- `scripts/check-no-firebase.mjs` — adds a synchronous audit that scans production
  source, public JavaScript/manifest files, root configuration and environment
  templates, package-referenced scripts, and package dependencies. It reports
  file paths, line numbers, and rule identifiers only; it never logs environment
  values. It excludes test files and does not scan Supabase migration history, so
  `legacy_firebase_uid` migration labels are not violations.
- `tests/architecture/no-firebase-runtime.test.ts` — verifies that the new audit
  detects the present Firebase baseline. Task 7 should change this expectation to
  `{ violations: [] }` once the migration is complete.
- `package.json` — adds `npm run audit:no-firebase`.
- `jest.config.js` — adds `tests/architecture` to Jest roots so the required
  focused test command can discover its required test location.

## TDD evidence

1. Added the architecture test before the audit implementation.
2. Ran `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`.
   It failed as expected because `scripts/check-no-firebase.mjs` did not yet
   exist (`ERR_MODULE_NOT_FOUND`).
3. Implemented the audit and reran the focused test. It passed: 1 suite and 1
   test passed.

## Verification

- `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`
  - Exit code: 0
  - Output: 1 suite passed, 1 test passed.
- `node scripts/check-no-firebase.mjs --json`
  - Exit code: 1 (expected until the Firebase-removal migration completes).
  - The audit found 299 current production/configuration/dependency violations,
    including Firebase package dependencies, environment variable names, the
    package-referenced `scripts/sync_data.mjs`, and Firebase imports in `src`.
  - The JSON output contains paths, line numbers, and rule names only; no
    environment values or secrets were printed.
- `git diff --check`
  - Exit code: 0.

## Commit

The first scoped commit attempt was rejected by the repository commit-message
hook because the subject contained an uppercase `Firebase`. The corrected,
repository-compliant Task 1 implementation commit is `29743b0`
(`test: add firebase removal safety gate`). Only Task 1 files were staged;
pre-existing unstaged changes remain untouched.

## Concerns

- `npm run audit:no-firebase` correctly exits 1 today because Firebase remains
  in production code, configuration, and dependencies. This is the intended
  migration safety gate; it will exit 0 only after later removal tasks.
- The supplied forbidden patterns do not include dynamic `import("firebase/..." )`
  syntax. Existing dynamic use is also covered by related configuration/import
  references, but a future hardening pass may add an explicit dynamic-import
  pattern if desired.
