alter table public.xp_transactions
  add column if not exists idempotency_key text;

create unique index if not exists xp_transactions_idempotency_key_unique
  on public.xp_transactions (idempotency_key)
  where idempotency_key is not null;

create or replace function public.process_gamification_event(
  p_user_id uuid, p_event_key text, p_reason text, p_amount integer,
  p_metadata jsonb default '{}'::jsonb, p_badges text[] default '{}'::text[]
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  profile public.gamification_profiles%rowtype;
  next_streak integer;
  next_total integer;
  next_level integer;
  earned_badges text[] := '{}'::text[];
  badge text;
begin
  if p_event_key is null or length(trim(p_event_key)) = 0 then raise exception 'idempotency key is required'; end if;
  if p_amount <= 0 then raise exception 'xp amount must be positive'; end if;
  insert into public.gamification_profiles (user_id) values (p_user_id) on conflict (user_id) do nothing;
  select * into profile from public.gamification_profiles where user_id = p_user_id for update;
  if exists (select 1 from public.xp_transactions where idempotency_key = p_event_key) then
    return jsonb_build_object('processed', false, 'newTotalXp', profile.total_xp, 'newLevel', profile.level, 'leveledUp', false, 'newBadges', '[]'::jsonb);
  end if;
  next_streak := profile.current_streak;
  if p_reason = 'daily_login' then
    if profile.last_activity_date is null then next_streak := 1;
    elsif profile.last_activity_date::date = current_date then
      return jsonb_build_object('processed', false, 'newTotalXp', profile.total_xp, 'newLevel', profile.level, 'leveledUp', false, 'newBadges', '[]'::jsonb);
    elsif profile.last_activity_date::date = current_date - 1 then next_streak := profile.current_streak + 1;
    else next_streak := 1;
    end if;
  end if;
  next_total := profile.total_xp + p_amount;
  next_level := floor(next_total / 500.0)::integer + 1;
  update public.gamification_profiles set
    total_xp = next_total, level = next_level, current_streak = next_streak,
    longest_streak = greatest(profile.longest_streak, next_streak),
    badges = array(select distinct unnest(profile.badges || p_badges)),
    last_activity_date = now(), updated_at = now()
  where user_id = p_user_id;
  insert into public.xp_transactions (user_id, amount, reason, metadata, idempotency_key)
  values (p_user_id, p_amount, p_reason, p_metadata, p_event_key);
  foreach badge in array p_badges loop
    if not exists (select 1 from public.earned_badges where user_id = p_user_id and badge_id = badge and course_id is null) then
      insert into public.earned_badges (user_id, badge_id, course_id) values (p_user_id, badge, null);
      earned_badges := array_append(earned_badges, badge);
    end if;
  end loop;
  return jsonb_build_object('processed', true, 'newTotalXp', next_total, 'newLevel', next_level, 'leveledUp', next_level > profile.level, 'newBadges', to_jsonb(earned_badges));
end;
$$;

revoke all on function public.process_gamification_event(uuid, text, text, integer, jsonb, text[]) from public;
grant execute on function public.process_gamification_event(uuid, text, text, integer, jsonb, text[]) to service_role;
