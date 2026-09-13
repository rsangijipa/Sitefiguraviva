create table if not exists public.book_recommendations (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 200),
  author text not null check (char_length(trim(author)) between 1 and 160),
  description text not null default '',
  cover_image_url text not null,
  cover_storage_path text not null,
  purchase_url text not null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists book_recommendations_published_order_idx
  on public.book_recommendations (is_published, sort_order);

alter table public.book_recommendations enable row level security;

drop policy if exists book_recommendations_read_published on public.book_recommendations;
create policy book_recommendations_read_published on public.book_recommendations
  for select to anon, authenticated using (is_published = true);

drop policy if exists book_recommendations_staff_all on public.book_recommendations;
create policy book_recommendations_staff_all on public.book_recommendations
  for all to authenticated
  using ((select public.current_user_can_staff()))
  with check ((select public.current_user_can_staff()));

drop trigger if exists book_recommendations_set_updated_at on public.book_recommendations;
create trigger book_recommendations_set_updated_at
  before update on public.book_recommendations
  for each row execute function public.set_updated_at();
