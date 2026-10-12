-- Run after the external Pix migration. Every fixture and operation rolls back.
begin;
set local statement_timeout = '30s';
do $$
declare
  admin_id uuid;
  student_id uuid;
  prefix text := 'external-pix-test-' || gen_random_uuid()::text;
  fixture_course_id text;
  application_id text;
  result jsonb;
  order_id uuid := gen_random_uuid();
  blocked boolean;
begin
  select id into admin_id from public.profiles where is_active and role::text in ('admin', 'administrador') limit 1;
  select id into student_id from public.profiles where is_active and role::text not in ('admin', 'administrador') limit 1;
  if admin_id is null or student_id is null then raise exception 'Active administrator and student fixtures required'; end if;

  for i in 1..3 loop
    fixture_course_id := prefix || '-' || i;
    application_id := fixture_course_id || '-application';
    insert into public.courses(id, title, is_published, status, pix_price_cents)
      values(fixture_course_id, 'Teste transacional de Pix externo', true, 'open', case when i = 2 then 10000 else null end);
    insert into public.applications(id, user_id, course_id, status, consent, answers)
      values(application_id, student_id, fixture_course_id, 'submitted', '{"lgpd":true}',
        '{"fullName":"Teste transacional","phone":"11999999999","profession":"Teste"}');
  end loop;

  application_id := prefix || '-1-application';
  blocked := false;
  begin
    perform public.enroll_application_external_pix(admin_id, application_id, false);
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'Missing confirmation was accepted'; end if;
  blocked := false;
  begin
    perform public.enroll_application_external_pix(student_id, application_id, true);
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Non-administrator was accepted'; end if;

  result := public.enroll_application_external_pix(admin_id, application_id, true);
  if result->>'alreadyProcessed' <> 'false' or not exists (
    select 1 from public.enrollments where id = (result->>'enrollmentId')::uuid
      and status = 'active' and payment_status = 'paid' and payment_method = 'manual'
      and approved_by = admin_id and source_ref like 'external_pix_%'
  ) then raise exception 'External receipt did not activate a paid enrollment'; end if;
  if exists (select 1 from public.pix_orders where course_id = prefix || '-1') then
    raise exception 'External receipt generated a charge';
  end if;
  if (public.enroll_application_external_pix(admin_id, application_id, true))->>'alreadyProcessed' <> 'true' then
    raise exception 'Retry was not idempotent';
  end if;
  if (select count(*) from public.admin_operation_events where action = 'external_pix_enrollment_confirmed' and details->>'applicationId' = application_id) <> 1 then
    raise exception 'Retry duplicated the financial confirmation';
  end if;

  fixture_course_id := prefix || '-2';
  perform public.create_manual_pix_order(student_id, fixture_course_id, order_id, 10000,
    substring(replace(order_id::text, '-', '') from 1 for 25), 'test-payload', 'Teste');
  blocked := false;
  begin
    update public.enrollments set status = 'active', payment_status = 'paid', payment_method = 'manual'
      where user_id = student_id and enrollments.course_id = prefix || '-2';
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Unaudited Pix conversion was accepted'; end if;
  perform public.enroll_application_external_pix(admin_id, prefix || '-2-application', true);
  if not exists (select 1 from public.pix_orders where id = order_id and status = 'rejected' and bank_reference is null)
    or not exists (select 1 from public.enrollments where user_id = student_id and enrollments.course_id = prefix || '-2' and status = 'active' and payment_status = 'paid') then
    raise exception 'Pending charge was not safely superseded';
  end if;

  insert into public.enrollments(user_id, course_id, status, payment_status, payment_method)
    values(student_id, prefix || '-3', 'pending_approval', 'pending', 'stripe');
  blocked := false;
  begin
    perform public.enroll_application_external_pix(admin_id, prefix || '-3-application', true);
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'Gateway enrollment was overwritten'; end if;
end $$;
rollback;
