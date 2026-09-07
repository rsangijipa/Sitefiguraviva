-- Task 5 engagement domains for Supabase/Postgres.
-- Adds community replies, events, notifications, and gamification tables.

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null references public.community_threads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  legacy_author_firebase_uid text,
  content text not null,
  author_name text not null,
  author_avatar_url text,
  like_count integer not null default 0 check (like_count >= 0),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'cancelled')),
  is_public boolean not null default false,
  course_id text references public.courses(id) on delete set null,
  type text not null default 'webinar' check (type in ('webinar', 'in_person', 'hybrid')),
  join_url text,
  location text,
  cover_image text,
  check_in_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  timestamp timestamptz not null default now(),
  method text not null default 'qr_code',
  unique (event_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text not null,
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gamification_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date timestamptz,
  badges text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount > 0),
  reason text not null check (
    reason in ('lesson_completed', 'quiz_passed', 'course_completed', 'daily_login', 'bonus', 'admin_reward')
  ),
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create table if not exists public.earned_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null,
  course_id text references public.courses(id) on delete set null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id, course_id)
);

drop trigger if exists community_replies_set_updated_at on public.community_replies;
create trigger community_replies_set_updated_at
  before update on public.community_replies
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

drop trigger if exists gamification_profiles_set_updated_at on public.gamification_profiles;
create trigger gamification_profiles_set_updated_at
  before update on public.gamification_profiles
  for each row execute function public.set_updated_at();

alter table public.community_replies enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.notifications enable row level security;
alter table public.gamification_profiles enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.earned_badges enable row level security;

drop policy if exists community_replies_read_enrolled_or_staff on public.community_replies;
create policy community_replies_read_enrolled_or_staff on public.community_replies
  for select
  to authenticated
  using (
    is_deleted = false
    and exists (
      select 1
      from public.community_threads t
      where t.id = thread_id
        and (select public.current_user_can_access_course(t.course_id))
    )
  );

drop policy if exists community_replies_write_enrolled_or_staff on public.community_replies;
create policy community_replies_write_enrolled_or_staff on public.community_replies
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.community_threads t
      where t.id = thread_id
        and (select public.current_user_can_access_course(t.course_id))
    )
  );

drop policy if exists community_replies_update_staff on public.community_replies;
create policy community_replies_update_staff on public.community_replies
  for update
  to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select
  to anon, authenticated
  using (is_public = true and status in ('scheduled', 'live') and starts_at >= now());

drop policy if exists events_staff_write on public.events;
create policy events_staff_write on public.events
  for all
  to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop policy if exists event_attendance_read_own_or_staff on public.event_attendance;
create policy event_attendance_read_own_or_staff on public.event_attendance
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists event_attendance_write_own on public.event_attendance;
create policy event_attendance_write_own on public.event_attendance
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists notifications_write_own_or_staff on public.notifications;
create policy notifications_write_own_or_staff on public.notifications
  for update
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()))
  with check (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists notifications_insert_staff on public.notifications;
create policy notifications_insert_staff on public.notifications
  for insert
  to authenticated
  with check ((select public.current_user_can_staff()));

drop policy if exists gamification_profiles_read_own_or_staff on public.gamification_profiles;
create policy gamification_profiles_read_own_or_staff on public.gamification_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists gamification_profiles_write_staff on public.gamification_profiles;
create policy gamification_profiles_write_staff on public.gamification_profiles
  for all
  to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop policy if exists xp_transactions_read_own_or_staff on public.xp_transactions;
create policy xp_transactions_read_own_or_staff on public.xp_transactions
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists xp_transactions_write_staff on public.xp_transactions;
create policy xp_transactions_write_staff on public.xp_transactions
  for insert
  to authenticated
  with check ((select public.current_user_can_staff()));

drop policy if exists earned_badges_read_own_or_staff on public.earned_badges;
create policy earned_badges_read_own_or_staff on public.earned_badges
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_staff()));

drop policy if exists earned_badges_write_staff on public.earned_badges;
create policy earned_badges_write_staff on public.earned_badges
  for insert
  to authenticated
  with check ((select public.current_user_can_staff()));
