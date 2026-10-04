begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
-- Browser reads remain scoped. Every write uses the validated backend RPC/actions.
alter table public.applications enable row level security;
drop policy if exists applications_insert_own on public.applications;
drop policy if exists applications_update_own_or_admin on public.applications;
drop policy if exists applications_delete_admin on public.applications;
drop policy if exists applications_read_own_or_admin on public.applications;
create policy applications_read_own_or_admin on public.applications for select to authenticated using(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and (p.id=applications.user_id or p.role::text in ('admin','administrador')))
);
create policy applications_restricted_read on public.applications as restrictive for select to authenticated using(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and (p.id=applications.user_id or p.role::text in ('admin','administrador')))
);
revoke all on public.applications from public,anon,authenticated;
grant select on public.applications to authenticated;
grant select,insert,update,delete on public.applications to service_role;

-- No raw IPs, email addresses or tokens: the backend passes a keyed hash only.
create table public.request_rate_limits (
 key text primary key check(key ~ '^[0-9a-f]{64}$'),
 hits integer not null check(hits between 1 and 10001),
 expires_at timestamptz not null
);
create index request_rate_limits_expiry_idx on public.request_rate_limits(expires_at);
alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.request_rate_limits to service_role;
create function public.consume_request_rate_limit(p_key text,p_max integer,p_window_ms integer)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.request_rate_limits%rowtype; v_now timestamptz:=clock_timestamp();
begin
 if p_key is null or p_key !~ '^[0-9a-f]{64}$' or p_max is null or p_max not between 1 and 10000 or p_window_ms is null or p_window_ms not between 1000 and 86400000 then raise exception 'Invalid rate limit configuration' using errcode='22023'; end if;
 -- Bounded indexed housekeeping. No scheduler or arbitrary business-data deletion.
 delete from public.request_rate_limits where key in(select key from public.request_rate_limits where expires_at<v_now-interval '1 day' order by expires_at limit 50 for update skip locked);
 insert into public.request_rate_limits as existing(key,hits,expires_at)
 values(p_key,1,v_now+make_interval(secs=>p_window_ms/1000.0))
 on conflict(key) do update set
  hits=case when existing.expires_at<=v_now then 1 else least(existing.hits+1,p_max+1) end,
  expires_at=case when existing.expires_at<=v_now then excluded.expires_at else existing.expires_at end
 returning * into r;
 return jsonb_build_object('allowed',r.hits<=p_max,'remaining',greatest(0,p_max-r.hits),'resetAt',floor(extract(epoch from r.expires_at)*1000)::bigint);
end $$;
revoke all on function public.consume_request_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_request_rate_limit(text,integer,integer) to service_role;
notify pgrst,'reload schema';
commit;
