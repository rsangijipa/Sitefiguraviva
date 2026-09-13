create table if not exists public.need_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id text not null,
  schema_version integer not null default 1,
  content_version text not null,
  state text not null check (state in ('selected', 'unsure')),
  entries jsonb not null default '[]'::jsonb,
  ordered boolean not null default false,
  focus_entry_id text,
  small_step text check (small_step is null or char_length(small_step) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_request_id)
);

create index if not exists need_records_user_created_idx
  on public.need_records (user_id, created_at desc);

alter table public.need_records enable row level security;

drop policy if exists need_records_select_own on public.need_records;
create policy need_records_select_own on public.need_records
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists need_records_insert_own on public.need_records;
create policy need_records_insert_own on public.need_records
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists need_records_update_own on public.need_records;
create policy need_records_update_own on public.need_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists need_records_delete_own on public.need_records;
create policy need_records_delete_own on public.need_records
  for delete to authenticated using (user_id = (select auth.uid()));
