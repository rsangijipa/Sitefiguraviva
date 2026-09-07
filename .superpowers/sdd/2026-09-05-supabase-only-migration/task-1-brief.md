### Task 1: Establish the Firebase-removal safety gate

**Files:**
- Create: `scripts/check-no-firebase.mjs`
- Create: `tests/architecture/no-firebase-runtime.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run audit:no-firebase`, exit `0` only if production source,
  configuration and dependencies contain no Firebase runtime reference.

**Global constraints:**
- Supabase is the only auth, database and file-storage platform.
- Do not print service-role or other secret values in scripts, tests or logs.
- Keep public course covers public; protect non-public files with RLS or signed URLs.

- [ ] Write the failing architecture test:

```ts
it("has no Firebase runtime imports or configuration", () => {
  expect(runNoFirebaseAudit()).toEqual({ violations: [] });
});
```

- [ ] Run `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`.
  It must initially fail by listing current Firebase imports/configuration.

- [ ] Implement `scripts/check-no-firebase.mjs` using:

```js
const forbidden = [
  /from ["']firebase(?:\/|["'])/,
  /from ["']firebase-admin(?:\/|["'])/,
  /@\/lib\/firebase/,
  /NEXT_PUBLIC_FIREBASE_/,
  /FIREBASE_/,
];
```

Scan only application source, public manifests, configuration, scripts used by
`package.json`, and dependencies. Exclude committed migration-history labels
such as `legacy_firebase_uid`.

- [ ] Keep the test focused on confirming current violations are detected;
  Task 7 will change the assertion to zero violations.
- [ ] Add `audit:no-firebase` to `package.json`.
- [ ] Run the focused test and the audit script. Commit only Task 1 files if
  the environment permits it.

Write a full report to
`.superpowers/sdd/2026-09-05-supabase-only-migration/task-1-report.md`: files
changed, test commands and outputs, commit hash or permission failure, and
any concern. Do not spawn subagents.
