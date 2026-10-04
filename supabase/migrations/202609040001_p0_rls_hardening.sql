-- P0 security hardening — closes privilege-escalation and integrity gaps
-- flagged in docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md (P0-01, P0-02, P0-03).
--
-- Postgres RLS policies (USING/WITH CHECK) operate on whole rows, not
-- individual columns, so "users may update their own row" policies cannot by
-- themselves stop a student from also flipping governance columns (role,
-- is_active) or grading fields (score, passed, status). The fix is a
-- BEFORE UPDATE trigger that inspects OLD vs NEW and rejects changes to
-- protected columns unless the actor is staff/admin, or the write comes from
-- a context with no Supabase JWT (service-role/service_role key, migrations,
-- server actions using the service client) — those already bypass RLS
-- entirely and are trusted.

-- ---------------------------------------------------------------------------
-- P0-01: profiles — block self-elevation of role/is_active/billing linkage
-- ---------------------------------------------------------------------------

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No JWT on the connection (service-role/back-office writes) is already
  -- trusted — it bypasses RLS entirely, so this trigger only needs to guard
  -- requests made as `authenticated`.
  if auth.uid() is null then
    return new;
  end if;

  if public.current_user_can_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.legacy_firebase_uid is distinct from old.legacy_firebase_uid
     or new.id is distinct from old.id then
    raise exception 'Not authorized to modify governance fields on profiles' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ---------------------------------------------------------------------------
-- P0-02: assessment_submissions — block students from grading themselves
-- ---------------------------------------------------------------------------

create or replace function public.prevent_submission_self_grading()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.current_user_can_staff() then
    return new;
  end if;

  -- A student may only touch their own in-progress submission, and only to
  -- add answers or move it from pending -> submitted. Grading fields and
  -- routing fields are staff/server-only.
  if new.user_id is distinct from old.user_id
     or new.assessment_id is distinct from old.assessment_id
     or new.course_id is distinct from old.course_id
     or new.score is distinct from old.score
     or new.percentage is distinct from old.percentage
     or new.passed is distinct from old.passed
     or new.feedback is distinct from old.feedback
     or new.graded_by is distinct from old.graded_by
     or new.graded_at is distinct from old.graded_at
     or (old.status = 'graded')
     or (new.status not in ('pending', 'submitted')) then
    raise exception 'Not authorized to modify grading fields on assessment_submissions' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists assessment_submissions_prevent_self_grading on public.assessment_submissions;
create trigger assessment_submissions_prevent_self_grading
  before update on public.assessment_submissions
  for each row execute function public.prevent_submission_self_grading();

-- Students could previously create a submission for any course_id as long as
-- user_id matched them, regardless of enrollment. Require course access too.
drop policy if exists assessment_submissions_write_own on public.assessment_submissions;
create policy assessment_submissions_write_own on public.assessment_submissions
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_user_can_access_course(course_id))
  );

-- ---------------------------------------------------------------------------
-- P0-03: lesson_progress — require active enrollment + a real, published lesson
-- ---------------------------------------------------------------------------

drop policy if exists lesson_progress_write_own on public.lesson_progress;

create policy lesson_progress_insert_own on public.lesson_progress
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_user_can_access_course(course_id))
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id
        and l.course_id = lesson_progress.course_id
        and l.is_published = true
    )
  );

create policy lesson_progress_update_own on public.lesson_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (select public.current_user_can_access_course(course_id))
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_id
        and l.course_id = lesson_progress.course_id
        and l.is_published = true
    )
  );

create policy lesson_progress_delete_own on public.lesson_progress
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
