-- ====================================================================
-- Migração Supabase / PostgreSQL: Instituto Figura Viva
-- Módulo: Recursos Interativos — Necessidades Agora (Registro Confluência)
-- ====================================================================

-- 1. Tabela de sessões de recursos interativos
create table if not exists public.interactive_resource_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_slug text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_res 
  on public.interactive_resource_sessions (user_id, resource_slug, created_at desc);

-- 2. Tabela genérica para entradas de conteúdo pessoal
create table if not exists public.interactive_resource_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_slug text not null,
  session_id uuid references public.interactive_resource_sessions(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entries_user_res 
  on public.interactive_resource_entries (user_id, resource_slug, created_at desc);

-- 3. Tabela especializada: Registros de Necessidades Agora (need_records)
create table if not exists public.need_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id uuid not null,
  schema_version integer not null default 1,
  content_version text not null default '1.0.0',
  state text not null check (state in ('selected', 'unsure')),
  entries jsonb not null default '[]'::jsonb,
  ordered boolean not null default false,
  focus_entry_id text,
  small_step text check (small_step is null or char_length(small_step) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_need_records_user_req unique (user_id, client_request_id),
  constraint ck_entries_max_five check (jsonb_array_length(entries) <= 5)
);

-- Índice composto para paginação otimizada do histórico pessoal
create index if not exists idx_need_records_user_created 
  on public.need_records (user_id, created_at desc, id);

-- 4. Tabela de versões de conteúdo editorial (CMS do catálogo administrável)
create table if not exists public.resource_content_versions (
  id uuid primary key default gen_random_uuid(),
  resource_key text not null,
  version text not null,
  status text not null check (status in ('draft', 'published', 'archived')),
  configuration jsonb not null,
  published_by text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_resource_content_versions unique (resource_key, version)
);

-- ====================================================================
-- POLÍTICAS DE SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- Habilitação obrigatória de RLS
alter table public.interactive_resource_sessions enable row level security;
alter table public.interactive_resource_entries enable row level security;
alter table public.need_records enable row level security;
alter table public.resource_content_versions enable row level security;

-- A) Políticas para need_records (Privacidade estrita do aluno)
-- O aluno lê, insere, atualiza e remove apenas seus próprios registros.
-- Nenhum acesso geral concedido a outros alunos ou administradores.
create policy "Alunos leem apenas seus proprios registros de necessidades"
  on public.need_records
  for select
  using (auth.uid() = user_id);

create policy "Alunos inserem seus proprios registros de necessidades"
  on public.need_records
  for insert
  with check (auth.uid() = user_id);

create policy "Alunos atualizam apenas seus proprios registros de necessidades"
  on public.need_records
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Alunos removem apenas seus proprios registros de necessidades"
  on public.need_records
  for delete
  using (auth.uid() = user_id);

-- B) Políticas para interactive_resource_sessions
create policy "Alunos leem apenas suas proprias sessoes"
  on public.interactive_resource_sessions
  for select
  using (auth.uid() = user_id);

create policy "Alunos criam suas proprias sessoes"
  on public.interactive_resource_sessions
  for insert
  with check (auth.uid() = user_id);

-- C) Políticas para interactive_resource_entries
create policy "Alunos leem apenas suas proprias entradas intimas"
  on public.interactive_resource_entries
  for select
  using (auth.uid() = user_id);

create policy "Alunos criam apenas suas proprias entradas"
  on public.interactive_resource_entries
  for insert
  with check (auth.uid() = user_id);

-- D) Políticas para resource_content_versions (Catálogo editorial)
-- Todos os alunos autenticados podem ler versões 'published'
create policy "Alunos leem versoes publicadas do catalogo"
  on public.resource_content_versions
  for select
  using (status = 'published');

-- Administradores autenticados podem gerenciar versões editoriais
create policy "Admins gerenciam versoes do catalogo editorial"
  on public.resource_content_versions
  for all
  using (
    (auth.jwt() ->> 'role') = 'admin' or 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
