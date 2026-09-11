create table if not exists public.analytics_events (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  source text not null default 'client',
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
create index if not exists analytics_events_user_timestamp_idx
  on public.analytics_events (user_id, timestamp desc);

drop policy if exists analytics_events_insert_own on public.analytics_events;
create policy analytics_events_insert_own on public.analytics_events
  for insert to authenticated
  with check (
    (user_id = (select auth.uid()) or (select public.current_user_can_staff()))
    and (actor_user_id is null or actor_user_id = (select auth.uid()))
  );

drop policy if exists analytics_events_read_staff on public.analytics_events;
create policy analytics_events_read_staff on public.analytics_events
  for select to authenticated
  using ((select public.current_user_can_staff()));
