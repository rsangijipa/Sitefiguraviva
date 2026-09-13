create table if not exists public.awareness_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (action_type in ('click', 'favorite', 'random', 'theme_filter')),
  quote_id text,
  theme text not null default 'all',
  created_at timestamptz not null default now()
);

create index if not exists awareness_interactions_user_created_idx
  on public.awareness_interactions (user_id, created_at desc);

alter table public.awareness_interactions enable row level security;

drop policy if exists awareness_interactions_select_own on public.awareness_interactions;
create policy awareness_interactions_select_own on public.awareness_interactions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists awareness_interactions_insert_own on public.awareness_interactions;
create policy awareness_interactions_insert_own on public.awareness_interactions
  for insert to authenticated with check (user_id = (select auth.uid()));

create table if not exists public.awareness_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id text not null check (char_length(quote_id) between 1 and 128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);

alter table public.awareness_favorites enable row level security;

drop policy if exists awareness_favorites_select_own on public.awareness_favorites;
create policy awareness_favorites_select_own on public.awareness_favorites
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists awareness_favorites_insert_own on public.awareness_favorites;
create policy awareness_favorites_insert_own on public.awareness_favorites
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists awareness_favorites_update_own on public.awareness_favorites;
create policy awareness_favorites_update_own on public.awareness_favorites
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists awareness_favorites_delete_own on public.awareness_favorites;
create policy awareness_favorites_delete_own on public.awareness_favorites
  for delete to authenticated using (user_id = (select auth.uid()));
