-- Aprovação de cadastro exige e-mail confirmado.
--
-- Confirmação de e-mail e aprovação administrativa são etapas independentes e
-- ambas obrigatórias. A confirmação vem de auth.users.email_confirmed_at, que o
-- Supabase Auth só preenche quando a pessoa usa o link/código recebido.
--
-- Privilégio mínimo: em vez de conceder leitura de auth.users ao service_role
-- ou tornar a função de revisão SECURITY DEFINER, cria-se uma função estreita
-- que devolve apenas um booleano (mesmo padrão de is_auth_session_active).
-- A revisão continua SECURITY INVOKER, chamada só pelo service_role.
begin;

create or replace function public.registration_email_confirmed(p_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select u.email_confirmed_at is not null from auth.users u where u.id = p_user), false);
$$;
revoke all on function public.registration_email_confirmed(uuid) from public, anon, authenticated;
grant execute on function public.registration_email_confirmed(uuid) to service_role;

create or replace function public.review_pending_registration(
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

  -- Rejeitar é sempre possível (spam, cadastro abandonado); aprovar só com
  -- e-mail comprovadamente confirmado.
  if p_approve and not public.registration_email_confirmed(p_target) then
    raise exception 'Email not confirmed' using errcode = '22023';
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
    jsonb_build_object('email', target_row.email, 'email_confirmed', public.registration_email_confirmed(p_target))
  );

  return jsonb_build_object('approved', p_approve);
end;
$$;

revoke all on function public.review_pending_registration(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.review_pending_registration(uuid, uuid, boolean) to service_role;

commit;
