### Task 5: Migrate learner, admin and engagement domains

Read the full Task 5 in `docs/superpowers/plans/2026-09-05-supabase-only-migration.md`.
Migrate one domain at a time from Firebase to typed Supabase repositories:
enrollments, progress, community, events, notifications, gamification,
assessments and certificates. Preserve externally visible behavior, use ISO
dates, enforce server-owned admin writes and add focused tests before each
implementation. Remove Firebase imports for each migrated domain. Do not
modify unrelated files or spawn subagents. Existing Supabase schema and
repositories should be reused where present; add idempotent SQL only for
missing tables. Run focused tests and typecheck after each domain, then commit
the complete Task 5 work.

Write report to `.superpowers/sdd/2026-09-05-supabase-only-migration/task-5-report.md`.
