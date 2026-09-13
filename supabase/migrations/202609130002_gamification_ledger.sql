-- Canonical, idempotent XP ledger. Awards are made only by the trusted server client.
alter table public.xp_transactions add column if not exists event_key text;
create unique index if not exists xp_transactions_user_event_key_unique
  on public.xp_transactions (user_id, event_key) where event_key is not null;

create or replace function public.grant_xp_idempotent(p_user_id uuid, p_amount integer, p_reason text, p_event_key text, p_metadata jsonb default '{}'::jsonb)
returns table (new_total_xp integer, new_level integer, awarded boolean)
language plpgsql security definer set search_path = public as $$
declare v_profile public.gamification_profiles%rowtype;
begin
  if p_user_id is null or p_amount <= 0 or length(trim(coalesce(p_event_key, ''))) = 0 then raise exception 'invalid gamification award'; end if;
  if p_reason not in ('lesson_completed', 'quiz_passed', 'course_completed', 'daily_login', 'bonus', 'admin_reward') then raise exception 'invalid gamification reason'; end if;
  if exists (select 1 from public.xp_transactions where user_id = p_user_id and event_key = p_event_key) then
    select * into v_profile from public.gamification_profiles where user_id = p_user_id;
    return query select coalesce(v_profile.total_xp, 0), coalesce(v_profile.level, 1), false; return;
  end if;
  insert into public.gamification_profiles (user_id) values (p_user_id) on conflict (user_id) do nothing;
  update public.gamification_profiles set total_xp = total_xp + p_amount,
    level = greatest(1, floor((total_xp + p_amount)::numeric / 500)::integer + 1), updated_at = now()
    where user_id = p_user_id returning * into v_profile;
  insert into public.xp_transactions (user_id, amount, reason, event_key, metadata)
    values (p_user_id, p_amount, p_reason, p_event_key, coalesce(p_metadata, '{}'::jsonb));
  return query select v_profile.total_xp, v_profile.level, true;
exception when unique_violation then
  select * into v_profile from public.gamification_profiles where user_id = p_user_id;
  return query select coalesce(v_profile.total_xp, 0), coalesce(v_profile.level, 1), false;
end;
$$;
revoke all on function public.grant_xp_idempotent(uuid, integer, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.grant_xp_idempotent(uuid, integer, text, text, jsonb) to service_role;
