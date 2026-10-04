-- P2 LMS foundation for Supabase/Postgres.
-- This migration is additive and keeps legacy Firebase identifiers so routes and imports can migrate gradually.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'tutor', 'student');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'open', 'closed', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.billing_type as enum ('subscription', 'one_time', 'free');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.lesson_type as enum ('video', 'text', 'quiz', 'library', 'live');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.enrollment_status as enum (
    'pending_approval',
    'active',
    'completed',
    'canceled',
    'refunded',
    'pending',
    'expired',
    'locked',
    'awaiting_payment',
    'awaiting_approval',
    'blocked',
    'past_due',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('paid', 'pending', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.progress_status as enum ('completed', 'in_progress');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  legacy_firebase_uid text unique,
  email text not null,
  display_name text,
  photo_url text,
  role public.app_role not null default 'student',
  is_active boolean not null default true,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  subtitle text,
  slug text unique,
  description text,
  cover_image_url text,
  image_url text,
  thumbnail_url text,
  instructor_name text,
  instructor_title text,
  workload_minutes integer check (workload_minutes is null or workload_minutes >= 0),
  duration_label text,
  level text,
  category text,
  is_published boolean not null default false,
  status public.course_status not null default 'draft',
  content_revision integer not null default 1 check (content_revision >= 1),
  billing_type public.billing_type not null default 'free',
  stripe_price_id text,
  stripe_product_id text,
  tags text[] not null default '{}',
  details jsonb not null default '{}'::jsonb,
  team jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  community_enabled boolean not null default false,
  certificate_rules jsonb not null default '{"enabled": false, "minProgressPercent": 100}'::jsonb,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  slug text,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sort_order),
  unique (course_id, slug)
);

create table if not exists public.lessons (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  module_id text not null references public.course_modules(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  slug text,
  type public.lesson_type not null default 'text',
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  video_url text,
  thumbnail_url text,
  blocks jsonb not null default '[]'::jsonb,
  is_free_preview boolean not null default false,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, sort_order),
  unique (course_id, module_id, slug)
);

create table if not exists public.lesson_materials (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  title text not null,
  type text not null check (type in ('pdf', 'link', 'archive')),
  url text not null,
  description text,
  is_published boolean not null default true,
  download_count integer not null default 0 check (download_count >= 0),
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  legacy_firebase_uid text,
  course_id text not null references public.courses(id) on delete cascade,
  user_name text,
  status public.enrollment_status not null default 'pending_approval',
  payment_status public.payment_status,
  subscription_id text,
  enrolled_at timestamptz not null default now(),
  paid_at timestamptz,
  payment_method text check (payment_method is null or payment_method in ('pix', 'stripe', 'subscription', 'free')),
  source_ref text,
  access_until timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  course_version_at_enrollment integer,
  course_snapshot_at_enrollment jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  last_accessed_at timestamptz,
  progress_summary jsonb not null default '{}'::jsonb,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_user_identity_check check (user_id is not null or legacy_firebase_uid is not null)
);

create unique index if not exists enrollments_user_course_uidx
  on public.enrollments (user_id, course_id)
  where user_id is not null;

create unique index if not exists enrollments_legacy_user_course_uidx
  on public.enrollments (legacy_firebase_uid, course_id)
  where legacy_firebase_uid is not null;

create unique index if not exists enrollments_source_ref_uidx
  on public.enrollments (source_ref)
  where source_ref is not null;

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  legacy_firebase_uid text,
  course_id text not null references public.courses(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'in_progress',
  percent numeric(5,2) not null default 0 check (percent >= 0 and percent <= 100),
  max_watched_second integer not null default 0 check (max_watched_second >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint lesson_progress_user_identity_check check (user_id is not null or legacy_firebase_uid is not null)
);

create unique index if not exists lesson_progress_user_lesson_uidx
  on public.lesson_progress (user_id, course_id, lesson_id)
  where user_id is not null;

create unique index if not exists lesson_progress_legacy_user_lesson_uidx
  on public.lesson_progress (legacy_firebase_uid, course_id, lesson_id)
  where legacy_firebase_uid is not null;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  legacy_firebase_uid text,
  course_id text not null references public.courses(id) on delete cascade,
  code text not null unique,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  legacy_payload jsonb not null default '{}'::jsonb,
  constraint certificates_user_identity_check check (user_id is not null or legacy_firebase_uid is not null)
);

create table if not exists public.community_threads (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  legacy_author_firebase_uid text,
  title text not null,
  content text not null,
  author_name text not null,
  author_avatar_url text,
  reply_count integer not null default 0 check (reply_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_deleted boolean not null default false,
  last_reply_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  actor_role text,
  target_collection text not null,
  target_id text not null,
  payload jsonb,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_legacy_firebase_uid_idx on public.profiles (legacy_firebase_uid);
create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists courses_published_status_idx on public.courses (is_published, status);
create index if not exists courses_category_idx on public.courses (category) where category is not null;
create index if not exists course_modules_course_order_idx on public.course_modules (course_id, sort_order);
create index if not exists lessons_course_module_order_idx on public.lessons (course_id, module_id, sort_order);
create index if not exists lessons_published_idx on public.lessons (course_id, is_published);
create index if not exists lesson_materials_course_idx on public.lesson_materials (course_id);
create index if not exists enrollments_course_status_idx on public.enrollments (course_id, status);
create index if not exists enrollments_user_id_idx on public.enrollments (user_id);
create index if not exists enrollments_legacy_firebase_uid_idx on public.enrollments (legacy_firebase_uid);
create index if not exists lesson_progress_course_user_idx on public.lesson_progress (course_id, user_id);
create index if not exists lesson_progress_legacy_course_user_idx on public.lesson_progress (course_id, legacy_firebase_uid);
create index if not exists community_threads_course_last_reply_idx on public.community_threads (course_id, is_deleted, is_pinned desc, last_reply_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs (target_collection, target_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists course_modules_set_updated_at on public.course_modules;
create trigger course_modules_set_updated_at
  before update on public.course_modules
  for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
    and is_active = true
  limit 1
$$;

create or replace function public.current_user_can_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('admin', 'tutor'), false)
$$;

create or replace function public.current_user_can_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

create or replace function public.current_user_can_access_course(course_id_arg text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_can_staff(), false)
    or exists (
      select 1
      from public.enrollments e
      where e.course_id = course_id_arg
        and e.user_id = (select auth.uid())
        and e.status in ('active', 'completed')
        and (e.access_until is null or e.access_until > now())
    )
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.community_threads enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_read_own_or_staff on public.profiles;
create policy profiles_read_own_or_staff on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists profiles_update_own_basic on public.profiles;
create policy profiles_update_own_basic on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses
  for select
  to anon, authenticated
  using (is_published = true and status = 'open');

drop policy if exists courses_staff_read on public.courses;
create policy courses_staff_read on public.courses
  for select
  to authenticated
  using ((select public.current_user_can_staff()));

drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write on public.courses
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists course_modules_read_public_or_enrolled on public.course_modules;
create policy course_modules_read_public_or_enrolled on public.course_modules
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.is_published = true
        and c.status = 'open'
    )
    or (select public.current_user_can_access_course(course_id))
  );

drop policy if exists course_modules_admin_write on public.course_modules;
create policy course_modules_admin_write on public.course_modules
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists lessons_read_public_preview_or_enrolled on public.lessons;
create policy lessons_read_public_preview_or_enrolled on public.lessons
  for select
  to anon, authenticated
  using (
    (
      is_published = true
      and is_free_preview = true
      and exists (
        select 1 from public.courses c
        where c.id = course_id
          and c.is_published = true
          and c.status = 'open'
      )
    )
    or (select public.current_user_can_access_course(course_id))
  );

drop policy if exists lessons_admin_write on public.lessons;
create policy lessons_admin_write on public.lessons
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists lesson_materials_read_enrolled_or_staff on public.lesson_materials;
create policy lesson_materials_read_enrolled_or_staff on public.lesson_materials
  for select
  to authenticated
  using ((select public.current_user_can_access_course(course_id)));

drop policy if exists lesson_materials_admin_write on public.lesson_materials;
create policy lesson_materials_admin_write on public.lesson_materials
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists enrollments_read_own_or_staff on public.enrollments;
create policy enrollments_read_own_or_staff on public.enrollments
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists enrollments_admin_write on public.enrollments;
create policy enrollments_admin_write on public.enrollments
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists lesson_progress_read_own_or_staff on public.lesson_progress;
create policy lesson_progress_read_own_or_staff on public.lesson_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists lesson_progress_write_own on public.lesson_progress;
create policy lesson_progress_write_own on public.lesson_progress
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists certificates_read_own_or_staff on public.certificates;
create policy certificates_read_own_or_staff on public.certificates
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists certificates_admin_write on public.certificates;
create policy certificates_admin_write on public.certificates
  for all
  to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists community_threads_read_enrolled_or_staff on public.community_threads;
create policy community_threads_read_enrolled_or_staff on public.community_threads
  for select
  to authenticated
  using (is_deleted = false and (select public.current_user_can_access_course(course_id)));

drop policy if exists community_threads_write_enrolled_or_staff on public.community_threads;
create policy community_threads_write_enrolled_or_staff on public.community_threads
  for insert
  to authenticated
  with check ((select public.current_user_can_access_course(course_id)));

drop policy if exists community_threads_staff_update on public.community_threads;
create policy community_threads_staff_update on public.community_threads
  for update
  to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select
  to authenticated
  using ((select public.current_user_can_admin()));
