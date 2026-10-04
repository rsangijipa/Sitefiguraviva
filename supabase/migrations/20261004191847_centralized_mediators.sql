begin;
create table public.mediators (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  role text not null default '' check (length(role) <= 300),
  image text not null default '' check (length(image) <= 2000),
  bio text not null default '' check (length(bio) <= 20000),
  created_at timestamptz not null default now()
);
create unique index mediators_name_unique on public.mediators(lower(trim(name)));
create table public.course_mediators (
  course_id text not null references public.courses(id) on delete cascade,
  mediator_id uuid not null references public.mediators(id) on delete restrict,
  primary key(course_id, mediator_id)
);
create index course_mediators_mediator_idx on public.course_mediators(mediator_id);

alter table public.mediators enable row level security;
alter table public.course_mediators enable row level security;
revoke all on public.mediators, public.course_mediators from anon, authenticated;
grant select on public.mediators, public.course_mediators to anon, authenticated;
grant all on public.mediators, public.course_mediators to service_role;
grant insert,update,delete on public.course_mediators to authenticated;
create policy course_mediators_admin_write on public.course_mediators for all to authenticated
using ((select public.current_user_can_admin())) with check ((select public.current_user_can_admin()));
create policy mediator_public_read on public.mediators for select to anon, authenticated
using (exists (select 1 from public.course_mediators cm join public.courses c on c.id=cm.course_id
 where cm.mediator_id=mediators.id and c.is_published and c.status in ('open','closed')));
create policy mediator_admin_read on public.mediators for select to authenticated
using ((select public.current_user_can_admin()));
create policy course_mediators_read on public.course_mediators for select to anon, authenticated
using (exists (select 1 from public.courses c where c.id=course_id));
create policy active_auth_session_restrictive on public.mediators as restrictive for all to authenticated
using ((select public.current_auth_session_is_active())) with check ((select public.current_auth_session_is_active()));
create policy active_auth_session_restrictive on public.course_mediators as restrictive for all to authenticated
using ((select public.current_auth_session_is_active())) with check ((select public.current_auth_session_is_active()));

-- Historical profiles are matched by name. Prefer canonical data, then the most complete biography.
create temporary table mediator_import on commit drop as
select c.id course_id, c.updated_at, trim(coalesce(m->>'name', case when jsonb_typeof(m)='string' then m#>>'{}' end)) name,
 coalesce(nullif(m->>'role',''),nullif(m->>'title',''),'Mediadora') role,
 coalesce(nullif(m->>'image',''),nullif(m->>'imageUrl',''),nullif(m->>'photoURL',''),m->>'photo','') image,
 coalesce(nullif(m->>'bio',''),nullif(m->>'curriculum',''),m->>'description','') bio
from public.courses c cross join lateral jsonb_array_elements(
 case when jsonb_typeof(c.details->'mediators')='array' then c.details->'mediators'
 when jsonb_typeof(c.legacy_payload->'mediators')='array' then c.legacy_payload->'mediators'
 when jsonb_typeof(c.team)='array' then c.team else '[]'::jsonb end) m;
insert into public.mediators(name,role,image,bio)
select distinct on (lower(name)) name,role,image,bio from mediator_import
where name is not null and name<>'' order by lower(name), length(bio) desc, updated_at desc, image;
insert into public.course_mediators(course_id,mediator_id)
select distinct i.course_id,m.id from mediator_import i join public.mediators m on lower(m.name)=lower(i.name);
update public.courses c set
 details=(coalesce(c.details,'{}'::jsonb)-'mediators') || jsonb_build_object('mediatorIds',
  coalesce((select jsonb_agg(cm.mediator_id order by cm.mediator_id) from public.course_mediators cm where cm.course_id=c.id),'[]'::jsonb)),
 legacy_payload=coalesce(c.legacy_payload,'{}'::jsonb)-'mediators',
 team=case when jsonb_typeof(c.team)='array' then '{}'::jsonb else c.team end;

-- IDs travel in details; the FK-backed links are changed in the same course transaction.
create function public.sync_course_mediators() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.details ? 'mediators' or new.legacy_payload ? 'mediators' then
  raise exception 'Use o cadastro central de mediadores.';
 end if;
 if tg_op='UPDATE' and (new.details->'mediatorIds') is not distinct from (old.details->'mediatorIds') then return new; end if;
 if new.details ? 'mediatorIds' then
  if jsonb_typeof(new.details->'mediatorIds') <> 'array' or jsonb_array_length(new.details->'mediatorIds')>50 then
   raise exception 'Seleção de mediadores inválida.';
  end if;
  delete from public.course_mediators where course_id=new.id;
  insert into public.course_mediators(course_id,mediator_id)
   select new.id, value::uuid from jsonb_array_elements_text(new.details->'mediatorIds') on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function public.sync_course_mediators() from public, anon, authenticated;
create trigger sync_course_mediators after insert or update of details,legacy_payload on public.courses
for each row execute function public.sync_course_mediators();
notify pgrst,'reload schema';
commit;
