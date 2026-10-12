begin;

alter table public.profiles
  add column if not exists registration_status text not null default 'approved'
  check (registration_status in ('pending', 'approved', 'rejected'));

create index if not exists profiles_pending_registration_idx
  on public.profiles (created_at desc)
  where registration_status = 'pending';

create function public.review_pending_registration(
  p_actor uuid,
  p_target uuid,
  p_approve boolean
) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare target_row public.profiles%rowtype;
begin
  if not exists (
    select 1 from public.profiles
    where id = p_actor and is_active and role::text in ('admin', 'administrador')
  ) then
    raise exception 'Administrator required' using errcode = '42501';
  end if;

  select * into target_row from public.profiles where id = p_target for update;
  if not found or target_row.registration_status <> 'pending' then
    raise exception 'Pending registration not found';
  end if;

  update public.profiles
  set registration_status = case when p_approve then 'approved' else 'rejected' end,
      is_active = p_approve,
      updated_at = now()
  where id = p_target;

  insert into public.admin_operation_events(actor_id, target_id, action, details)
  values (
    p_actor,
    p_target,
    case when p_approve then 'registration_approved' else 'registration_rejected' end,
    jsonb_build_object('email', target_row.email)
  );

  return jsonb_build_object('approved', p_approve);
end;
$$;

revoke all on function public.review_pending_registration(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.review_pending_registration(uuid, uuid, boolean) to service_role;

commit;
