### Task 6: Replace Firebase uploads, telemetry and messaging

Read Task 6 in the full plan and the approved spec. Migrate
`src/components/admin/ImageUpload.tsx`, `FileUpload.tsx`, `MaterialsManager.tsx`,
the admin blog form, `src/lib/telemetry.ts` and the Firebase messaging service
worker to Supabase Storage or the existing telemetry transport. Use the Storage
adapters from Task 2, validate MIME/size before upload, preserve admin form
fields, and never log secrets. Write failing focused tests before changes,
remove Firebase imports from every touched file, run focused tests/typecheck,
and commit only this task. Do not spawn subagents. Report to
`.superpowers/sdd/2026-09-05-supabase-only-migration/task-6-report.md`.
