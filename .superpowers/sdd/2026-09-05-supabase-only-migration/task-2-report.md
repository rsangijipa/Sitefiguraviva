# Task 2 report: Supabase Storage course-cover migration

## Status

Local implementation is committed. The required dry-run found an external data
blocker, so no live Storage upload or course-row update was attempted.

## Implemented

- Added the idempotent `course-assets` public bucket and `uploads` private
  bucket migration.
- Added public read access only for `course-assets` and authenticated-admin
  select/insert/update/delete policies for the two managed buckets.
- Added `uploadPublicCourseAsset`, using `upsert: true`, returning the public
  URL, and throwing the upload error before URL generation.
- Added the one-shot three-cover uploader with slug-first/exact-title fallback,
  `--dry-run`, stable object paths, environment-only Supabase configuration, and
  post-upload updates to `cover_image_url`, `image_url`, and `thumbnail_url`.
- Added the `migrate:course-covers` package script.
- `database.types.ts` did not require a change; the existing generated database
  shape already includes all three course image columns, and Storage is exposed
  by the typed Supabase client independently of the public-schema type.

## TDD evidence

RED command:

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts
```

Initial result: exit 1. Jest reported `Cannot find module '../storage.server'`,
which is the expected failure before the adapter existed.

GREEN command:

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts
```

Final result: exit 0; 1 suite passed, 2 tests passed. The tests cover the stable
public URL/upsert contract and propagation of the original upload error before
public-URL generation.

## Final verification

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts
# PASS: 1 suite, 2 tests

npm run typecheck
# PASS: tsc --noEmit exited 0

npm exec -- prettier --check package.json scripts/upload-course-covers.mjs src/infrastructure/supabase/storage.server.ts src/infrastructure/supabase/__tests__/storage.server.test.ts
# PASS: all matched files use Prettier code style

git diff --cached --check
# PASS: exited 0 with no whitespace errors before commit
```

The commit hook also ran ESLint fix and Prettier successfully on the staged JS
and TypeScript files.

## Dry-run and live-upload result

Environment check: `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` were both available. No secret value was printed.

Command:

```text
node scripts/upload-course-covers.mjs --dry-run
```

Result: exit 1 after these read-only resolutions:

```text
[dry-run] public/cursos/superviso-clnica-co-visar/capa.jpeg -> courses/co-visar/capa.jpeg | course=VtOJYjX6DXXMmoZHTIIL
[dry-run] public/cursos/III Formação Clínica em Gestalt-Terapia/capa.jpeg -> courses/iii-formacao-clinica-em-gestalt-terapia/capa.jpeg | course=Ti8sjbPwhL9j7E9KLCHc
[failed] No course matched slug experiencia-atemporal or its exact title.
```

A read-only inspection confirmed that the Supabase `courses` table currently
contains only the two rows above. It contains no row whose slug is
`experiencia-atemporal` or whose exact title is `Experiência Atemporal`.

Live result: not attempted because the mandatory dry-run did not resolve all
three target rows. Consequently, no object was uploaded, no course image column
was updated, and no public URL was produced.

## Commit

`fc9aae5` (`feat: move course covers to supabase storage`)

The commit contains only:

- `package.json`
- `scripts/upload-course-covers.mjs`
- `src/infrastructure/supabase/storage.server.ts`
- `src/infrastructure/supabase/__tests__/storage.server.test.ts`
- `supabase/migrations/202609050002_storage_policies.sql`

## Concerns / required follow-up

1. Create or migrate the missing Supabase course row for `Experiência
   Atemporal`, then rerun the dry-run. The uploader intentionally does not create
   courses because Task 2 only authorizes resolving and updating matching rows.
2. Apply `202609050002_storage_policies.sql` to the target Supabase project
   before the live upload if it has not already been applied.
3. Run `npm run migrate:course-covers` only after the dry-run resolves all three
   rows; then capture the three course IDs and public URLs.

## Review fix round 1

Commit: `16a5fc5` (`fix: harden course cover migration checks`)

Changes:

- The course update now appends `.select("id")` and accepts the operation only
  when Supabase returns exactly one updated row. Zero or multiple rows throw
  before `uploadCover` returns, so the caller cannot emit `[uploaded]` for an
  ambiguous or no-op database update.
- Unsupported command-line arguments now produce the fixed message
  `Unsupported command-line arguments.`; raw argument values are never echoed.
- Added Node test-runner coverage for one/zero/multiple returned update rows and
  a real child-process test proving a secret-shaped unsupported argument does
  not appear in stdout or stderr.

TDD evidence:

```text
node --test scripts/upload-course-covers.test.mjs
# RED: expected the sanitized message, received the old message containing the
# raw unsupported argument value.

node --test scripts/upload-course-covers-lib.test.mjs
# RED: ERR_MODULE_NOT_FOUND before the update-cardinality helper existed.

node --test scripts/upload-course-covers.test.mjs scripts/upload-course-covers-lib.test.mjs
# GREEN: 4 tests passed, 0 failed.
```

Post-fix verification:

```text
npm exec -- prettier --check scripts/upload-course-covers.mjs scripts/upload-course-covers-lib.mjs scripts/upload-course-covers.test.mjs scripts/upload-course-covers-lib.test.mjs
# PASS

npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts
# PASS: 1 suite, 2 tests

npm run typecheck
# PASS: tsc --noEmit exited 0

node scripts/upload-course-covers.mjs --dry-run
# Expected external-data blocker remains: two rows resolve and Experiência
# Atemporal has no matching Supabase course row. No upload was attempted.
```
