# SDD ledger — plan: docs/superpowers/plans/2026-09-05-supabase-only-migration.md

Base: 8ce76da911f716b7b7c6ecca6cba5e342d1d5472

Baseline: `npm test -- --runInBand` completed with 24 suites passing, 1 suite
skipped and one pre-existing failure in
`tests/accessibility/public-contracts.test.tsx` because
`src/components/ResourcesSection.jsx` has no `<motion.button>` matches.

Preflight scan:

| Tasks | Shared file/interface | Finding |
| --- | --- | --- |
| 1 and 7 | `scripts/check-no-firebase.mjs` / removal audit | Task 1 introduces detection before Task 7 makes the zero-violation assertion; consistent. |
| 2 and 6 | Supabase Storage adapters | Task 2 provides server/client storage interfaces consumed by Task 6; consistent. |
| 2 and 3 | `courses` image columns | Task 2 updates image URLs; Task 3 reads published courses; consistent. |
| 3 and 4 | browser client / authorization | Task 3 replaces public reads, Task 4 removes Firebase identity bridge; consistent. |
| 4 and 5 | authenticated user identity | Task 4 establishes Supabase identity before Task 5 writes domain data; consistent. |
| 5 and 7 | Firebase imports and dependencies | Task 5 removes domain consumers before Task 7 removes packages; consistent. |

Ruling: Work in the current checkout — the user declined an isolated worktree;
existing unstaged files remain out of scope — cost if wrong: migration changes
may share the working tree with unrelated local edits.

Ruling: Do not repair the baseline accessibility failure in this migration — it
does not reference Firebase or Supabase — cost if wrong: final verification
will continue to report this separate failure.

Task 1: fix round 1/5 (1 addressed, 0 open — audit now detects Firebase hosts
and CLI scripts; commits a511d5a..8c0d607)

Task 1: complete (commits 8ce76da..8c0d607, review clean)

Task 2: fix round 1/5 (2 addressed, 0 open — uploader verifies exactly one
course update and never echoes rejected arguments; commits fc9aae5..16a5fc5)

Ruling: Defer the three-cover live upload until Task 3 creates or migrates the
missing `experiencia-atemporal` course row; Task 2 may not invent a course row
outside its brief — cost if wrong: covers remain on local fallback paths until
the later data migration and the final uploader run.

Task 2: complete (commits 8c0d607..16a5fc5, review clean; live-upload follow-up
deferred to Task 3 data migration)

Task 3: fix round 1/5 (1 addressed, 0 open — normalized Supabase cover now
precedes deduplicated legacy gallery images; commits 88cad70..2b6717a)

Task 3: complete (commits 16a5fc5..2b6717a, review clean; applying migrations
and the live cover upload remain external deployment prerequisites)

Ruling: Keep `src/lib/firebase/client.ts` and `src/lib/firebase/admin.ts`
until Tasks 5–7 migrate their remaining consumers; Task 4 brief explicitly
makes deletion conditional on no remaining imports, and deleting them now
would break application routes — cost if wrong: Firebase modules remain in the
tree for later tasks and the final audit must catch them.

Task 4: complete (commit 028b8f1; review finding parked by the conditional
deletion ruling; Supabase Auth bridge removed)

Task 5: fix round 1/5 (2 addressed, 0 open — removed gamification Timestamp
dependency and corrected final report hash; commits 4fd687a..e80cad2)

Task 5: complete (commits 028b8f1..e80cad2, review clean)
