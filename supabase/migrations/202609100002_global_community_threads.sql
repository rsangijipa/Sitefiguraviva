alter table public.community_threads
  alter column course_id drop not null,
  add column if not exists channel text not null default 'general';

create index if not exists community_threads_global_channel_last_reply_idx
  on public.community_threads (channel, is_deleted, is_pinned desc, last_reply_at desc)
  where course_id is null;

drop policy if exists community_threads_read_enrolled_or_staff on public.community_threads;
create policy community_threads_read_enrolled_or_staff on public.community_threads
  for select
  to authenticated
  using (
    is_deleted = false
    and (course_id is null or (select public.current_user_can_access_course(course_id)))
  );

drop policy if exists community_threads_write_enrolled_or_staff on public.community_threads;
create policy community_threads_write_enrolled_or_staff on public.community_threads
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (course_id is null or (select public.current_user_can_access_course(course_id)))
  );
