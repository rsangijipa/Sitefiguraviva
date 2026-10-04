create table if not exists public.interactive_resource_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_slug text not null,
  session_id text,
  payload jsonb not null default '{}'::jsonb,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.interactive_resource_entries enable row level security;
create index if not exists interactive_resource_entries_user_date_idx on public.interactive_resource_entries (user_id, created_at desc);
drop policy if exists interactive_entries_select_own on public.interactive_resource_entries;
create policy interactive_entries_select_own on public.interactive_resource_entries for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists interactive_entries_insert_own on public.interactive_resource_entries;
create policy interactive_entries_insert_own on public.interactive_resource_entries for insert to authenticated with check (user_id = (select auth.uid()) and is_private = true);
drop policy if exists interactive_entries_update_own on public.interactive_resource_entries;
create policy interactive_entries_update_own on public.interactive_resource_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and is_private = true);
drop policy if exists interactive_entries_delete_own on public.interactive_resource_entries;
create policy interactive_entries_delete_own on public.interactive_resource_entries for delete to authenticated using (user_id = (select auth.uid()));
