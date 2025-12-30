-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tabela de Cursos
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  date text,
  status text,
  link text,
  image text,
  description text
);

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

-- Políticas de Leitura (Públicas)
create policy "Public courses are viewable by everyone" on courses
  for select using (true);

create policy "Public posts are viewable by everyone" on posts
  for select using (true);

create policy "Public gallery is viewable by everyone" on gallery
  for select using (true);

-- Políticas de Escrita (Apenas Autenticados)
-- Assumindo que apenas usuários autenticados (admins) podem modificar dados
create policy "Authenticated users can insert courses" on courses
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update courses" on courses
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete courses" on courses
  for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can insert posts" on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update posts" on posts
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete posts" on posts
  for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can insert gallery items" on gallery
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update gallery items" on gallery
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete gallery items" on gallery
  for delete using (auth.role() = 'authenticated');

-- Storage Buckets (Executar manualmente se não existirem, ou via dashboard)
-- insert into storage.buckets (id, name, public) values ('courses', 'courses', true);
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);

-- Políticas de Storage (Exemplo)
-- create policy "Public Access" on storage.objects for select using ( bucket_id in ('courses', 'gallery') );
-- create policy "Auth Upload" on storage.objects for insert with check ( auth.role() = 'authenticated' );
