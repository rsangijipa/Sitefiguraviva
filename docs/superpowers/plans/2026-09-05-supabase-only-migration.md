# Supabase-Only Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every active Firebase integration with Supabase and move the locally available course covers into Supabase Storage.

**Architecture:** Supabase Auth is the sole identity provider; browser code uses the typed browser client, and server code uses the typed service client only where privileged access is required. Domain repositories isolate Supabase table and storage operations, while SQL migrations own RLS and storage policies. Firebase is removed only after import and runtime checks prove there is no active use.

**Tech Stack:** Next.js 15, TypeScript, Supabase Auth/PostgREST/Storage, Zod, Jest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-05-supabase-only-migration-design.md`

## Global Constraints

- Supabase is the only auth, database and file-storage platform.
- Do not export data from Firebase; Supabase is the source of truth.
- Keep public course covers public; protect non-public files with RLS or signed URLs.
- Do not print service-role or other secret values in scripts, tests or logs.
- Keep RLS enabled on every new table and storage object policy.
- Preserve the current public URL shapes and user-visible flows.

---

## File structure

- `supabase/migrations/202609050001_supabase_runtime_domains.sql`: missing
  runtime tables, indexes, triggers and RLS policies.
- `supabase/migrations/202609050002_storage_policies.sql`: `course-assets`
  and `uploads` buckets plus object policies.
- `src/infrastructure/supabase/storage.server.ts`: server-only upload,
  deletion and public-URL adapter.
- `src/infrastructure/supabase/storage.client.ts`: authenticated browser
  upload adapter for admin UI.
- `scripts/upload-course-covers.mjs`: idempotent one-shot local cover uploader.
- `scripts/check-no-firebase.mjs`: fails when a product source, manifest,
  config or dependency still references Firebase.
- `src/features/*/infrastructure/*.server.ts`: typed domain repositories.
- `src/app/api/**/route.ts`, `src/app/actions/**`, `src/hooks/**` and
  `src/components/**`: consumers migrated to those repositories.

### Task 1: Establish the Firebase-removal safety gate

**Files:**
- Create: `scripts/check-no-firebase.mjs`
- Create: `tests/architecture/no-firebase-runtime.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run audit:no-firebase`, exit `0` only if production source,
  configuration and dependencies contain no Firebase runtime reference.

- [ ] **Step 1: Write the failing architecture test**

```ts
it("has no Firebase runtime imports or configuration", () => {
  expect(runNoFirebaseAudit()).toEqual({ violations: [] });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`

Expected: FAIL listing the current active Firebase imports and configuration.

- [ ] **Step 3: Implement the audit**

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

- [ ] **Step 4: Run the test to verify the gate reports current violations**

Run: `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`

Expected: PASS only when the test asserts the current violations are detected.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-no-firebase.mjs tests/architecture/no-firebase-runtime.test.ts package.json
git commit -m "test: add firebase removal audit"
```

### Task 2: Provision Supabase Storage and upload course covers

**Files:**
- Create: `supabase/migrations/202609050002_storage_policies.sql`
- Create: `src/infrastructure/supabase/storage.server.ts`
- Create: `scripts/upload-course-covers.mjs`
- Create: `src/infrastructure/supabase/__tests__/storage.server.test.ts`
- Modify: `src/infrastructure/supabase/database.types.ts`

**Interfaces:**
- Produces: `uploadPublicCourseAsset(input: { path: string; body: Buffer;
  contentType: string }): Promise<string>`.
- Produces: `npm run migrate:course-covers`, which uploads the three existing
  `public/cursos/**/capa.jpeg` files and updates matching Supabase courses.

- [ ] **Step 1: Write the failing storage adapter test**

```ts
await expect(
  uploadPublicCourseAsset({
    path: "courses/co-visar/capa.jpeg",
    body: Buffer.from("cover"),
    contentType: "image/jpeg",
  }),
).resolves.toBe("https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts`

Expected: FAIL because the storage adapter does not exist.

- [ ] **Step 3: Add the bucket migration and adapter**

```sql
insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = excluded.public;
```

The adapter must upload with `upsert: true`, return `getPublicUrl(path).data.publicUrl`,
and throw the Supabase error before any database row is updated.

- [ ] **Step 4: Implement and run the one-shot uploader**

Map local paths to stable object paths and existing courses by slug first, then
by exact title. Update `cover_image_url`, `image_url` and `thumbnail_url` in
one row only after upload succeeds. Emit paths, course IDs and status, never
credentials.

Run: `node scripts/upload-course-covers.mjs --dry-run`

Expected: exactly three resolved local files and matching Supabase course rows.

- [ ] **Step 5: Verify the adapter and live upload**

Run: `npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts`

Run: `node scripts/upload-course-covers.mjs`

Expected: test pass and a report of three uploaded public URLs.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/202609050002_storage_policies.sql src/infrastructure/supabase scripts/upload-course-covers.mjs
git commit -m "feat: move course covers to supabase storage"
```

### Task 3: Replace public course reads and broken content listeners

**Files:**
- Modify: `src/hooks/useContent.ts`
- Modify: `src/hooks/useCourses.ts`
- Modify: `src/data/courses.ts`
- Modify: `src/app/curso/page.tsx`
- Modify: `src/app/curso/[id]/page.tsx`
- Create: `src/features/content/infrastructure/supabaseContentRepository.ts`
- Create: `src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts`

**Interfaces:**
- Produces: `listPublishedContent(kind: ContentKind): Promise<ContentRecord[]>`
  and `getPublicPageContent(key: string): Promise<Record<string, unknown> | null>`.

- [ ] **Step 1: Write failing repository tests**

```ts
expect(await listPublishedCourses()).toEqual([
  expect.objectContaining({ id: "co-visar", isPublished: true }),
]);
expect(await getPublicPageContent("home")).toEqual({ heroTitle: "Figura Viva" });
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- --runInBand src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts`

Expected: FAIL because Firestore-backed fetchers are still used.

- [ ] **Step 3: Add missing public-content schema and RLS**

Create typed tables for pages, posts, gallery items and team members. Every
public policy must include `is_published = true`; admin writes must check the
existing Supabase admin role function.

- [ ] **Step 4: Replace hooks and pages with repository calls**

Remove `getDocs`, `onSnapshot`, `collection`, `query` and the Firebase `db`
client from the listed files. Keep React Query keys and supplied initial data
stable so public rendering remains unchanged.

- [ ] **Step 5: Verify regression and browser behavior**

Run: `npm test -- --runInBand src/features/content/infrastructure/__tests__/supabaseContentRepository.test.ts`

Run: `npm run typecheck`

Expected: public course and content test cases pass; no Firestore snapshot
listener can run from `useContent`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/202609050001_supabase_runtime_domains.sql src/features/content src/hooks/useContent.ts src/hooks/useCourses.ts src/data/courses.ts src/app/curso
git commit -m "feat: read public content from supabase"
```

### Task 4: Cut over Supabase Auth and authorization

**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/components/profile/ProfileForm.tsx`
- Modify: `src/lib/auth/supabase-session.ts`
- Modify: `src/middleware.ts`
- Delete: `src/lib/firebase/client.ts`
- Delete: `src/lib/firebase/admin.ts`
- Create: `src/context/__tests__/AuthContext.test.tsx`

**Interfaces:**
- Produces: `AuthContext` whose `user`, `role`, `signOut` and session token are
  sourced only from Supabase.
- Consumes: Supabase session claims and the existing profiles/roles schema.

- [ ] **Step 1: Write failing auth tests**

```tsx
expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining("firebase-token"), expect.anything());
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- --runInBand src/context/__tests__/AuthContext.test.tsx`

Expected: FAIL while the Firebase custom-token bridge and Firebase sign-out remain.

- [ ] **Step 3: Remove the Firebase bridge and replace server authorization**

Use Supabase `auth.getUser()` with the bearer token for route handlers and the
server client for verified server actions. Resolve admin authorization from the
existing profiles/roles data, not client-provided claims.

- [ ] **Step 4: Verify auth flows**

Run: `npm test -- --runInBand src/context/__tests__/AuthContext.test.tsx`

Run: `npm run typecheck`

Expected: tests pass and no browser auth request is made to Firebase.

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/components/profile/ProfileForm.tsx src/lib/auth/supabase-session.ts src/middleware.ts src/context/__tests__/AuthContext.test.tsx
git rm src/lib/firebase/client.ts src/lib/firebase/admin.ts
git commit -m "feat: use supabase as the only identity provider"
```

### Task 5: Migrate learner, admin and engagement domains

**Files:**
- Modify: `src/app/actions/**`, `src/app/api/**`, `src/services/**`,
  `src/app/admin/**`, `src/components/admin/**`, `src/components/portal/**`
  that import Firebase.
- Create: `src/features/enrollments/infrastructure/supabaseEnrollmentRepository.server.ts`
  and `src/features/enrollments/infrastructure/__tests__/supabaseEnrollmentRepository.server.test.ts`.
- Create: `src/features/progress/infrastructure/supabaseProgressRepository.server.ts`
  and `src/features/progress/infrastructure/__tests__/supabaseProgressRepository.server.test.ts`.
- Create: repositories and focused tests in
  `src/features/community/infrastructure/`, `src/features/events/infrastructure/`,
  `src/features/notifications/infrastructure/`,
  `src/features/gamification/infrastructure/`,
  `src/features/assessments/infrastructure/` and
  `src/features/certificates/infrastructure/`.

**Interfaces:**
- Consumes: the typed Supabase client and migrations from Tasks 2–4.
- Produces: repository methods matching each existing action's externally
  visible behavior, using ISO dates instead of Firebase timestamps.

- [ ] **Step 1: Write one failing regression test per domain before changing it**

```ts
it("persists an enrollment with the Supabase user id", async () => {
  await createEnrollment({ courseId: "co-visar", userId: "user-1" });
  expect(supabase.from).toHaveBeenCalledWith("enrollments");
});
```

Create equivalent focused cases for progress, community, events, notifications,
gamification, assessments, certificates and admin course mutation flows.

- [ ] **Step 2: Run each domain test red**

Run: `npm test -- --runInBand src/features/enrollments/infrastructure/__tests__/supabaseEnrollmentRepository.server.test.ts src/features/progress/infrastructure/__tests__/supabaseProgressRepository.server.test.ts src/features/community/infrastructure/__tests__/supabaseCommunityRepository.server.test.ts src/features/events/infrastructure/__tests__/supabaseEventRepository.server.test.ts src/features/notifications/infrastructure/__tests__/supabaseNotificationRepository.server.test.ts src/features/gamification/infrastructure/__tests__/supabaseGamificationRepository.server.test.ts src/features/assessments/infrastructure/__tests__/supabaseAssessmentRepository.server.test.ts src/features/certificates/infrastructure/__tests__/supabaseCertificateRepository.server.test.ts`

Expected: each test fails because the corresponding Firebase implementation
still owns the write or read.

- [ ] **Step 3: Implement one repository and one consumer domain at a time**

For each domain, replace Firebase timestamps with ISO strings, use Supabase
foreign keys, make RLS policy checks server-owned for administrative writes,
then remove that domain's Firebase imports before moving to the next domain.

- [ ] **Step 4: Run green tests and typecheck after each domain**

Run: `npm test -- --runInBand src/features/enrollments/infrastructure/__tests__/supabaseEnrollmentRepository.server.test.ts src/features/progress/infrastructure/__tests__/supabaseProgressRepository.server.test.ts src/features/community/infrastructure/__tests__/supabaseCommunityRepository.server.test.ts src/features/events/infrastructure/__tests__/supabaseEventRepository.server.test.ts src/features/notifications/infrastructure/__tests__/supabaseNotificationRepository.server.test.ts src/features/gamification/infrastructure/__tests__/supabaseGamificationRepository.server.test.ts src/features/assessments/infrastructure/__tests__/supabaseAssessmentRepository.server.test.ts src/features/certificates/infrastructure/__tests__/supabaseCertificateRepository.server.test.ts`

Run: `npm run typecheck`

Expected: each domain passes before the next starts.

- [ ] **Step 5: Commit each independently usable domain**

```bash
git add src/features/enrollments src/features/progress src/features/community src/features/events src/features/notifications src/features/gamification src/features/assessments src/features/certificates src/app src/services src/components supabase/migrations
git commit -m "feat: migrate learner and admin domains to supabase"
```

### Task 6: Replace Firebase uploads, telemetry and messaging

**Files:**
- Modify: `src/components/admin/ImageUpload.tsx`
- Modify: `src/components/admin/FileUpload.tsx`
- Modify: `src/components/admin/MaterialsManager.tsx`
- Modify: `src/app/admin/(protected)/blog/components/BlogPostForm.tsx`
- Modify: `src/lib/telemetry.ts`
- Delete: `public/firebase-messaging-sw.js`
- Create: upload and telemetry tests adjacent to their adapters.

**Interfaces:**
- Consumes: `storage.client.ts` from Task 2.
- Produces: Supabase Storage URLs for every admin upload and telemetry that has
  no Firebase SDK dependency.

- [ ] **Step 1: Write failing upload tests**

```ts
await uploadAdminAsset(new File(["x"], "cover.jpg", { type: "image/jpeg" }));
expect(upload).toHaveBeenCalledWith("uploads/admin/cover.jpg", expect.any(File), expect.anything());
```

- [ ] **Step 2: Run the tests red**

Run: `npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.client.test.ts`

Expected: FAIL while components call `firebase/storage`.

- [ ] **Step 3: Use the Supabase storage adapters**

Validate MIME type and size before upload, preserve existing admin form fields,
and only save returned URLs after an upload succeeds. Replace Firebase
Analytics with the existing server/client telemetry transport or remove its
initialization when no equivalent transport is configured.

- [ ] **Step 4: Verify uploads and telemetry**

Run: `npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.client.test.ts`

Run: `npm run typecheck`

Expected: no Firebase Storage, Analytics or Messaging import remains.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin src/app/admin src/infrastructure/supabase src/lib/telemetry.ts
git rm public/firebase-messaging-sw.js
git commit -m "feat: move uploads and telemetry off firebase"
```

### Task 7: Remove configuration, dependencies and legacy artifacts

**Files:**
- Modify: `next.config.mjs`
- Modify: `.env.example`
- Modify: `src/config/env.ts`
- Modify: `package.json`, `package-lock.json`, `DEPLOY.md`
- Delete: `firestore.rules`, `storage.rules`, Firebase-only scripts and
  Firebase-only tests after their Supabase replacements pass.

**Interfaces:**
- Consumes: `npm run audit:no-firebase` from Task 1.
- Produces: a build whose runtime and dependency graph contain no Firebase.

- [ ] **Step 1: Write the failing final audit assertion**

```ts
expect(runNoFirebaseAudit()).toEqual({ violations: [] });
```

- [ ] **Step 2: Run it red**

Run: `npm test -- --runInBand tests/architecture/no-firebase-runtime.test.ts`

Expected: FAIL until all imports, CSP hosts, variables and dependencies are removed.

- [ ] **Step 3: Remove legacy artifacts**

Remove Firebase hostnames from `images.remotePatterns` and CSP, delete Firebase
variables and validation, remove Firebase packages with `npm uninstall`, and
replace Firebase-only deployment guidance with Supabase migration and Storage
guidance. Keep only historical `legacy_firebase_uid` column names in applied
SQL/database types where needed for existing Supabase records.

- [ ] **Step 4: Verify the complete cutover**

Run: `npm run audit:no-firebase`

Run: `npm test -- --runInBand`

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit `0`; the audit reports zero violations.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs .env.example src/config/env.ts package.json package-lock.json DEPLOY.md scripts tests
git rm firestore.rules storage.rules
git commit -m "chore: remove firebase runtime and configuration"
```

## Plan self-review

- Spec coverage: Tasks 2–6 implement storage, Supabase data domains,
  authentication, uploads, telemetry and messaging; Task 7 removes remaining
  Firebase runtime/configuration; Task 1 provides the final proof.
- No-placeholder check: every task lists concrete files, commands and expected
  outcomes. Domain migration in Task 5 is intentionally serialized because
  those domains share authorization, migrations and UI consumers.
- Type consistency: storage adapter names and inputs are defined in Task 2;
  all later upload consumers use those names. Auth and repository consumers
  receive Supabase user IDs and ISO timestamps only.
