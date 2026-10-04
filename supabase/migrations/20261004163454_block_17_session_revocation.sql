begin;
create table if not exists public.auth_session_revocations (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 revoked_before timestamptz not null default now()
);
alter table public.auth_session_revocations enable row level security;
revoke all on public.auth_session_revocations from public,anon,authenticated;
grant all on public.auth_session_revocations to service_role;

create or replace function public.invalidate_profile_sessions()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.role is distinct from new.role or (old.is_active and not new.is_active) then
  insert into public.auth_session_revocations(user_id,revoked_before) values(new.id,clock_timestamp())
  on conflict(user_id) do update set revoked_before=excluded.revoked_before;
 end if;
 return new;
end $$;
revoke all on function public.invalidate_profile_sessions() from public,anon,authenticated;
drop trigger if exists profiles_invalidate_sessions on public.profiles;
create trigger profiles_invalidate_sessions after update of role,is_active on public.profiles
 for each row execute function public.invalidate_profile_sessions();

create or replace function public.is_auth_session_active(p_user uuid,p_session uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.sessions s join public.profiles p on p.id=s.user_id
 left join public.auth_session_revocations r on r.user_id=s.user_id
 where s.id=p_session and s.user_id=p_user and p.is_active
 and (s.not_after is null or s.not_after>now())
 and (r.user_id is null or s.created_at>r.revoked_before));
$$;
revoke all on function public.is_auth_session_active(uuid,uuid) from public,anon,authenticated;
grant execute on function public.is_auth_session_active(uuid,uuid) to service_role;

create or replace function public.current_auth_session_is_active()
returns boolean language plpgsql stable security definer set search_path='' as $$
declare session_text text := auth.jwt()->>'session_id';
begin
 if auth.uid() is null or session_text is null then return false; end if;
 return public.is_auth_session_active(auth.uid(),session_text::uuid);
exception when invalid_text_representation then return false;
end $$;
revoke all on function public.current_auth_session_is_active() from public;
grant execute on function public.current_auth_session_is_active() to anon,authenticated,service_role;

-- Add a restrictive gate without widening any existing ownership/publication policy.
do $$ declare target record; begin
 for target in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='r' and c.relrowsecurity loop
  execute format('drop policy if exists active_auth_session_restrictive on public.%I',target.relname);
  execute format('create policy active_auth_session_restrictive on public.%I as restrictive for all to authenticated using ((select public.current_auth_session_is_active())) with check ((select public.current_auth_session_is_active()))',target.relname);
 end loop;
end $$;
drop policy if exists active_auth_session_restrictive on storage.objects;
create policy active_auth_session_restrictive on storage.objects as restrictive for all to authenticated
 using ((select public.current_auth_session_is_active())) with check ((select public.current_auth_session_is_active()));
notify pgrst,'reload schema';
commit;
