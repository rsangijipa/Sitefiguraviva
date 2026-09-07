### Task 2: Provision Supabase Storage and upload course covers

**Files:**
- Create: `supabase/migrations/202609050002_storage_policies.sql`
- Create: `src/infrastructure/supabase/storage.server.ts`
- Create: `scripts/upload-course-covers.mjs`
- Create: `src/infrastructure/supabase/__tests__/storage.server.test.ts`
- Modify: `src/infrastructure/supabase/database.types.ts` only if needed for
  the Storage adapter.

**Interfaces:**
- Produce `uploadPublicCourseAsset(input: { path: string; body: Buffer;
  contentType: string }): Promise<string>`.
- Produce `npm run migrate:course-covers`, which uploads the three existing
  `public/cursos/**/capa.jpeg` files and updates matching Supabase courses.

**Global constraints:**
- Supabase is the only auth, database and file-storage platform.
- Do not print service-role or other secret values in scripts, tests or logs.
- Keep public course covers public; protect non-public files with RLS or signed URLs.
- The user expressly authorized the external Supabase Storage upload.

- [ ] Write a failing storage adapter test:

```ts
await expect(
  uploadPublicCourseAsset({
    path: "courses/co-visar/capa.jpeg",
    body: Buffer.from("cover"),
    contentType: "image/jpeg",
  }),
).resolves.toBe("https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg");
```

- [ ] Run `npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.server.test.ts`.
  It must initially fail because the storage adapter does not exist.

- [ ] Add an idempotent bucket migration:

```sql
insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = excluded.public;
```

Also create the protected `uploads` bucket and policies: public SELECT only for
`course-assets`; authenticated admins write storage objects; non-public
`uploads` objects must not receive a public SELECT policy.

- [ ] Implement the server adapter. It must upload with `upsert: true`, return
  `getPublicUrl(path).data.publicUrl`, and throw the Supabase error before any
  course database row is updated.

- [ ] Implement the upload script. It must map these local files to stable
  object paths and resolve courses by slug first, then exact title:

  - `public/cursos/superviso-clnica-co-visar/capa.jpeg`
  - `public/cursos/III Formação Clínica em Gestalt-Terapia/capa.jpeg`
  - `public/cursos/experincia-atemporal/capa.jpeg`

Update `cover_image_url`, `image_url` and `thumbnail_url` only after each
file upload succeeds. The script supports `--dry-run`, prints paths/course IDs/
status only, and reads Supabase settings only from environment variables.

- [ ] Add `migrate:course-covers` script entry to `package.json`.
- [ ] Run dry-run first. If Supabase URL/service key is unavailable, report
the exact missing variable names only and do not attempt live upload. If they
are configured, run the live upload and report only paths, course IDs and
public URLs.
- [ ] Run the focused test and `npm run typecheck` after implementation.
- [ ] Commit only Task 2 files if the environment permits it.

Write full report to
`.superpowers/sdd/2026-09-05-supabase-only-migration/task-2-report.md` with
TDD evidence, commands/outputs, live-upload result or unavailable variables,
commit hash or permission failure, and concerns. Do not spawn subagents.
