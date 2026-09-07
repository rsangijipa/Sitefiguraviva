# Task 3 report: Supabase public content and course reads

## Status

Implementation is committed. The missing `experiencia-atemporal` course row
was created in the target Supabase project from the checked-in local course
data, and the three-cover dry-run now resolves every target. The live cover
upload was not run because the `course-assets` bucket is absent, which proves
the Task 2 Storage migration has not yet been applied to the target project.

## Implemented

- Added a typed Supabase public-content repository with
  `listPublishedContent(kind)`, `getPublicPageContent(key)`,
  `listPublishedCourses()`, and the authenticated-admin `listContent()` path.
- Kept the established React Query keys and caller-supplied `initialData`
  behavior in `useContent` and `useCourses`.
- Removed Firebase/Firestore reads from all five Task 3 production targets:
  `useContent.ts`, `useCourses.ts`, `data/courses.ts`, `/curso`, and
  `/curso/[id]`.
- Preserved legacy public rendering fields (`image`, `coverImage`, `images`,
  `date`, `mediators`, camel-case timestamps) while mapping typed Supabase
  rows. When normalized image columns are not populated yet, the course mapper
  keeps a locally available image from `legacy_payload`.
- Public course detail resolution accepts the existing ID-or-slug URL shape
  but never requests drafts; the repository requires both
  `is_published = true` and `status = 'open'`.
- Added typed database definitions and an additive migration for
  `public_pages`, `posts`, `gallery_items`, and `team_members`.
- Enabled RLS for every new CMS table. Each anonymous/authenticated public
  read policy explicitly requires `is_published = true`; each write policy
  requires the existing `public.current_user_can_admin()` function.
- Tightened the formerly unrestricted `site_content` public policy by adding
  and requiring `is_published`. Existing Supabase `site_content` rows are
  migrated into `public_pages`; no Firebase data is read.
- Added the `Experiência Atemporal` course from
  `public/cursos/experincia-atemporal/info.txt`, including the shipped local
  cover fallback, title, description, dates, format, schedule, tags, and
  mediators. The SQL insert is conflict-safe and does not overwrite a later
  administrator edit.

## Migration rationale

Public CMS concerns use separate typed tables so RLS and indexes can express
their distinct publication/order rules. `legacy_payload` exists only as a
compatibility envelope for fields not yet normalized; the repository gives
typed columns precedence and emits the legacy field names expected by current
components. The pre-existing `site_content` table is retained for callers
outside this task, but its permissive public policy is replaced and its
already-public rows are copied once into the new page table.

The third course is also represented in the migration so fresh environments
and future deployments receive the same row. Because the target project had
not applied this migration yet, the same conflict-safe course payload was
written directly through the Supabase service API. The response contained
only:

```text
[{"id":"experiencia-atemporal","slug":"experiencia-atemporal"}]
```

An anonymous/RLS read then returned the row with
`is_published=true` and `status=open`.

## TDD evidence

Initial RED command:

```text
npm test -- --runInBand src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts
```

Initial result: exit 1. Jest reported
`Cannot find module '../supabaseContentRepository'`, the expected failure
before the repository existed.

A second RED cycle protected legacy local-cover fallback. With
`legacy_payload.image` populated and all normalized image columns null, the
test expected `/legacy-course.jpg`; it failed because the mapper returned
`null`.

Final GREEN command (fresh, after commit):

```text
npm test -- --runInBand src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts
```

Result: exit 0; 1 suite passed, 4 tests passed, 0 failed. Coverage includes
published/open course filtering and mapping, published page payloads,
published post compatibility fields, and the authenticated-admin draft query
path.

## Final verification

```text
npm run typecheck
# PASS: tsc --noEmit exited 0

npm run audit:no-firebase
# EXPECTED NONZERO: later migration tasks still own the remaining violations
```

The audit returned 302 remaining repository-wide violations. A programmatic
filter of the same audit result returned:

```json
{"violationCount":302,"migratedFileViolations":[]}
```

Thus none of the Task 3 migrated production files retains a Firebase import,
configuration name, runtime host, or Firestore call.

Before commit, `git diff --cached --check` exited 0. The commit hook ran ESLint
fix and Prettier successfully over all eight staged JS/TS files. The SQL file
was manually inspected because this repository's Prettier setup has no SQL
parser.

## Course-cover dry/live result

Fresh post-commit dry-run:

```text
node scripts/upload-course-covers.mjs --dry-run

[dry-run] public/cursos/superviso-clnica-co-visar/capa.jpeg -> courses/co-visar/capa.jpeg | course=VtOJYjX6DXXMmoZHTIIL
[dry-run] public/cursos/III Formação Clínica em Gestalt-Terapia/capa.jpeg -> courses/iii-formacao-clinica-em-gestalt-terapia/capa.jpeg | course=Ti8sjbPwhL9j7E9KLCHc
[dry-run] public/cursos/experincia-atemporal/capa.jpeg -> courses/experiencia-atemporal/capa.jpeg | course=experiencia-atemporal
```

Result: exit 0; all three local files and course rows resolved.

A service-role bucket inventory returned
`{"courseAssetsBucket":null}`. Per the Task 3 safety gate,
`npm run migrate:course-covers` was therefore not run. No cover object or
course image URL was written by the uploader.

## Commit

`88cad70` (`feat: read public content from supabase`)

The commit contains only the nine Task 3 implementation, test, database-type,
route/hook, and migration files. Existing unrelated unstaged changes were
preserved.

## Concerns / required follow-up

1. Apply `supabase/migrations/202609050001_supabase_runtime_domains.sql` to the
   target Supabase project before deploying this code. A read-only REST probe
   currently returns `PGRST205` for `public_pages`, confirming that the new CMS
   schema is not live yet. This checkout has neither Supabase CLI link metadata
   nor database/management credentials capable of applying SQL migrations.
2. Apply `supabase/migrations/202609050002_storage_policies.sql`. Recheck that
   the public `course-assets` bucket exists, rerun the dry-run, and only then
   run `npm run migrate:course-covers`.
3. The no-Firebase audit remains nonzero by design until later tasks remove the
   302 references outside Task 3.

## Review fix round 1

The course mapper previously emitted `legacy_payload.images` unchanged even
when `cover_image_url` contained a migrated Supabase cover. Because the
unchanged course-detail client selects `course.images[0]` before
`course.image`, that ordering could keep an obsolete legacy URL visible after
the successful cover upload.

Added a focused regression fixture containing a normalized Supabase cover and
legacy gallery images (including a duplicate of the normalized cover). RED
returned the legacy gallery URL first. The mapper now emits a string-only,
deduplicated list with the normalized cover first, followed by non-duplicate
legacy gallery entries.

Verification:

```text
npm test -- --runInBand src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts
# PASS: 1 suite, 5 tests

npm run typecheck
# PASS: tsc --noEmit exited 0
```

No migration or external Supabase data was changed in this fix round.
