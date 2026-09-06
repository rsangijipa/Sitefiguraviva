### Task 3: Replace public course reads and broken content listeners

**Files:**
- Modify: `src/hooks/useContent.ts`
- Modify: `src/hooks/useCourses.ts`
- Modify: `src/data/courses.ts`
- Modify: `src/app/curso/page.tsx`
- Modify: `src/app/curso/[id]/page.tsx`
- Create: `src/features/content/infrastructure/supabaseContentRepository.ts`
- Create: `src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts`
- Modify: `supabase/migrations/202609050001_supabase_runtime_domains.sql`
  (create it if it does not exist).

**Interfaces:**
- Produce `listPublishedContent(kind: ContentKind): Promise<ContentRecord[]>`
  and `getPublicPageContent(key: string): Promise<Record<string, unknown> | null>`.

**Global constraints:**
- Supabase is the only auth, database and file-storage platform.
- Do not export data from Firebase; Supabase is the source of truth.
- Keep RLS enabled and public reads strictly limited to published content.
- Preserve public URL shapes and user-visible flows.

- [ ] Write failing repository tests asserting:

```ts
expect(await listPublishedCourses()).toEqual([
  expect.objectContaining({ id: "co-visar", isPublished: true }),
]);
expect(await getPublicPageContent("home")).toEqual({ heroTitle: "Figura Viva" });
```

- [ ] Run the focused test red before production implementation.

- [ ] Add schema/RLS for public pages, posts, gallery items and team members.
  Public policies must require `is_published = true`; admin writes must use the
  existing Supabase admin-role function. Also insert/migrate the missing
  `experiencia-atemporal` course row from available local/public course data so
  Task 2's uploader can later resolve all three cover targets. Do not read from
  Firebase.

- [ ] Replace Firebase `getDocs`, `onSnapshot`, `collection`, `query` and
  `@/lib/firebase/client` imports from the listed hooks/pages with the Supabase
  repository. Keep React Query keys and caller-provided initial data stable.

- [ ] Run focused repository tests, `npm run typecheck`, and `npm run audit:no-firebase`.
  The audit is expected to remain nonzero until later tasks, but Firebase
  violations for each migrated listed production file must disappear.

- [ ] After Task 3 data exists, rerun `node scripts/upload-course-covers.mjs --dry-run`.
  If it resolves all three rows and storage migration is already applied, run
  the live `npm run migrate:course-covers`; otherwise report the external
  prerequisite without printing secrets.

- [ ] Commit only Task 3 files if permitted.

Write full report to
`.superpowers/sdd/2026-09-05-supabase-only-migration/task-3-report.md`,
including TDD evidence, migration rationale, exact test output summaries,
course-cover dry/live result, commit hash or permission failure, and concerns.
Do not spawn subagents.
