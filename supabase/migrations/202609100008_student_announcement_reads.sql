create table if not exists public.student_announcement_reads (
  user_id uuid not null references public.profiles(id) on delete cascade,
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table public.student_announcement_reads enable row level security;

drop policy if exists student_announcement_reads_select_own on public.student_announcement_reads;
create policy student_announcement_reads_select_own
  on public.student_announcement_reads for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists student_announcement_reads_insert_own on public.student_announcement_reads;
create policy student_announcement_reads_insert_own
  on public.student_announcement_reads for insert to authenticated
  with check (user_id = (select auth.uid()));
