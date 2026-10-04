-- Non-partial uniqueness is inferable by PostgREST on_conflict and still
-- permits multiple legacy rows with NULL user_id (PostgreSQL NULL semantics).
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

drop index if exists public.enrollments_user_course_uidx;
create unique index enrollments_user_course_uidx on public.enrollments (user_id, course_id);

drop index if exists public.lesson_progress_user_lesson_uidx;
create unique index lesson_progress_user_lesson_uidx on public.lesson_progress (user_id, course_id, lesson_id);

-- RLS must reject a disabled user even when an old valid access token and
-- an active enrollment still exist. Caller identity comes from Auth only.
create or replace function public.current_user_can_access_course(course_id_arg text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active = true
  ) and (
    coalesce(public.current_user_can_staff(), false)
    or exists (
      select 1 from public.enrollments e
      where e.course_id = course_id_arg
        and e.user_id = (select auth.uid())
        and e.status in ('active', 'completed')
        and (e.access_until is null or e.access_until > now())
    )
  );
$$;

commit;
