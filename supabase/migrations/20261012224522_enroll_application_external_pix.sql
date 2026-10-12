begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

-- Preserve gateway reconciliation while allowing an audited external receipt.
create or replace function public.enforce_pix_paid_order()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.status in ('active', 'completed')
     and (new.payment_method = 'pix' or (tg_op = 'UPDATE' and old.payment_method = 'pix')) then
    if new.payment_method = 'manual' and new.payment_status = 'paid'
       and exists (
         select 1 from public.admin_operation_events event
         join public.profiles actor on actor.id = event.actor_id
         where event.action = 'external_pix_enrollment_confirmed'
           and event.actor_id = new.approved_by
           and event.target_id = new.user_id
           and event.details->>'enrollmentId' = new.id::text
           and event.details->>'courseId' = new.course_id
           and event.details->>'paymentConfirmed' = 'true'
           and new.source_ref = 'external_pix_' || event.id::text
           and actor.is_active and actor.role::text in ('admin', 'administrador')
       ) then
      return new;
    end if;
    if new.payment_method is distinct from 'pix' or new.payment_status is distinct from 'paid'
       or not exists (
         select 1 from public.pix_orders o
         where o.enrollment_id = new.id and o.status = 'paid'
           and o.user_id = new.user_id and o.course_id = new.course_id
           and o.bank_reference is not null and new.source_ref = 'pix_' || o.id::text
       ) then
      raise exception 'Pix requires a reconciled paid order or an audited external receipt' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create function public.enroll_application_external_pix(p_actor uuid, p_application text, p_confirmed boolean)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  a public.applications%rowtype;
  c public.courses%rowtype;
  e public.enrollments%rowtype;
  o public.pix_orders%rowtype;
  event_id uuid := gen_random_uuid();
begin
  if not exists (select 1 from public.profiles where id = p_actor and is_active and role::text in ('admin', 'administrador')) then
    raise exception 'Administrator required' using errcode = '42501';
  end if;
  if p_confirmed is distinct from true then raise exception 'External Pix receipt confirmation required'; end if;
  select * into a from public.applications where id = p_application;
  if not found or a.user_id is null then raise exception 'Linked application required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(a.user_id::text || ':' || a.course_id, 0));
  select * into a from public.applications where id = p_application for update;
  if not found or a.user_id is null or a.status not in ('submitted', 'contacted', 'enrolled') then
    raise exception 'Eligible linked application required';
  end if;
  if not exists (select 1 from public.profiles where id = a.user_id and is_active) then
    raise exception 'Active student required';
  end if;
  select * into c from public.courses where id = a.course_id;
  if not found or not c.is_published or c.status not in ('open', 'closed') then
    raise exception 'Published course required';
  end if;
  -- Match the review routine's row-lock order (order before enrollment).
  select * into o from public.pix_orders where user_id = a.user_id and course_id = a.course_id for update;
  select * into e from public.enrollments where user_id = a.user_id and course_id = a.course_id for update;
  if found then
    if e.status in ('active', 'completed') then
      update public.applications set status = 'enrolled', updated_at = now()
        where user_id = a.user_id and course_id = a.course_id and status in ('submitted', 'contacted');
      return jsonb_build_object('enrollmentId', e.id, 'userId', a.user_id, 'courseId', a.course_id, 'alreadyProcessed', true);
    end if;
    if e.status <> 'pending_approval' or e.payment_status = 'paid'
       or e.payment_method is null or e.payment_method not in ('pix', 'manual', 'free')
       or e.subscription_id is not null then
      raise exception 'Existing enrollment requires its own review';
    end if;
  else
    if a.status = 'enrolled' then raise exception 'Enrolled application has no active enrollment'; end if;
    insert into public.enrollments(user_id, course_id, status, payment_status, payment_method, course_version_at_enrollment)
      values(a.user_id, a.course_id, 'pending_approval', 'pending', 'manual', c.content_revision)
      returning * into e;
  end if;
  if o.id is not null then
    if o.status <> 'pending' or o.enrollment_id <> e.id then raise exception 'Existing Pix order requires its own review'; end if;
    -- Retain the unused charge and its history, without fabricating bank reconciliation.
    update public.pix_orders set status = 'rejected', reviewed_by = p_actor, reviewed_at = now(),
      rejection_reason = 'Substituído por confirmação administrativa de Pix recebido fora do sistema.' where id = o.id;
    insert into public.pix_order_events(order_id, actor_id, event, details)
      values(o.id, p_actor, 'rejected', jsonb_build_object('reason', 'external_pix_confirmed', 'adminEventId', event_id));
  end if;
  insert into public.admin_operation_events(id, actor_id, target_id, action, details)
    values(event_id, p_actor, a.user_id, 'external_pix_enrollment_confirmed', jsonb_build_object(
      'applicationId', a.id, 'courseId', a.course_id, 'enrollmentId', e.id,
      'paymentConfirmed', true, 'paymentMethod', 'pix', 'paymentSource', 'external', 'confirmedAt', now()
    ));
  update public.enrollments set status = 'active', payment_status = 'paid', payment_method = 'manual',
    paid_at = now(), approved_by = p_actor, approved_at = now(), source_ref = 'external_pix_' || event_id::text,
    rejection_reason = null, updated_at = now() where id = e.id;
  update public.applications set status = 'enrolled', updated_at = now()
    where user_id = a.user_id and course_id = a.course_id and status in ('submitted', 'contacted');
  return jsonb_build_object('enrollmentId', e.id, 'userId', a.user_id, 'courseId', a.course_id, 'alreadyProcessed', false);
end $$;

revoke all on function public.enroll_application_external_pix(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.enroll_application_external_pix(uuid, text, boolean) to service_role;
notify pgrst, 'reload schema';
commit;
