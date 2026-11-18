create table if not exists public.garden_thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id uuid not null default gen_random_uuid(),
  schema_version integer not null default 1,
  content_version text not null default 'v1',
  thought_text text not null check (char_length(thought_text) between 1 and 500),
  optional_title varchar(80),
  status text not null default 'placed' check (status in ('draft','placed','floating','saved')),
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique(user_id, client_request_id)
);

create index if not exists garden_thoughts_user_date_idx 
  on public.garden_thoughts (user_id, created_at desc);

alter table public.garden_thoughts enable row level security;

drop policy if exists garden_thoughts_select_own on public.garden_thoughts;
create policy garden_thoughts_select_own 
  on public.garden_thoughts for select to authenticated 
  using (user_id = (select auth.uid()));

drop policy if exists garden_thoughts_insert_own on public.garden_thoughts;
create policy garden_thoughts_insert_own 
  on public.garden_thoughts for insert to authenticated 
  with check (user_id = (select auth.uid()) and is_private = true);

drop policy if exists garden_thoughts_update_own on public.garden_thoughts;
create policy garden_thoughts_update_own 
  on public.garden_thoughts for update to authenticated 
  using (user_id = (select auth.uid())) 
  with check (user_id = (select auth.uid()) and is_private = true);

drop policy if exists garden_thoughts_delete_own on public.garden_thoughts;
create policy garden_thoughts_delete_own 
  on public.garden_thoughts for delete to authenticated 
  using (user_id = (select auth.uid()));
