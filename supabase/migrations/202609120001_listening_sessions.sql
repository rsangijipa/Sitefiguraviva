create table if not exists public.listening_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id uuid not null,
  schema_version integer not null default 1,
  content_version text not null,
  mode text not null check (mode in ('guided', 'free', 'text')),
  duration_seconds integer not null check (duration_seconds >= 0),
  observations jsonb not null default '[]'::jsonb check (jsonb_array_length(observations) <= 10),
  reflection varchar(500),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, client_request_id)
);
create index if not exists listening_sessions_user_date_idx on public.listening_sessions (user_id, created_at desc, id);
alter table public.listening_sessions enable row level security;
create policy "listening_sessions_select_own" on public.listening_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "listening_sessions_insert_own" on public.listening_sessions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "listening_sessions_update_own" on public.listening_sessions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "listening_sessions_delete_own" on public.listening_sessions for delete to authenticated using (user_id = (select auth.uid()));
