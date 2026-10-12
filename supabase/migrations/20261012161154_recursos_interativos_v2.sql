-- Local migration only. No legacy pedagogical text is approved or seeded.
begin;
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
 and not (select private.current_user_can_staff()) $$;
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
    when 'banco-de-microcasos' then 'casoteca' when 'caso-clinico' then 'casoteca'
    when 'jardim-de-pensamentos' then 'paisagem-de-pensamentos' when 'rio-dos-pensamentos' then 'paisagem-de-pensamentos'
    when 'emotion-tree' then 'cartas-gestalticas' when 'arvore-das-emocoes' then 'cartas-gestalticas'
    when 'breathing' then 'sala-de-pausa' when 'grounding-54321' then 'sala-de-pausa'
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
  execute format('grant select on public.%I to authenticated',t);
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
   if reviewer.user_id is null or current_row.status<>'submitted' then raise exception 'Reviewer permission required'; end if;
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
commit;
