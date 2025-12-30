create extension if not exists "uuid-ossp";

-- Tabela de Cursos
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  date text,
  status text,
  link text,
  image text
);

-- Add new columns safely
alter table courses add column if not exists subtitle text;
alter table courses add column if not exists description text;
alter table courses add column if not exists details jsonb; -- { intro, format, schedule }
alter table courses add column if not exists mediators jsonb; -- [{ name, bio, photo }]
alter table courses add column if not exists tags text[];

-- Tabela de Blog (Posts)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  date text,
  excerpt text,
  content text,
  author text,
  "readingTime" text,
  slug text unique
);

-- Add new columns safely
alter table posts add column if not exists type text default 'blog'; -- 'blog' or 'library'
alter table posts add column if not exists pdf_url text;

-- Tabela de Galeria
create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  tags text, -- Pode ser alterado para text[] se preferir arrays
  caption text,
  src text not null
);

-- Configuração de Row Level Security (RLS)

-- Habilitar RLS nas tabelas
alter table courses enable row level security;
alter table posts enable row level security;
alter table gallery enable row level security;

-- Create policies (Idempotent)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public courses are viewable by everyone' and tablename = 'courses') then
    create policy "Public courses are viewable by everyone" on courses for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Public posts are viewable by everyone' and tablename = 'posts') then
    create policy "Public posts are viewable by everyone" on posts for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Public gallery is viewable by everyone' and tablename = 'gallery') then
    create policy "Public gallery is viewable by everyone" on gallery for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can insert courses' and tablename = 'courses') then
    create policy "Authenticated users can insert courses" on courses for insert with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can update courses' and tablename = 'courses') then
    create policy "Authenticated users can update courses" on courses for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can delete courses' and tablename = 'courses') then
    create policy "Authenticated users can delete courses" on courses for delete using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can insert posts' and tablename = 'posts') then
    create policy "Authenticated users can insert posts" on posts for insert with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can update posts' and tablename = 'posts') then
    create policy "Authenticated users can update posts" on posts for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can delete posts' and tablename = 'posts') then
    create policy "Authenticated users can delete posts" on posts for delete using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can insert gallery items' and tablename = 'gallery') then
    create policy "Authenticated users can insert gallery items" on gallery for insert with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can update gallery items' and tablename = 'gallery') then
    create policy "Authenticated users can update gallery items" on gallery for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can delete gallery items' and tablename = 'gallery') then
    create policy "Authenticated users can delete gallery items" on gallery for delete using (auth.role() = 'authenticated');
  end if;
end $$;

-- Storage Buckets (Ensure they exist)
insert into storage.buckets (id, name, public) 
values ('courses', 'courses', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('mediators', 'mediators', true)
on conflict (id) do nothing;

-- Storage Policies (Idempotent)
do $$
begin
  -- Public Read Access
  if not exists (select 1 from pg_policies where policyname = 'Public Access' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Public Access" on storage.objects for select using ( bucket_id in ('courses', 'gallery', 'mediators') );
  end if;

  -- Authenticated Upload Access
  if not exists (select 1 from pg_policies where policyname = 'Authenticated Upload' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated Upload" on storage.objects for insert with check ( auth.role() = 'authenticated' );
  end if;

  -- Authenticated Update Access
  if not exists (select 1 from pg_policies where policyname = 'Authenticated Update' and tablename = 'objects' and schemaname = 'storage') then
     create policy "Authenticated Update" on storage.objects for update using ( auth.role() = 'authenticated' );
  end if;

  -- Authenticated Delete Access
  if not exists (select 1 from pg_policies where policyname = 'Authenticated Delete' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated Delete" on storage.objects for delete using ( auth.role() = 'authenticated' );
  end if;
end $$;
