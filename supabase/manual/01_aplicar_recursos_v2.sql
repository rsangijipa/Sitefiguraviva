-- GERADO por scripts/build-recursos-v2-bundle.mjs — não edite à mão.

-- Aplica os Recursos Interativos v2 numa única transação pelo SQL Editor do Supabase.

-- Antes, rode 00_diagnostico_recursos_v2.sql. Qualquer erro desfaz o script inteiro.

begin;

-- 1. Checagem prévia

do $$
declare missing text[] := array[]::text[];
begin
 if to_regtype('public.fv_resource_key') is not null then
  raise exception 'Os Recursos Interativos v2 já estão aplicados. Rode apenas supabase/migrations/20261013090000_recursos_editorial_devolucao.sql se a coluna review_note ainda não existir.';
 end if;
 if to_regclass('public.profiles') is null then missing := array_append(missing, 'tabela public.profiles (202606110001_p2_lms_foundation)'); end if;
 if to_regclass('public.courses') is null then missing := array_append(missing, 'tabela public.courses (202606110001_p2_lms_foundation)'); end if;
 if to_regclass('public.enrollments') is null then missing := array_append(missing, 'tabela public.enrollments (202606110001_p2_lms_foundation)'); end if;
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='courses' and column_name='is_published')
  or not exists(select 1 from information_schema.columns where table_schema='public' and table_name='courses' and column_name='status') then
  missing := array_append(missing, 'colunas courses.is_published e courses.status');
 end if;
 if to_regprocedure('private.current_auth_session_is_active()') is null then missing := array_append(missing, 'função private.current_auth_session_is_active (20261012145104_consolidated_audit_database_hardening)'); end if;
 if to_regprocedure('private.current_user_can_admin()') is null then missing := array_append(missing, 'função private.current_user_can_admin (20261012145104_consolidated_audit_database_hardening)'); end if;
 if to_regprocedure('private.current_user_can_staff()') is null then missing := array_append(missing, 'função private.current_user_can_staff (20261012145104_consolidated_audit_database_hardening)'); end if;
 if array_length(missing, 1) > 0 then
  raise exception 'Pré-requisitos ausentes. Aplique antes: %', array_to_string(missing, '; ');
 end if;
end $$;

-- 2. Tabelas legadas de recursos · 202609100010_interactive_resource_entries.sql
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
drop policy if exists interactive_entries_select_own on public.interactive_resource_entries;
create policy interactive_entries_select_own on public.interactive_resource_entries for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists interactive_entries_insert_own on public.interactive_resource_entries;
drop policy if exists interactive_entries_insert_own on public.interactive_resource_entries;
create policy interactive_entries_insert_own on public.interactive_resource_entries for insert to authenticated with check (user_id = (select auth.uid()) and is_private = true);
drop policy if exists interactive_entries_update_own on public.interactive_resource_entries;
drop policy if exists interactive_entries_update_own on public.interactive_resource_entries;
create policy interactive_entries_update_own on public.interactive_resource_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and is_private = true);
drop policy if exists interactive_entries_delete_own on public.interactive_resource_entries;
drop policy if exists interactive_entries_delete_own on public.interactive_resource_entries;
create policy interactive_entries_delete_own on public.interactive_resource_entries for delete to authenticated using (user_id = (select auth.uid()));

-- 2. Tabelas legadas de recursos · 202609110011_pause_sessions.sql
-- Pause sessions: private records of brief pause practices completed by users
CREATE TABLE IF NOT EXISTS public.pause_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id text NOT NULL CHECK (practice_id IN ('breathing', 'observing', 'listening', 'movement', 'slowing')),
  planned_duration_seconds integer NOT NULL CHECK (planned_duration_seconds IN (120, 180, 300)),
  active_duration_seconds integer NOT NULL DEFAULT 0 CHECK (active_duration_seconds >= 0),
  ended_by text NOT NULL DEFAULT 'user' CHECK (ended_by IN ('timer', 'user', 'switch')),
  reflection text NULL CHECK (length(reflection) IS NULL OR length(reflection) <= 500),
  content_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Idempotency key to prevent double-submit
  client_request_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pause_sessions_user_created 
  ON public.pause_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pause_sessions_user_id 
  ON public.pause_sessions(user_id);

-- RLS policies
ALTER TABLE public.pause_sessions ENABLE ROW LEVEL SECURITY;

drop policy if exists "users_select_own_pause_sessions" on public.pause_sessions;

CREATE POLICY "users_select_own_pause_sessions"
  ON public.pause_sessions FOR SELECT
  USING (auth.uid() = user_id);

drop policy if exists "users_insert_own_pause_sessions" on public.pause_sessions;

CREATE POLICY "users_insert_own_pause_sessions"
  ON public.pause_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

drop policy if exists "users_update_own_pause_sessions" on public.pause_sessions;

CREATE POLICY "users_update_own_pause_sessions"
  ON public.pause_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

drop policy if exists "users_delete_own_pause_sessions" on public.pause_sessions;

CREATE POLICY "users_delete_own_pause_sessions"
  ON public.pause_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.pause_sessions IS 'Private pause session records. Teachers/tutors/students cannot access each other''s data.';

-- 2. Tabelas legadas de recursos · 202609120001_listening_sessions.sql
create table if not exists public.listening_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_request_id uuid not null,
  schema_version integer not null default 1,
  content_version text not null,
  mode text not null check (mode in ('guided', 'free', 'text')),
  duration_seconds integer not null check (duration_seconds >= 0),
  observations jsonb not null default '[]'::jsonb check (jsonb_array_length(observations) <= 10),
  reflection varchar(500),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, client_request_id)
);
create index if not exists listening_sessions_user_date_idx on public.listening_sessions (user_id, created_at desc, id);
alter table public.listening_sessions enable row level security;
drop policy if exists "listening_sessions_select_own" on public.listening_sessions;
create policy "listening_sessions_select_own" on public.listening_sessions for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "listening_sessions_insert_own" on public.listening_sessions;
create policy "listening_sessions_insert_own" on public.listening_sessions for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "listening_sessions_update_own" on public.listening_sessions;
create policy "listening_sessions_update_own" on public.listening_sessions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "listening_sessions_delete_own" on public.listening_sessions;
create policy "listening_sessions_delete_own" on public.listening_sessions for delete to authenticated using (user_id = (select auth.uid()));

-- 2. Tabelas legadas de recursos · 202609120002_river_sessions.sql
CREATE TABLE IF NOT EXISTS public.river_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  schema_version integer NOT NULL DEFAULT 1,
  content_version text NOT NULL DEFAULT 'v1' CHECK (char_length(content_version) BETWEEN 1 AND 80),
  mode text NOT NULL CHECK (mode IN ('timed', 'free')),
  planned_duration_seconds integer NULL,
  active_duration_seconds integer NOT NULL CHECK (active_duration_seconds BETWEEN 0 AND 86400),
  reflection text NULL CHECK (reflection IS NULL OR char_length(reflection) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT river_sessions_mode_duration_check CHECK (
    (mode = 'timed' AND planned_duration_seconds IN (120, 180, 300))
    OR (mode = 'free' AND planned_duration_seconds IS NULL)
  ),
  CONSTRAINT river_sessions_user_request_unique UNIQUE (user_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS river_sessions_user_created_id_idx
  ON public.river_sessions (user_id, created_at DESC, id DESC);

ALTER TABLE public.river_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS river_sessions_select_own ON public.river_sessions;
drop policy if exists river_sessions_select_own on public.river_sessions;
CREATE POLICY river_sessions_select_own ON public.river_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_insert_own ON public.river_sessions;
drop policy if exists river_sessions_insert_own on public.river_sessions;
CREATE POLICY river_sessions_insert_own ON public.river_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_update_own ON public.river_sessions;
drop policy if exists river_sessions_update_own on public.river_sessions;
CREATE POLICY river_sessions_update_own ON public.river_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS river_sessions_delete_own ON public.river_sessions;
drop policy if exists river_sessions_delete_own on public.river_sessions;
CREATE POLICY river_sessions_delete_own ON public.river_sessions
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

COMMENT ON TABLE public.river_sessions IS
  'Private, optional Thought River completion records. Deliberately contains no leaf or draft text.';

-- 2. Tabelas legadas de recursos · 202609130008_need_records.sql
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
drop policy if exists need_records_select_own on public.need_records;
create policy need_records_select_own on public.need_records
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists need_records_insert_own on public.need_records;
drop policy if exists need_records_insert_own on public.need_records;
create policy need_records_insert_own on public.need_records
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists need_records_update_own on public.need_records;
drop policy if exists need_records_update_own on public.need_records;
create policy need_records_update_own on public.need_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists need_records_delete_own on public.need_records;
drop policy if exists need_records_delete_own on public.need_records;
create policy need_records_delete_own on public.need_records
  for delete to authenticated using (user_id = (select auth.uid()));

-- 3. Recursos Interativos v2 · 20261012161154_recursos_interativos_v2.sql
-- Local migration only. No legacy pedagogical text is approved or seeded.
create type public.fv_resource_key as enum (
 'cartas-gestalticas','figura-e-fundo','ciclo-do-contato','fronteiras-de-contato','casoteca',
 'polaridades-e-cadeiras','chegada','mapa-do-corpo','roda-das-emocoes','necessidades-agora',
 'paisagem-de-pensamentos','sons-para-awareness','sala-de-pausa','igarape',
 'laboratorio-fenomenologico','atelie-do-experimento','escuta-dialogica'
);
create type public.fv_editorial_role as enum ('docente_autor','docente_revisor');
create type public.fv_editorial_status as enum ('draft','submitted','reviewed','published','archived');

create table public.resource_editorial_roles (
 user_id uuid not null references public.profiles(id) on delete cascade,
 role public.fv_editorial_role not null,
 name text not null check(char_length(trim(name)) between 3 and 160),
 crp text not null check(crp ~ '^[0-9]{2}/[0-9]{3,8}$'),
 primary key(user_id,role)
);
create table public.resource_art_approvals (
 id uuid primary key default gen_random_uuid(), kit_version text not null,
 approved_by text not null check(approved_by = 'Lilian Gusmão'),
 approved_at timestamptz not null, assets jsonb not null check(jsonb_typeof(assets)='array'),
 evidence text not null check(char_length(evidence) between 1 and 2000)
);
create table public.resource_release_checks (
 id text primary key check(id='history-v2'),
 release_id uuid not null default gen_random_uuid(),
 backup_max_days integer not null default 30 check(backup_max_days between 1 and 30),
 restoration_verified_at timestamptz, ledger_verified_at timestamptz, purge_verified_at timestamptz,
 enabled boolean not null default false,
 verified_by uuid references public.profiles(id),
 check(not enabled or (verified_by is not null and restoration_verified_at is not null and ledger_verified_at is not null and purge_verified_at is not null))
);
insert into public.resource_release_checks(id) values('history-v2');

create table public.resource_formation_retention (
 enrollment_id uuid primary key references public.enrollments(id) on delete restrict,
 user_id uuid not null references public.profiles(id) on delete cascade,
 course_id text not null references public.courses(id) on delete restrict,
 title text not null, end_date timestamptz not null, departure_date timestamptz,
 updated_at timestamptz not null default now()
);
create table public.resource_content_versions (
 id uuid primary key default gen_random_uuid(),
 resource_key public.fv_resource_key not null, version integer not null check(version>0),
 status public.fv_editorial_status not null default 'draft',
 configuration jsonb not null check(jsonb_typeof(configuration)='object' and octet_length(configuration::text)<=524288),
 authored_by uuid references public.profiles(id),
 reviewer_id uuid references public.profiles(id), reviewer_name text, reviewer_crp text, reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(resource_key,version),
 check(status not in ('reviewed','published') or (
   reviewer_id is not null and reviewer_name is not null and reviewer_crp ~ '^[0-9]{2}/[0-9]{3,8}$' and reviewed_at is not null
 ))
);
create unique index fv_one_published_version on public.resource_content_versions(resource_key) where status='published';
create index fv_editorial_lookup on public.resource_content_versions(resource_key,status,version desc);

-- Pure predicate. RLS does not grant admin access to personal records.
create or replace function private.fv_record_owner(p_owner uuid,p_expiry timestamptz)
returns boolean language sql stable security invoker set search_path=pg_catalog,public,private
as $$ select p_owner=(select auth.uid()) and p_expiry>now()
 and (select private.current_auth_session_is_active())
 and not (select private.current_user_can_staff())
 and not exists(select 1 from public.resource_editorial_roles r where r.user_id=(select auth.uid())) $$;
revoke all on function private.fv_record_owner(uuid,timestamptz) from public;
grant execute on function private.fv_record_owner(uuid,timestamptz) to authenticated,service_role;

-- Keep functional existing tables. New endpoints use a common envelope and
-- populate legacy required columns through a compatibility trigger.
do $$
declare t text; policy record; key public.fv_resource_key;
begin
 foreach t in array array['arrival_records','polarity_records','phenomenology_lab_records'] loop
  execute format('create table public.%I (
   id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
   resource_key public.fv_resource_key not null, schema_version integer not null default 1,
   formation_id uuid references public.enrollments(id) on delete restrict,
   client_request_id uuid not null, content_version text, payload jsonb not null,
   expires_at timestamptz not null, legacy_record boolean not null default false,
   created_at timestamptz not null default now(),updated_at timestamptz not null default now()
  )',t);
 end loop;
 foreach t in array array['interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'] loop
  execute format('alter table public.%I add column if not exists resource_key public.fv_resource_key',t);
  execute format('alter table public.%I add column if not exists schema_version integer not null default 0',t);
  execute format('alter table public.%I add column if not exists formation_id uuid references public.enrollments(id) on delete restrict',t);
  execute format('alter table public.%I add column if not exists payload jsonb',t);
  execute format('alter table public.%I add column if not exists expires_at timestamptz not null default (now()+interval ''6 months'')',t);
  execute format('alter table public.%I add column if not exists legacy_record boolean not null default true',t);
  execute format('alter table public.%I add column if not exists client_request_id uuid not null default gen_random_uuid()',t);
  execute format('alter table public.%I add column if not exists content_version text',t);
  if t <> 'interactive_resource_entries' then
   key := case t when 'need_records' then 'necessidades-agora' when 'listening_sessions' then 'sons-para-awareness'
     when 'pause_sessions' then 'sala-de-pausa' when 'river_sessions' then 'paisagem-de-pensamentos' end;
   execute format('update public.%I r set payload=to_jsonb(r)-array[''user_id'',''formation_id'',''expires_at'',''legacy_record'',''resource_key'',''payload''],resource_key=$1,schema_version=0',t) using key;
  else
   update public.interactive_resource_entries set schema_version=0, resource_key=(case resource_slug
    when 'check-in' then 'chegada' when 'diario-aqui-e-agora' then 'chegada' when 'intensidade-agora' then 'chegada'
    when 'body-map' then 'mapa-do-corpo' when 'mapa-corporal' then 'mapa-do-corpo' when 'somascan' then 'mapa-do-corpo' when 'soma-scan' then 'mapa-do-corpo'
    when 'duas-cadeiras' then 'polaridades-e-cadeiras' when 'polaridades' then 'polaridades-e-cadeiras'
    when 'banco-de-microcasos' then 'casoteca' when 'caso-clinico' then 'casoteca' when 'casoclinicointerativo' then 'casoteca'
    when 'jardim-de-pensamentos' then 'paisagem-de-pensamentos' when 'rio-dos-pensamentos' then 'paisagem-de-pensamentos' when 'rios-dos-pensamentos' then 'paisagem-de-pensamentos'
    when 'emotion-tree' then 'cartas-gestalticas' when 'arvore-das-emocoes' then 'cartas-gestalticas'
    when 'breathing' then 'sala-de-pausa' when 'respiracao' then 'sala-de-pausa' when 'grounding-54321' then 'sala-de-pausa'
    when 'EmotionWheel' then 'roda-das-emocoes' when 'ciclodocontato' then 'ciclo-do-contato'
    when 'lago' then 'igarape' else resource_slug end)::public.fv_resource_key;
   -- Archived local/backend records remain private and exportable until expiry.
   alter table public.interactive_resource_entries alter column resource_slug drop not null;
  end if;
  execute format('alter table public.%I alter column resource_key set not null',t);
  execute format('alter table public.%I alter column payload set not null',t);
  execute format('alter table public.%I alter column expires_at drop default',t);
  execute format('alter table public.%I alter column legacy_record set default false',t);
 end loop;
 foreach t in array array['arrival_records','polarity_records','phenomenology_lab_records','interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'] loop
  execute format('alter table public.%I add column display_labels jsonb not null default ''[]''::jsonb check(jsonb_typeof(display_labels)=''array'' and octet_length(display_labels::text)<=16384)',t);
  execute format('alter table public.%I add constraint fv_payload_limit check(jsonb_typeof(payload)=''object'' and octet_length(payload::text)<=16384)',t);
  execute format('alter table public.%I add constraint fv_record_version check((legacy_record and schema_version=0) or (not legacy_record and schema_version=1 and formation_id is not null))',t);
  execute format('create unique index %I on public.%I(user_id,client_request_id)', 'fv_'||t||'_request',t);
  execute format('create index %I on public.%I(user_id,created_at desc,id)', 'fv_'||t||'_history',t);
  execute format('alter table public.%I enable row level security',t);
  for policy in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',policy.policyname,t);
  end loop;
  execute format('create policy fv_owner_read on public.%I for select to authenticated using(private.fv_record_owner(user_id,expires_at))',t);
  -- Mutations go through server authentication, strict resource schemas and
  -- the external deletion ledger. No browser write path bypasses validation.
  execute format('revoke all on public.%I from anon,authenticated',t);
  -- Reads also go through the authenticated server: browser access cannot bypass
  -- the release lock stored outside the restorable database.
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

alter table public.pause_sessions alter column planned_duration_seconds drop not null;
alter table public.pause_sessions drop constraint if exists pause_sessions_planned_duration_seconds_check;
alter table public.pause_sessions add constraint fv_pause_free_duration check(planned_duration_seconds is null or planned_duration_seconds between 0 and 3600);

create or replace function private.fv_record_compatibility()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
begin
 if new.legacy_record then raise exception 'Legacy records cannot be created through the v2 writer'; end if;
 if tg_table_name='interactive_resource_entries' then new.resource_slug:=new.resource_key::text; new.is_private:=true;
 elsif tg_table_name='need_records' then
  new.content_version:=coalesce(new.content_version,'v2');
  new.state:=case when jsonb_array_length(new.payload->'ids')=0 then 'unsure' else 'selected' end;
  new.entries:=new.payload->'ids'; new.ordered:=false; new.small_step:=null;
 elsif tg_table_name='listening_sessions' then
  new.content_version:=coalesce(new.content_version,'v2'); new.mode:='text'; new.duration_seconds:=0;
  new.observations:=new.payload->'observations'; new.reflection:=new.payload->>'reflection';
 elsif tg_table_name='river_sessions' then
  if new.payload->>'mode'<>'rio' or jsonb_array_length(new.payload->'thoughts')<>0 then raise exception 'River leaves are ephemeral'; end if;
  new.content_version:=coalesce(new.content_version,'v2'); new.mode:='free'; new.planned_duration_seconds:=null;
  new.active_duration_seconds:=0; new.reflection:=new.payload->>'reflection';
 elsif tg_table_name='pause_sessions' then
  new.content_version:=coalesce(new.content_version,'v2');
  new.practice_id:=case new.payload->>'practice' when 'respirar' then 'breathing' when 'observar' then 'observing'
    when 'pelos-sentidos' then 'observing' when 'ouvir' then 'listening' when 'movimentar' then 'movement' when 'desacelerar' then 'slowing' end;
  new.planned_duration_seconds:=null; new.active_duration_seconds:=(new.payload->>'seconds')::integer;
  new.ended_by:='user'; new.reflection:=new.payload->>'reflection';
 end if;
 return new;
end $$;
revoke all on function private.fv_record_compatibility() from public;
do $$ declare t text; begin
 foreach t in array array['interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'] loop
  execute format('create trigger fv_record_compat before insert on public.%I for each row execute function private.fv_record_compatibility()',t);
 end loop;
end $$;

create or replace function private.fv_shorten_retention()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$ declare t text; deadline timestamptz; begin
 if not exists(select 1 from public.enrollments e where e.id=new.enrollment_id and e.user_id=new.user_id and e.course_id=new.course_id) then raise exception 'Retention enrollment mismatch'; end if;
 deadline:=least(new.end_date,coalesce(new.departure_date,new.end_date))+interval '6 months';
 foreach t in array array['arrival_records','polarity_records','phenomenology_lab_records','interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'] loop
  execute format('update public.%I set expires_at=least(expires_at,$1) where formation_id=$2 and user_id=$3',t) using deadline,new.enrollment_id,new.user_id;
 end loop;
 new.updated_at:=now(); return new;
end $$;
create trigger fv_retention_bounds before insert or update on public.resource_formation_retention for each row execute function private.fv_shorten_retention();
revoke all on function private.fv_shorten_retention() from public;

create or replace function private.fv_bound_record_retention()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$ declare deadline timestamptz; begin
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.resource_key<>old.resource_key or new.payload is distinct from old.payload or new.display_labels is distinct from old.display_labels or new.formation_id is distinct from old.formation_id or new.schema_version<>old.schema_version or new.legacy_record<>old.legacy_record then raise exception 'Personal records are immutable'; end if;
  new.expires_at:=least(new.expires_at,old.expires_at);return new;
 end if;
 if new.legacy_record then raise exception 'Legacy insertion forbidden'; end if;
 select least(r.end_date,coalesce(r.departure_date,r.end_date))+interval '6 months' into deadline
 from public.resource_formation_retention r join public.enrollments e on e.id=r.enrollment_id join public.courses c on c.id=e.course_id
 where r.enrollment_id=new.formation_id and r.user_id=new.user_id and e.user_id=new.user_id and e.status in ('active','completed') and c.is_published and c.status in ('open','closed');
 if deadline is null or deadline<=now() then raise exception 'Valid formation deadline required'; end if;
 new.expires_at:=least(new.expires_at,deadline);return new;
end $$;
revoke all on function private.fv_bound_record_retention() from public;
do $$ declare t text; key text; begin
 foreach t in array array['arrival_records','polarity_records','phenomenology_lab_records','interactive_resource_entries','need_records','listening_sessions','pause_sessions','river_sessions'] loop
  execute format('create trigger fv_record_retention before insert or update on public.%I for each row execute function private.fv_bound_record_retention()',t);
  key:=case t when 'arrival_records' then 'chegada' when 'polarity_records' then 'polaridades-e-cadeiras' when 'phenomenology_lab_records' then 'laboratorio-fenomenologico' when 'need_records' then 'necessidades-agora' when 'listening_sessions' then 'sons-para-awareness' when 'pause_sessions' then 'sala-de-pausa' when 'river_sessions' then 'paisagem-de-pensamentos' end;
  if key is not null then execute format('alter table public.%I add constraint fv_table_resource check(resource_key::text=%L)',t,key);end if;
 end loop;
end $$;

create or replace function private.fv_departure_retention()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$ begin
 if new.status in ('canceled','refunded') and old.status is distinct from new.status then
  update public.resource_formation_retention set departure_date=least(coalesce(departure_date,now()),now()) where enrollment_id=new.id;
 end if;
 return new;
end $$;
create trigger fv_departure_bounds after update of status on public.enrollments for each row execute function private.fv_departure_retention();
revoke all on function private.fv_departure_retention() from public;

-- Editorial data, permissions, art and release evidence have separate policies.
alter table public.resource_content_versions enable row level security;
alter table public.resource_editorial_roles enable row level security;
alter table public.resource_formation_retention enable row level security;
alter table public.resource_art_approvals enable row level security;
alter table public.resource_release_checks enable row level security;
revoke all on public.resource_content_versions, public.resource_editorial_roles, public.resource_formation_retention, public.resource_art_approvals, public.resource_release_checks from anon,authenticated;
grant all on public.resource_content_versions, public.resource_editorial_roles, public.resource_formation_retention, public.resource_art_approvals, public.resource_release_checks to service_role;
grant select on public.resource_content_versions to anon,authenticated;
grant select on public.resource_editorial_roles,public.resource_formation_retention to authenticated;
create policy fv_own_editorial_role on public.resource_editorial_roles for select to authenticated using(user_id=(select auth.uid()) and (select private.current_auth_session_is_active()));
create policy fv_own_retention on public.resource_formation_retention for select to authenticated using(user_id=(select auth.uid()) and (select private.current_auth_session_is_active()));
create policy fv_public_editorial on public.resource_content_versions for select to anon,authenticated using(status='published' and resource_key in ('cartas-gestalticas','figura-e-fundo'));
create policy fv_formation_editorial on public.resource_content_versions for select to authenticated using(
 status='published' and (select private.current_auth_session_is_active()) and exists(
 select 1 from public.enrollments e join public.courses c on c.id=e.course_id
 where e.user_id=(select auth.uid()) and e.status in ('active','completed') and c.is_published and c.status in ('open','closed')
 ));
create policy fv_editorial_preview on public.resource_content_versions for select to authenticated using(
 (select private.current_auth_session_is_active()) and ((select private.current_user_can_admin()) or exists(select 1 from public.resource_editorial_roles r where r.user_id=(select auth.uid()))));

create or replace function private.fv_preserve_published_content()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$ begin
 if old.status in ('published','archived') and (new.configuration is distinct from old.configuration or new.authored_by is distinct from old.authored_by or new.reviewer_id is distinct from old.reviewer_id or new.reviewer_name is distinct from old.reviewer_name or new.reviewer_crp is distinct from old.reviewer_crp or new.reviewed_at is distinct from old.reviewed_at or new.resource_key<>old.resource_key or new.version<>old.version) then raise exception 'Published content is immutable'; end if;
 if old.status='archived' and new.status<>'archived' then raise exception 'Archived content is immutable'; end if;
 if old.status='published' and new.status not in ('published','archived') then raise exception 'Clone published content before editing'; end if;
 if new.configuration is distinct from old.configuration then
  new.status:='draft'; new.reviewer_id:=null; new.reviewer_name:=null; new.reviewer_crp:=null; new.reviewed_at:=null;
 end if;
 new.updated_at:=clock_timestamp(); return new;
end $$;
create trigger fv_content_immutable before update on public.resource_content_versions for each row execute function private.fv_preserve_published_content();
create or replace function private.fv_no_published_delete() returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private as $$ begin
 if old.status in ('published','archived') then raise exception 'Published content is immutable'; end if; return old;
end $$;
create trigger fv_content_no_delete before delete on public.resource_content_versions for each row execute function private.fv_no_published_delete();
revoke all on function private.fv_no_published_delete() from public;
revoke all on function private.fv_preserve_published_content() from public;

create or replace function public.fv_resource_transition(
 p_actor uuid,p_action text,p_resource_key public.fv_resource_key,p_version_id uuid,
 p_configuration jsonb,p_expected_updated_at timestamptz
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
declare current_row public.resource_content_versions; reviewer public.resource_editorial_roles;
 author_ok boolean; admin_ok boolean; next_version integer; item jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active) then raise exception 'Inactive author'; end if;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_autor') into author_ok;
 select exists(select 1 from public.profiles where id=p_actor and role='admin' and is_active) into admin_ok;
 perform pg_advisory_xact_lock(hashtext(p_resource_key::text));
 if p_action='create' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' or jsonb_array_length(p_configuration->'items')<>0 then raise exception 'New draft must be empty'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration) values(p_resource_key,next_version,p_configuration) returning * into current_row;
  return to_jsonb(current_row);
 end if;
 select * into current_row from public.resource_content_versions where id=p_version_id and resource_key=p_resource_key for update;
 if current_row.id is null then raise exception 'Version unavailable'; end if;
 if p_action<>'clone' and (p_expected_updated_at is null or current_row.updated_at<>p_expected_updated_at) then raise exception 'Version changed'; end if;
 if p_action='clone' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration,authored_by) values(p_resource_key,next_version,current_row.configuration,current_row.authored_by) returning * into current_row;
 elsif p_action='save' then
  if not author_ok or current_row.status not in ('draft','submitted','reviewed') then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' then raise exception 'Invalid resource configuration'; end if;
  update public.resource_content_versions set configuration=p_configuration,authored_by=p_actor,status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null where id=current_row.id returning * into current_row;
 elsif p_action in ('submit','review','publish') then
  if current_row.authored_by is null or jsonb_array_length(current_row.configuration->'items')=0 then raise exception 'Docente authorship required'; end if;
  for item in select value from jsonb_array_elements(current_row.configuration->'items') loop
   if trim(coalesce(item->>'title',''))='' or trim(coalesce(item->>'text',''))='' or (item->>'kind'<>'guidance' and jsonb_array_length(item->'references')=0) then raise exception 'Complete theoretical content and references required'; end if;
   if coalesce(item->>'asset','')<>'' and (trim(coalesce(item->>'license',''))='' or not exists(select 1 from public.resource_art_approvals where id=(current_row.configuration->>'artApprovalId')::uuid)) then raise exception 'Art approval required'; end if;
  end loop;
  if p_action='submit' then
   if not author_ok or current_row.status<>'draft' then raise exception 'Author permission required'; end if;
   update public.resource_content_versions set status='submitted' where id=current_row.id returning * into current_row;
  elsif p_action='review' then
   select * into reviewer from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor';
   if reviewer.user_id is null or current_row.status<>'submitted' or current_row.authored_by=p_actor then raise exception 'Independent reviewer permission required'; end if;
   update public.resource_content_versions set status='reviewed',reviewer_id=p_actor,reviewer_name=reviewer.name,reviewer_crp=reviewer.crp,reviewed_at=now() where id=current_row.id returning * into current_row;
  else
   if not admin_ok or current_row.status<>'reviewed' then raise exception 'Signed version and publisher required'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published' where id=current_row.id returning * into current_row;
  end if;
 else raise exception 'Unknown editorial transition';
 end if;
 return to_jsonb(current_row);
end $$;
revoke all on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz) to service_role;

-- No theory, references, signatures or approvals are fabricated.
insert into public.resource_content_versions(resource_key,version,configuration)
select key,1,jsonb_build_object('schemaVersion',1,'resourceKey',key,'items','[]'::jsonb,'audio','[]'::jsonb,'artApprovalId',null)
from unnest(enum_range(null::public.fv_resource_key)) key;
create table public.resource_pilots (
 resource_key public.fv_resource_key primary key check(resource_key in ('laboratorio-fenomenologico','atelie-do-experimento','escuta-dialogica')),
 passed_at timestamptz not null, verified_by uuid not null references public.profiles(id),
 content_version uuid not null references public.resource_content_versions(id),
 evidence text not null check(char_length(evidence) between 1 and 2000)
);
alter table public.resource_pilots enable row level security;
revoke all on public.resource_pilots from anon,authenticated;
grant all on public.resource_pilots to service_role;

-- 4. Devolução editorial · 20261013090000_recursos_editorial_devolucao.sql
-- Recursos Interativos v2 — devolução editorial.
--
-- O fluxo original só avançava (rascunho → submetido → assinado → publicado).
-- Sem uma volta, uma versão com problema ficava parada aguardando a própria
-- pessoa autora perceber. Esta migração acrescenta a ação `return`: revisão
-- docente independente ou administração devolvem uma versão submetida ou
-- assinada ao rascunho, com uma observação obrigatória que fica visível para a
-- autoria. A assinatura é sempre descartada na devolução.

alter table public.resource_content_versions
 add column review_note text check(review_note is null or char_length(trim(review_note)) between 10 and 2000),
 add column returned_at timestamptz,
 add column returned_by uuid references public.profiles(id);

drop function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz);

create function public.fv_resource_transition(
 p_actor uuid,p_action text,p_resource_key public.fv_resource_key,p_version_id uuid,
 p_configuration jsonb,p_expected_updated_at timestamptz,p_note text default null
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
declare current_row public.resource_content_versions; reviewer public.resource_editorial_roles;
 author_ok boolean; admin_ok boolean; reviewer_ok boolean; next_version integer; item jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active) then raise exception 'Inactive author'; end if;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_autor') into author_ok;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor') into reviewer_ok;
 select exists(select 1 from public.profiles where id=p_actor and role='admin' and is_active) into admin_ok;
 perform pg_advisory_xact_lock(hashtext(p_resource_key::text));
 if p_action='create' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' or jsonb_array_length(p_configuration->'items')<>0 then raise exception 'New draft must be empty'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration) values(p_resource_key,next_version,p_configuration) returning * into current_row;
  return to_jsonb(current_row);
 end if;
 select * into current_row from public.resource_content_versions where id=p_version_id and resource_key=p_resource_key for update;
 if current_row.id is null then raise exception 'Version unavailable'; end if;
 if p_action<>'clone' and (p_expected_updated_at is null or current_row.updated_at<>p_expected_updated_at) then raise exception 'Version changed'; end if;
 if p_action='clone' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration,authored_by) values(p_resource_key,next_version,current_row.configuration,current_row.authored_by) returning * into current_row;
 elsif p_action='save' then
  if not author_ok or current_row.status not in ('draft','submitted','reviewed') then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' then raise exception 'Invalid resource configuration'; end if;
  update public.resource_content_versions set configuration=p_configuration,authored_by=p_actor,status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null where id=current_row.id returning * into current_row;
 elsif p_action='return' then
  -- A devolução não pode ser feita pela própria autoria: ela já pode salvar.
  if not(admin_ok or (reviewer_ok and coalesce(current_row.authored_by<>p_actor,true))) then raise exception 'Reviewer or publisher required'; end if;
  if current_row.status not in ('submitted','reviewed') then raise exception 'Only versions in review can be returned'; end if;
  if char_length(trim(coalesce(p_note,''))) not between 10 and 2000 then raise exception 'Return note required'; end if;
  update public.resource_content_versions set status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null,
   review_note=trim(p_note),returned_at=now(),returned_by=p_actor where id=current_row.id returning * into current_row;
 elsif p_action in ('submit','review','publish') then
  if current_row.authored_by is null or jsonb_array_length(current_row.configuration->'items')=0 then raise exception 'Docente authorship required'; end if;
  for item in select value from jsonb_array_elements(current_row.configuration->'items') loop
   if trim(coalesce(item->>'title',''))='' or trim(coalesce(item->>'text',''))='' or (item->>'kind'<>'guidance' and jsonb_array_length(item->'references')=0) then raise exception 'Complete theoretical content and references required'; end if;
   if coalesce(item->>'asset','')<>'' and (trim(coalesce(item->>'license',''))='' or not exists(select 1 from public.resource_art_approvals where id=(current_row.configuration->>'artApprovalId')::uuid)) then raise exception 'Art approval required'; end if;
  end loop;
  if p_action='submit' then
   if not author_ok or current_row.status<>'draft' then raise exception 'Author permission required'; end if;
   update public.resource_content_versions set status='submitted' where id=current_row.id returning * into current_row;
  elsif p_action='review' then
   select * into reviewer from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor';
   if reviewer.user_id is null or current_row.status<>'submitted' or current_row.authored_by=p_actor then raise exception 'Independent reviewer permission required'; end if;
   update public.resource_content_versions set status='reviewed',reviewer_id=p_actor,reviewer_name=reviewer.name,reviewer_crp=reviewer.crp,reviewed_at=now(),review_note=null where id=current_row.id returning * into current_row;
  else
   if not admin_ok or current_row.status<>'reviewed' then raise exception 'Signed version and publisher required'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published' where id=current_row.id returning * into current_row;
  end if;
 else raise exception 'Unknown editorial transition';
 end if;
 return to_jsonb(current_row);
end $$;
revoke all on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) from public,anon,authenticated;
grant execute on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) to service_role;

-- 5. Administração também escreve · 20261013100000_recursos_admin_autoria.sql
-- Recursos Interativos v2 — administração também escreve.
--
-- Decisão do Instituto (13/10/2026): quem administra pode escrever, guardar e
-- submeter o acervo sem cadastro extra como docente autor. A assinatura segue
-- inalterada: exige docente revisor com CRP e diferente de quem escreveu a
-- versão (`authored_by`), então a administração nunca assina o próprio texto.
-- Requer 20261013090000_recursos_editorial_devolucao.sql.

create or replace function public.fv_resource_transition(
 p_actor uuid,p_action text,p_resource_key public.fv_resource_key,p_version_id uuid,
 p_configuration jsonb,p_expected_updated_at timestamptz,p_note text default null
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
declare current_row public.resource_content_versions; reviewer public.resource_editorial_roles;
 author_ok boolean; admin_ok boolean; reviewer_ok boolean; next_version integer; item jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active) then raise exception 'Inactive author'; end if;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_autor') into author_ok;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor') into reviewer_ok;
 select exists(select 1 from public.profiles where id=p_actor and role='admin' and is_active) into admin_ok;
 perform pg_advisory_xact_lock(hashtext(p_resource_key::text));
 if p_action='create' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' or jsonb_array_length(p_configuration->'items')<>0 then raise exception 'New draft must be empty'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration) values(p_resource_key,next_version,p_configuration) returning * into current_row;
  return to_jsonb(current_row);
 end if;
 select * into current_row from public.resource_content_versions where id=p_version_id and resource_key=p_resource_key for update;
 if current_row.id is null then raise exception 'Version unavailable'; end if;
 if p_action<>'clone' and (p_expected_updated_at is null or current_row.updated_at<>p_expected_updated_at) then raise exception 'Version changed'; end if;
 if p_action='clone' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration,authored_by) values(p_resource_key,next_version,current_row.configuration,current_row.authored_by) returning * into current_row;
 elsif p_action='save' then
  if not(author_ok or admin_ok) or current_row.status not in ('draft','submitted','reviewed') then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' then raise exception 'Invalid resource configuration'; end if;
  update public.resource_content_versions set configuration=p_configuration,authored_by=p_actor,status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null where id=current_row.id returning * into current_row;
 elsif p_action='return' then
  -- A devolução não pode ser feita pela própria autoria: ela já pode salvar.
  if not(admin_ok or (reviewer_ok and coalesce(current_row.authored_by<>p_actor,true))) then raise exception 'Reviewer or publisher required'; end if;
  if current_row.status not in ('submitted','reviewed') then raise exception 'Only versions in review can be returned'; end if;
  if char_length(trim(coalesce(p_note,''))) not between 10 and 2000 then raise exception 'Return note required'; end if;
  update public.resource_content_versions set status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null,
   review_note=trim(p_note),returned_at=now(),returned_by=p_actor where id=current_row.id returning * into current_row;
 elsif p_action in ('submit','review','publish') then
  if current_row.authored_by is null or jsonb_array_length(current_row.configuration->'items')=0 then raise exception 'Docente authorship required'; end if;
  for item in select value from jsonb_array_elements(current_row.configuration->'items') loop
   if trim(coalesce(item->>'title',''))='' or trim(coalesce(item->>'text',''))='' or (item->>'kind'<>'guidance' and jsonb_array_length(item->'references')=0) then raise exception 'Complete theoretical content and references required'; end if;
   if coalesce(item->>'asset','')<>'' and (trim(coalesce(item->>'license',''))='' or not exists(select 1 from public.resource_art_approvals where id=(current_row.configuration->>'artApprovalId')::uuid)) then raise exception 'Art approval required'; end if;
  end loop;
  if p_action='submit' then
   if not(author_ok or admin_ok) or current_row.status<>'draft' then raise exception 'Author permission required'; end if;
   update public.resource_content_versions set status='submitted' where id=current_row.id returning * into current_row;
  elsif p_action='review' then
   select * into reviewer from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor';
   if reviewer.user_id is null or current_row.status<>'submitted' or current_row.authored_by=p_actor then raise exception 'Independent reviewer permission required'; end if;
   update public.resource_content_versions set status='reviewed',reviewer_id=p_actor,reviewer_name=reviewer.name,reviewer_crp=reviewer.crp,reviewed_at=now(),review_note=null where id=current_row.id returning * into current_row;
  else
   if not admin_ok or current_row.status<>'reviewed' then raise exception 'Signed version and publisher required'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published' where id=current_row.id returning * into current_row;
  end if;
 else raise exception 'Unknown editorial transition';
 end if;
 return to_jsonb(current_row);
end $$;
revoke all on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) from public,anon,authenticated;
grant execute on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) to service_role;

-- 6. Modo demonstração · 20261013110000_recursos_modo_demonstracao.sql
-- Recursos Interativos v2 — modo demonstração.
--
-- Decisão do Instituto (13/10/2026), para testes e apresentação: a
-- administração pode publicar uma versão como DEMONSTRAÇÃO, sem assinatura
-- docente. A versão fica marcada (`demo=true`) e o site mostra o aviso
-- "Conteúdo de demonstração · ainda sem revisão docente". Nenhum nome ou CRP é
-- registrado. Uma versão assinada por docente revisor e publicada depois
-- substitui a demonstração e tira o aviso.
-- Requer 20261013100000_recursos_admin_autoria.sql.

alter table public.resource_content_versions add column demo boolean not null default false;

-- A regra "assinada ou publicada exige assinatura" passa a aceitar demonstração publicada.
do $$ declare constraint_name text; begin
 select conname into constraint_name from pg_constraint
  where conrelid='public.resource_content_versions'::regclass and contype='c' and pg_get_constraintdef(oid) like '%reviewer_crp%';
 if constraint_name is null then raise exception 'Signature constraint not found'; end if;
 execute format('alter table public.resource_content_versions drop constraint %I', constraint_name);
end $$;
alter table public.resource_content_versions add constraint fv_signed_or_demo check(
 (demo and status in ('published','archived')) or
 (not demo and (status not in ('reviewed','published') or (
   reviewer_id is not null and reviewer_name is not null and reviewer_crp ~ '^[0-9]{2}/[0-9]{3,8}$' and reviewed_at is not null))));

create or replace function private.fv_preserve_published_content()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private
as $$ begin
 if old.status in ('published','archived') and (new.configuration is distinct from old.configuration or new.authored_by is distinct from old.authored_by or new.reviewer_id is distinct from old.reviewer_id or new.reviewer_name is distinct from old.reviewer_name or new.reviewer_crp is distinct from old.reviewer_crp or new.reviewed_at is distinct from old.reviewed_at or new.demo is distinct from old.demo or new.resource_key<>old.resource_key or new.version<>old.version) then raise exception 'Published content is immutable'; end if;
 if old.status='archived' and new.status<>'archived' then raise exception 'Archived content is immutable'; end if;
 if old.status='published' and new.status not in ('published','archived') then raise exception 'Clone published content before editing'; end if;
 if new.configuration is distinct from old.configuration then
  new.status:='draft'; new.reviewer_id:=null; new.reviewer_name:=null; new.reviewer_crp:=null; new.reviewed_at:=null; new.demo:=false;
 end if;
 new.updated_at:=clock_timestamp(); return new;
end $$;
revoke all on function private.fv_preserve_published_content() from public;

create or replace function public.fv_resource_transition(
 p_actor uuid,p_action text,p_resource_key public.fv_resource_key,p_version_id uuid,
 p_configuration jsonb,p_expected_updated_at timestamptz,p_note text default null
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private
as $$
declare current_row public.resource_content_versions; reviewer public.resource_editorial_roles;
 author_ok boolean; admin_ok boolean; reviewer_ok boolean; next_version integer; item jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active) then raise exception 'Inactive author'; end if;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_autor') into author_ok;
 select exists(select 1 from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor') into reviewer_ok;
 select exists(select 1 from public.profiles where id=p_actor and role='admin' and is_active) into admin_ok;
 perform pg_advisory_xact_lock(hashtext(p_resource_key::text));
 if p_action='create' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' or jsonb_array_length(p_configuration->'items')<>0 then raise exception 'New draft must be empty'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration) values(p_resource_key,next_version,p_configuration) returning * into current_row;
  return to_jsonb(current_row);
 end if;
 select * into current_row from public.resource_content_versions where id=p_version_id and resource_key=p_resource_key for update;
 if current_row.id is null then raise exception 'Version unavailable'; end if;
 if p_action<>'clone' and (p_expected_updated_at is null or current_row.updated_at<>p_expected_updated_at) then raise exception 'Version changed'; end if;
 if p_action='clone' then
  if not(author_ok or admin_ok) then raise exception 'Author permission required'; end if;
  select coalesce(max(version),0)+1 into next_version from public.resource_content_versions where resource_key=p_resource_key;
  insert into public.resource_content_versions(resource_key,version,configuration,authored_by) values(p_resource_key,next_version,current_row.configuration,current_row.authored_by) returning * into current_row;
 elsif p_action='save' then
  if not(author_ok or admin_ok) or current_row.status not in ('draft','submitted','reviewed') then raise exception 'Author permission required'; end if;
  if p_configuration->>'resourceKey'<>p_resource_key::text or p_configuration->>'schemaVersion'<>'1' then raise exception 'Invalid resource configuration'; end if;
  update public.resource_content_versions set configuration=p_configuration,authored_by=p_actor,status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null where id=current_row.id returning * into current_row;
 elsif p_action='return' then
  -- A devolução não pode ser feita pela própria autoria: ela já pode salvar.
  if not(admin_ok or (reviewer_ok and coalesce(current_row.authored_by<>p_actor,true))) then raise exception 'Reviewer or publisher required'; end if;
  if current_row.status not in ('submitted','reviewed') then raise exception 'Only versions in review can be returned'; end if;
  if char_length(trim(coalesce(p_note,''))) not between 10 and 2000 then raise exception 'Return note required'; end if;
  update public.resource_content_versions set status='draft',reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null,
   review_note=trim(p_note),returned_at=now(),returned_by=p_actor where id=current_row.id returning * into current_row;
 elsif p_action in ('submit','review','publish','publish_demo') then
  if current_row.authored_by is null or jsonb_array_length(current_row.configuration->'items')=0 then raise exception 'Docente authorship required'; end if;
  for item in select value from jsonb_array_elements(current_row.configuration->'items') loop
   if trim(coalesce(item->>'title',''))='' or trim(coalesce(item->>'text',''))='' or (item->>'kind'<>'guidance' and jsonb_array_length(item->'references')=0) then raise exception 'Complete theoretical content and references required'; end if;
   if coalesce(item->>'asset','')<>'' and (trim(coalesce(item->>'license',''))='' or not exists(select 1 from public.resource_art_approvals where id=(current_row.configuration->>'artApprovalId')::uuid)) then raise exception 'Art approval required'; end if;
  end loop;
  if p_action='publish_demo' then
   -- Demonstração: só administração, sem assinatura. Nunca se passa por revisão docente.
   if not admin_ok or current_row.status not in ('draft','submitted') then raise exception 'Publisher required for demonstration'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published',demo=true,reviewer_id=null,reviewer_name=null,reviewer_crp=null,reviewed_at=null,review_note=null where id=current_row.id returning * into current_row;
  elsif p_action='submit' then
   if not(author_ok or admin_ok) or current_row.status<>'draft' then raise exception 'Author permission required'; end if;
   update public.resource_content_versions set status='submitted' where id=current_row.id returning * into current_row;
  elsif p_action='review' then
   select * into reviewer from public.resource_editorial_roles where user_id=p_actor and role='docente_revisor';
   if reviewer.user_id is null or current_row.status<>'submitted' or current_row.authored_by=p_actor then raise exception 'Independent reviewer permission required'; end if;
   update public.resource_content_versions set status='reviewed',reviewer_id=p_actor,reviewer_name=reviewer.name,reviewer_crp=reviewer.crp,reviewed_at=now(),review_note=null where id=current_row.id returning * into current_row;
  else
   if not admin_ok or current_row.status<>'reviewed' then raise exception 'Signed version and publisher required'; end if;
   update public.resource_content_versions set status='archived' where resource_key=p_resource_key and status='published';
   update public.resource_content_versions set status='published',demo=false where id=current_row.id returning * into current_row;
  end if;
 else raise exception 'Unknown editorial transition';
 end if;
 return to_jsonb(current_row);
end $$;
revoke all on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) from public,anon,authenticated;
grant execute on function public.fv_resource_transition(uuid,text,public.fv_resource_key,uuid,jsonb,timestamptz,text) to service_role;

commit;
