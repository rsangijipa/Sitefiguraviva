-- Public CMS runtime domains and the locally sourced third public course.
-- This migration intentionally reads only existing Supabase rows and files
-- shipped with the repository; no Firebase export is involved.

create table if not exists public.public_pages (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique,
  subtitle text,
  excerpt text,
  content text not null default '',
  type text not null default 'article',
  image_url text,
  external_url text,
  pdf_url text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id text primary key default gen_random_uuid()::text,
  image_url text not null,
  title text,
  caption text,
  tags text[] not null default '{}',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  is_published boolean not null default false,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  role text,
  bio text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  legacy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preserve the content that was already public under the former unrestricted
-- site_content policy, then make future rows private by default.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_content'
      and column_name = 'is_published'
  ) then
    alter table public.site_content
      add column is_published boolean not null default false;
    update public.site_content set is_published = true;
  end if;
end
$$;

insert into public.public_pages (key, content, is_published, published_at)
select key, content, is_published, case when is_published then now() else null end
from public.site_content
on conflict (key) do nothing;

insert into public.public_pages (
  key,
  content,
  is_published,
  published_at
) values (
  'home',
  '{"heroTitle":"Figura Viva"}'::jsonb,
  true,
  now()
)
on conflict (key) do nothing;

-- Source: public/cursos/experincia-atemporal/info.txt.
insert into public.courses (
  id,
  title,
  subtitle,
  slug,
  description,
  cover_image_url,
  image_url,
  thumbnail_url,
  category,
  is_published,
  status,
  billing_type,
  tags,
  details,
  team,
  legacy_payload
) values (
  'experiencia-atemporal',
  'Experiência Atemporal',
  'Estudos e experimentação artística a partir do encontro entre Laura Perls e Nancy',
  'experiencia-atemporal',
  'Percorrer o tempo no caminho de Laura desde a intimidade, com arte, história, cartas e composições únicas. Em algumas datas teremos o tempo de pausar, como proposta de acolher o tempo de assimilação das experiências vividas no grupo.',
  '/cursos/experincia-atemporal/capa.jpeg',
  '/cursos/experincia-atemporal/capa.jpeg',
  '/cursos/experincia-atemporal/capa.jpeg',
  'Curso',
  true,
  'open',
  'free',
  array['Online', 'Mensal', 'Gravado', '2026'],
  jsonb_build_object(
    'intro', 'Percorrer o tempo no caminho de Laura desde a intimidade, com arte, história, cartas e composições únicas.',
    'format', jsonb_build_array(
      'Encontros mensais on-line nas sextas-feiras, das 09h às 11h (horário de Brasília), gravados',
      'Material de suporte enviado com antecedência de 30 dias',
      'Estudos e experimentação artística e espaços de pausas',
      'Grupo de suporte, trocas e aquecimento pelo WhatsApp',
      'Material de suporte do livro-guia “Timeless Experience” (tradução livre) + materiais complementares'
    ),
    'schedule', jsonb_build_array(
      '27/02', '27/03', '24/04', '15/05', '26/06', '17/07',
      '07/08', '28/08', '18/09', '09/10', '30/10', '27/11'
    )
  ),
  jsonb_build_array('Wanne Belmiro', 'Lílian Vanessa Nicácio Gusmão'),
  jsonb_build_object(
    'date', 'Início: 27 de fev 2026',
    'link', 'https://www.instagram.com/institutofiguraviva/',
    'mediators', jsonb_build_array('Wanne Belmiro', 'Lílian Vanessa Nicácio Gusmão')
  )
)
on conflict (id) do nothing;

create index if not exists posts_publication_idx
  on public.posts (is_published, published_at desc, created_at desc);
create index if not exists gallery_items_publication_idx
  on public.gallery_items (is_published, created_at desc);
create index if not exists team_members_publication_idx
  on public.team_members (is_published, sort_order);

drop trigger if exists public_pages_set_updated_at on public.public_pages;
create trigger public_pages_set_updated_at
  before update on public.public_pages
  for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.public_pages enable row level security;
alter table public.posts enable row level security;
alter table public.gallery_items enable row level security;
alter table public.team_members enable row level security;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists public_pages_public_read on public.public_pages;
create policy public_pages_public_read on public.public_pages
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists public_pages_admin_write on public.public_pages;
create policy public_pages_admin_write on public.public_pages
  for all to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists gallery_items_public_read on public.gallery_items;
create policy gallery_items_public_read on public.gallery_items
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists gallery_items_admin_write on public.gallery_items;
create policy gallery_items_admin_write on public.gallery_items
  for all to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));

drop policy if exists team_members_public_read on public.team_members;
create policy team_members_public_read on public.team_members
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists team_members_admin_write on public.team_members;
create policy team_members_admin_write on public.team_members
  for all to authenticated
  using ((select public.current_user_can_admin()))
  with check ((select public.current_user_can_admin()));
