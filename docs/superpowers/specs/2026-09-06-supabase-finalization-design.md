# Supabase Finalization and Codebase Organization Design

## Goal

Remove Firebase/Firestore as an application dependency, make Supabase the only data, auth, realtime and storage provider, and reorganize public content and therapeutic resources into discoverable domain folders.

## Architecture

Each domain exposes one deep module as its interface. Pages, server actions and API routes consume that interface instead of directly accessing a database client. Supabase is the only adapter behind those interfaces.

The target seams are:

- `src/features/certificates`: issue, query and verify certificates.
- `src/features/progress`: record lesson progress and compute course completion.
- `src/features/gamification`: XP, badges, streaks and leaderboard queries.
- `src/features/billing`: checkout, webhook idempotency and subscription state.
- `src/features/public-site`: blog, gallery and library public content.
- `src/features/resources/therapeutic`: therapeutic-resource catalog, routes and shared UI.

`src/infrastructure/supabase` remains the only location that creates Supabase clients, storage adapters and database-specific helpers. Route handlers and actions retain request validation and authorization but delegate persistence to a feature interface.

## Migration Rules

1. A Firebase consumer is migrated before its Firebase import, config or dependency is removed.
2. All writes use the server Supabase client and preserve authorization and idempotency behavior.
3. Public content reads may use the browser client only through a feature repository.
4. Database changes are represented by versioned SQL migrations before code depends on them.
5. Files are deleted only after `rg` finds no import, dynamic import or script reference.

## Directory Organization

Public content is organized by domain under `src/features/public-site`:

- `blog/`
- `gallery/`
- `library/`

Therapeutic resources are organized under `src/features/resources/therapeutic`, with route-level components kept in `src/app/recursos` as thin route adapters. Existing URLs remain unchanged.

## Execution Order

1. Migrate critical runtime domains: certificates, progress, gamification, metrics and billing webhook.
2. Migrate administrative actions, user/profile hooks and remaining page-level Firebase consumers.
3. Move public content/therapeutic-resource implementation behind feature seams and update imports.
4. Remove Firebase configuration, scripts, tests, packages and directories after import audit is clean.
5. Validate with typecheck, lint, full Jest, production build and `audit:no-firebase`.

## Error Handling and Verification

Every Supabase mutation returns typed, actionable errors to callers and records audit events where the current Firebase flow did. Each migrated domain gets a focused repository/service test before its legacy adapter is deleted. The final gate requires zero runtime/configuration/dependency Firebase findings.

## Non-goals

This refactor does not change public URLs, pricing rules, visual layout, or migrate production data already present in Supabase. It does not remove old records from Firebase; it removes the application dependency on Firebase.
