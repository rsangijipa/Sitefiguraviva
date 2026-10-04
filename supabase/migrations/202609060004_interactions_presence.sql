create table if not exists public.interaction_stats (
  key text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.presence (
  id text primary key,
  user_id uuid not null,
  context_id text not null,
  name text not null,
  avatar text,
  is_typing boolean not null default false,
  last_seen timestamptz not null default now()
);

create index if not exists presence_context_last_seen_idx on public.presence (context_id, last_seen desc);
alter table public.interaction_stats enable row level security;
alter table public.presence enable row level security;
create policy interaction_stats_public_read on public.interaction_stats for select using (true);
create policy presence_authenticated_read on public.presence for select to authenticated using (true);
create policy presence_authenticated_write on public.presence for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
