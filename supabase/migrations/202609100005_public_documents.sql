create table if not exists public.public_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 180),
  category text not null default 'public',
  file_url text not null,
  file_path text,
  file_size text,
  file_type text not null default 'pdf',
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_documents_created_at_idx
  on public.public_documents (created_at desc);

alter table public.public_documents enable row level security;

drop policy if exists public_documents_read_published on public.public_documents;
create policy public_documents_read_published on public.public_documents
  for select to anon, authenticated using (is_published = true);
drop policy if exists public_documents_staff_all on public.public_documents;
create policy public_documents_staff_all on public.public_documents
  for all to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop trigger if exists public_documents_set_updated_at on public.public_documents;
create trigger public_documents_set_updated_at
  before update on public.public_documents
  for each row execute function public.set_updated_at();
