-- P2 LMS extended tables for Supabase/Postgres
-- Supporting site_content, assessments, assessment_submissions, assessment_progress, announcements

-- 1. Site Content (Configurações institucionais e páginas estáticas)
create table if not exists public.site_content (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Assessments (Avaliações / Quizzes)
create table if not exists public.assessments (
  id text primary key default gen_random_uuid()::text,
  course_id text not null references public.courses(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  title text not null,
  description text,
  passing_score numeric(5,2) not null default 70.00 check (passing_score >= 0 and passing_score <= 100),
  total_points integer not null default 0,
  questions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Assessment Submissions (Submissões de alunos)
create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  assessment_id text not null references public.assessments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  legacy_firebase_uid text,
  course_id text not null references public.courses(id) on delete cascade,
  attempt_number integer not null default 1,
  answers jsonb not null default '[]'::jsonb,
  score numeric(6,2) not null default 0,
  percentage numeric(5,2) not null default 0,
  passed boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'graded')),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Assessment Progress
create table if not exists public.assessment_progress (
  id uuid primary key default gen_random_uuid(),
  assessment_id text not null references public.assessments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  legacy_firebase_uid text,
  course_id text not null references public.courses(id) on delete cascade,
  attempts integer not null default 0,
  best_score numeric(6,2) not null default 0,
  best_percentage numeric(5,2) not null default 0,
  passed boolean not null default false,
  last_attempt_at timestamptz,
  submissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, assessment_id)
);

-- 5. Announcements (Avisos da plataforma)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  course_id text references public.courses(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  is_pinned boolean not null default false,
  target_audience text default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers para updated_at
drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

drop trigger if exists assessments_set_updated_at on public.assessments;
create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

drop trigger if exists assessment_submissions_set_updated_at on public.assessment_submissions;
create trigger assessment_submissions_set_updated_at
  before update on public.assessment_submissions
  for each row execute function public.set_updated_at();

drop trigger if exists assessment_progress_set_updated_at on public.assessment_progress;
create trigger assessment_progress_set_updated_at
  before update on public.assessment_progress
  for each row execute function public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- RLS Policies
alter table public.site_content enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.assessment_progress enable row level security;
alter table public.announcements enable row level security;

-- Site Content
drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content for select to anon, authenticated using (true);
drop policy if exists site_content_admin_all on public.site_content;
create policy site_content_admin_all on public.site_content for all to authenticated using ((select public.current_user_can_admin())) with check ((select public.current_user_can_admin()));

-- Assessments
drop policy if exists assessments_read_enrolled on public.assessments;
create policy assessments_read_enrolled on public.assessments for select to authenticated using ((select public.current_user_can_access_course(course_id)));
drop policy if exists assessments_admin_all on public.assessments;
create policy assessments_admin_all on public.assessments for all to authenticated using ((select public.current_user_can_admin())) with check ((select public.current_user_can_admin()));

-- Assessment Submissions
drop policy if exists assessment_submissions_read_own_or_staff on public.assessment_submissions;
create policy assessment_submissions_read_own_or_staff on public.assessment_submissions for select to authenticated using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));
drop policy if exists assessment_submissions_write_own on public.assessment_submissions;
create policy assessment_submissions_write_own on public.assessment_submissions for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists assessment_submissions_update_own_or_staff on public.assessment_submissions;
create policy assessment_submissions_update_own_or_staff on public.assessment_submissions for update to authenticated using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

-- Assessment Progress
drop policy if exists assessment_progress_read_own_or_staff on public.assessment_progress;
create policy assessment_progress_read_own_or_staff on public.assessment_progress for select to authenticated using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

-- Announcements
drop policy if exists announcements_read_all on public.announcements;
create policy announcements_read_all on public.announcements for select to authenticated using (true);
drop policy if exists announcements_admin_all on public.announcements;
create policy announcements_admin_all on public.announcements for all to authenticated using ((select public.current_user_can_admin())) with check ((select public.current_user_can_admin()));
