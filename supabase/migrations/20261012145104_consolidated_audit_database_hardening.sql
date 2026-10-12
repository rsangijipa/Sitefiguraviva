begin;

-- private must remain outside the Data API's exposed schemas.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- Preserve function OIDs: existing policies and triggers keep their dependencies.
-- These lookups need DEFINER to avoid profiles/enrollments RLS recursion.
do $$
declare fn text; signature text; definition text;
begin
  foreach fn in array array['current_auth_session_is_active', 'current_profile_role',
    'current_user_can_access_course', 'current_user_can_admin', 'current_user_can_staff'] loop
    signature := case when fn = 'current_user_can_access_course' then '(text)' else '()' end;
    execute format('alter function public.%I%s set schema private', fn, signature);
  end loop;
  foreach fn in array array['current_auth_session_is_active', 'current_profile_role',
    'current_user_can_access_course', 'current_user_can_admin', 'current_user_can_staff'] loop
    signature := case when fn = 'current_user_can_access_course' then '(text)' else '()' end;
    select pg_get_functiondef(to_regprocedure('private.' || fn || signature)) into definition;
    definition := replace(definition, 'public.current_', 'private.current_');
    execute definition;
    execute format('alter function private.%I%s set search_path = %L', fn, signature, '');
    execute format('revoke all on function private.%I%s from public, anon, authenticated', fn, signature);
    execute format('grant execute on function private.%I%s to anon, authenticated, service_role', fn, signature);
  end loop;
end $$;

-- A global tutor role grants staff capabilities, not enrollment in every course.
create function private.current_user_can_author_course(course_id_arg text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.current_user_can_admin() or (private.current_user_can_staff() and exists (
    select 1 from public.courses c where c.id = course_id_arg
      and c.team -> ((select auth.uid())::text) ->> 'role' in ('author', 'tutor', 'admin')
  ))
$$;
revoke all on function private.current_user_can_author_course(text) from public;
grant execute on function private.current_user_can_author_course(text) to authenticated, service_role;

create or replace function private.current_user_can_access_course(course_id_arg text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active) and (
    private.current_user_can_admin()
    or (private.current_user_can_staff() and exists (
      select 1 from public.courses c where c.id = course_id_arg
        and c.team -> ((select auth.uid())::text) ->> 'role' in ('author', 'tutor', 'admin')
    ))
    or exists (select 1 from public.enrollments e
      where e.course_id = course_id_arg and e.user_id = (select auth.uid())
        and e.status in ('active', 'completed') and (e.access_until is null or e.access_until > now()))
  )
$$;

-- Compatibility for SQL bodies in existing RPCs; only invoker wrappers are exposed.
create function public.current_profile_role() returns public.app_role
language sql stable security invoker set search_path = ''
as $$ select private.current_profile_role() $$;
create function public.current_user_can_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.current_user_can_admin() $$;
create function public.current_user_can_staff() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.current_user_can_staff() $$;
create function public.current_user_can_access_course(course_id_arg text) returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.current_user_can_access_course(course_id_arg) $$;
create function public.current_auth_session_is_active() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.current_auth_session_is_active() $$;
revoke all on function public.current_profile_role(), public.current_user_can_admin(),
  public.current_user_can_staff(), public.current_user_can_access_course(text),
  public.current_auth_session_is_active() from public;
grant execute on function public.current_profile_role(), public.current_user_can_admin(),
  public.current_user_can_staff(), public.current_user_can_access_course(text),
  public.current_auth_session_is_active() to anon, authenticated, service_role;

-- Trigger functions are never user RPCs; trigger invocation does not require EXECUTE.
revoke all on function public.prevent_profile_privilege_escalation(),
  public.prevent_submission_self_grading() from public, anon, authenticated;
alter function public.prevent_profile_privilege_escalation() set search_path = '';
alter function public.prevent_submission_self_grading() set search_path = '';
alter function public.set_updated_at() set search_path = '';

-- Presence context is the community thread id. Non-community contexts (audio)
-- are owner-only because there is no database-backed audience for those ids.
create function private.can_access_presence_context(p_context text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.community_threads t
    where t.id = p_context and not t.is_deleted
      and private.current_user_can_access_course(t.course_id)
  )
$$;
revoke all on function private.can_access_presence_context(text) from public;
grant execute on function private.can_access_presence_context(text) to authenticated, service_role;
create function private.can_publish_presence_context(p_context text) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and (
    not exists (select 1 from public.community_threads t where t.id = p_context)
    or private.can_access_presence_context(p_context))
$$;
revoke all on function private.can_publish_presence_context(text) from public;
grant execute on function private.can_publish_presence_context(text) to authenticated, service_role;
drop policy if exists presence_authenticated_read on public.presence;
drop policy if exists presence_authenticated_write on public.presence;
create policy presence_context_read on public.presence for select to authenticated
using (user_id = (select auth.uid()) or private.can_access_presence_context(context_id));
create policy presence_owner_insert on public.presence for insert to authenticated
with check (user_id = (select auth.uid()));
create policy presence_owner_update on public.presence for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy presence_owner_delete on public.presence for delete to authenticated
using (user_id = (select auth.uid()));
-- A restrictive gate also blocks own-row access for a thread after enrollment expires.
create policy presence_context_restrictive on public.presence as restrictive for all to authenticated
using (private.can_publish_presence_context(context_id))
with check (private.can_publish_presence_context(context_id));

alter table public.announcements add column if not exists publish_at timestamptz;
drop policy if exists announcements_read_all on public.announcements;
create policy announcements_read_audience on public.announcements for select to authenticated
using (
  (publish_at is null or publish_at <= now())
  and (course_id is null or private.current_user_can_access_course(course_id))
  and (coalesce(target_audience, 'all') = 'all'
    or target_audience = private.current_profile_role()::text
    or (target_audience = 'students' and private.current_profile_role()::text = 'student')
    or (target_audience = 'staff' and private.current_user_can_staff()))
);

-- Existing indexes do not cover these foreign keys as their leading column.
create index if not exists lesson_progress_lesson_idx on public.lesson_progress (lesson_id);
create index if not exists assessment_submissions_user_idx on public.assessment_submissions (user_id);
create index if not exists assessment_submissions_assessment_idx on public.assessment_submissions (assessment_id);
create index if not exists certificates_user_idx on public.certificates (user_id);
create index if not exists certificates_course_idx on public.certificates (course_id);
create index if not exists community_replies_thread_idx on public.community_replies (thread_id);
create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists events_course_idx on public.events (course_id);

-- Verification intentionally discloses only the issued certificate's public fields,
-- by exact code, and leaves the certificates table protected by its current RLS.
create function private.verify_public_certificate(p_code text)
returns table (code text, issued_at timestamptz, metadata jsonb)
language sql stable security definer set search_path = '' as $$
  select c.code, c.issued_at, jsonb_strip_nulls(jsonb_build_object(
    'userName', c.metadata->'userName', 'studentName', c.metadata->'studentName',
    'courseTitle', c.metadata->'courseTitle', 'courseName', c.metadata->'courseName',
    'hours', c.metadata->'hours'))
  from public.certificates c
  where c.code = p_code and length(p_code) between 1 and 200
  limit 1
$$;
revoke all on function private.verify_public_certificate(text) from public;
grant execute on function private.verify_public_certificate(text) to anon, authenticated, service_role;
create function public.verify_public_certificate(p_code text)
returns table (code text, issued_at timestamptz, metadata jsonb)
language sql stable security invoker set search_path = '' as $$
  select * from private.verify_public_certificate(p_code)
$$;
revoke all on function public.verify_public_certificate(text) from public;
grant execute on function public.verify_public_certificate(text) to anon, authenticated, service_role;

-- Answer keys cannot be fetched through REST even with ?select=questions.
-- Assessment results are authoritative server writes. RLS SELECT remains intact
-- for the student's own history; neither students nor tutors may forge REST writes.
revoke insert, update, delete on public.assessment_submissions, public.assessment_progress
  from public, anon, authenticated;
do $$ declare target text; columns text; begin
  foreach target in array array['assessment_submissions', 'assessment_progress'] loop
    select string_agg(format('%I', attname), ', ' order by attnum) into columns
    from pg_attribute where attrelid = ('public.' || target)::regclass
      and attnum > 0 and not attisdropped;
    execute format('revoke insert (%s), update (%s) on public.%I from public, anon, authenticated', columns, columns, target);
  end loop;
end $$;
grant select on public.assessment_submissions, public.assessment_progress to authenticated;
grant select, insert, update, delete on public.assessment_submissions, public.assessment_progress to service_role;

-- Scope the student's own history and staff grading queues independently from
-- enrollment: being enrolled as a tutor does not authorize reading classmates' work.
drop policy if exists assessment_submissions_read_own_or_staff on public.assessment_submissions;
create policy assessment_submissions_read_own_or_assigned on public.assessment_submissions
for select to authenticated
using (user_id = (select auth.uid()) or private.current_user_can_author_course(course_id));
drop policy if exists assessment_progress_read_own_or_staff on public.assessment_progress;
create policy assessment_progress_read_own_or_assigned on public.assessment_progress
for select to authenticated
using (user_id = (select auth.uid()) or private.current_user_can_author_course(course_id));
-- Restrictive gates prevent an extra permissive SELECT/ALL policy from widening
-- this audience if another migration later adds such a policy.
create policy assessment_results_audience_restrictive on public.assessment_submissions
as restrictive for select to authenticated
using (user_id = (select auth.uid()) or private.current_user_can_author_course(course_id));
create policy assessment_results_audience_restrictive on public.assessment_progress
as restrictive for select to authenticated
using (user_id = (select auth.uid()) or private.current_user_can_author_course(course_id));

revoke select on public.assessments from public, anon, authenticated;
revoke select (questions) on public.assessments from public, anon, authenticated;
do $$ declare columns text; begin
  select string_agg(format('%I', attname), ', ' order by attnum) into columns
  from pg_attribute where attrelid = 'public.assessments'::regclass
    and attnum > 0 and not attisdropped and attname <> 'questions';
  execute format('grant select (%s) on public.assessments to authenticated', columns);
end $$;
create function private.get_student_assessment(p_assessment_id text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare assessment public.assessments; sanitized jsonb;
begin
  if not private.current_auth_session_is_active() then return null; end if;
  select * into assessment from public.assessments where id = p_assessment_id;
  if not found then return null; end if;
  if private.current_user_can_author_course(assessment.course_id) then return to_jsonb(assessment); end if;
  if assessment.status <> 'published' or not exists (
    select 1 from public.enrollments e
    where e.course_id = assessment.course_id and e.user_id = (select auth.uid())
      and e.status in ('active', 'completed') and (e.access_until is null or e.access_until > now())
  ) then return null; end if;
  select coalesce(jsonb_agg(
    (q - 'correctAnswer' - 'rubric' - 'correctOption' - 'correctOptions' - 'explanation')
    || case when jsonb_typeof(q->'options') = 'array' then jsonb_build_object('options',
      (select coalesce(jsonb_agg(o - 'isCorrect'), '[]'::jsonb) from jsonb_array_elements(q->'options') o))
      else '{}'::jsonb end), '[]'::jsonb)
  into sanitized from jsonb_array_elements(assessment.questions) q;
  return (to_jsonb(assessment) - 'questions') || jsonb_build_object('questions', sanitized);
end $$;
revoke all on function private.get_student_assessment(text) from public;
grant execute on function private.get_student_assessment(text) to authenticated, service_role;
create function public.get_student_assessment(p_assessment_id text) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select private.get_student_assessment(p_assessment_id)
$$;
revoke all on function public.get_student_assessment(text) from public, anon;
grant execute on function public.get_student_assessment(text) to authenticated, service_role;

notify pgrst, 'reload schema';
commit;
