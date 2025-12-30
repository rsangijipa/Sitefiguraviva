/*
    MIGRATION SCRIPT FOR NEW FEATURES
    - Create `site_content` table for dynamic settings (Founder, Institute info)
    - Create `team_members` table for the Institute team section
*/

-- 1. Create table for site content/config
create table if not exists public.site_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.site_content enable row level security;

-- Policies for site_content
create policy "Public can read site content"
  on public.site_content for select
  to public
  using (true);

create policy "Admins can update site content"
  on public.site_content for all
  to authenticated
  using (true);

-- Insert default data for Founder
insert into public.site_content (key, content)
values (
  'founder',
  jsonb_build_object(
    'name', 'Lilian Vanessa Nicacio Gusmão Vianei',
    'role', 'Psicóloga e Gestalt-terapeuta',
    'bio', 'Psicóloga, gestalt-terapeuta e pesquisadora, com trajetória que integra clínica, docência e estudos em trauma, psicoterapia corporal e neurodiversidades, além de perspectivas feministas e decoloniais.',
    'image', '/assets/lilian.jpeg', 
    'link', 'http://lattes.cnpq.br/'
  )
) on conflict (key) do nothing;

-- Insert default data for Institute
insert into public.site_content (key, content)
values (
  'institute',
  jsonb_build_object(
    'title', 'O Instituto Figura Viva',
    'subtitle', 'Um espaço vivo de acolhimento clínico e formação profissional — onde o encontro transforma.',
    'manifesto_title', 'Habitar a Fronteira',
    'manifesto_text', 'Na Gestalt, a vida acontece no contato: na fronteira entre organismo e ambiente, entre o que sinto e o que digo, entre o que foi e o que pode nascer agora. No Figura Viva, a gente leva isso a sério — com rigor, com ética e com humanidade.',
    'quote', 'O encontro é a fronteira onde a vida se renova.',
    'address', 'Rua Pinheiro Machado, 2033 – Central, Porto Velho – RO • CEP 76801-057',
    'phone', '(69) 99248-1585'
  )
) on conflict (key) do nothing;


-- 2. Create table for Team Members
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  bio text,
  image text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.team_members enable row level security;

-- Policies for team_members
create policy "Public can read team members"
  on public.team_members for select
  to public
  using (true);

create policy "Admins can manage team members"
  on public.team_members for all
  to authenticated
  using (true);
