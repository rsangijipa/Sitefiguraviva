# P2 Supabase Migration Plan

## Technical Decisions

- Keep Firebase as the legacy runtime until each migrated flow has unit and e2e coverage.
- Use Supabase/Postgres as the target system of record for structured LMS data.
- Preserve current course IDs and legacy Firebase UIDs during migration to avoid breaking URLs, enrollments and support workflows.
- Keep large video delivery outside Supabase Storage. Use Supabase Storage for small documents/images and a video platform for course media.
- Add RLS from the first migration, even while server repositories use the service role.

## Recommended Architecture

```txt
src/
  app/                         Next.js routes and server action adapters
  features/
    courses/
      domain/                  Product types and policies
      application/             Use cases, no vendor SDKs
      infrastructure/          Supabase/Firebase repositories
    enrollments/
    progress/
  infrastructure/
    supabase/                  Supabase clients and generated DB types
    firebase/                  Legacy adapters during migration
  components/
    core/                      Design-system primitives
    ui/                        Visual adapters
```

## Rollout Stages

1. Foundation: schema, clients and parallel repositories.
2. Admin courses: create/edit/list courses in Supabase behind a feature flag.
3. Enrollment: native enrollment approval/payment source of truth in Supabase.
4. Student portal: course access, progress and materials from Supabase.
5. Decommission: remove Firebase reads from migrated critical paths.

## Launch Recommendation

Use Google Forms/WhatsApp as a temporary fallback CTA while native enrollment is hardened. The production target should be native enrollment, but the launch should not depend on unstable Firebase course/enrollment flows.
