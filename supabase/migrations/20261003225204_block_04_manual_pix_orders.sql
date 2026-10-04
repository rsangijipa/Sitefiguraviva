begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
alter table public.courses add column if not exists pix_price_cents integer check (pix_price_cents > 0);
create table public.pix_orders (
 id uuid primary key,
 user_id uuid not null references public.profiles(id),
 course_id text not null references public.courses(id),
 enrollment_id uuid not null references public.enrollments(id),
 amount_cents integer not null check (amount_cents > 0),
 txid text not null unique check (txid ~ '^[A-Za-z0-9]{1,25}$$'),
 payload text not null,
 merchant_name text not null,
 charge_label text not null default 'Matrícula ou primeira parcela',
 status text not null default 'pending' check (status in ('pending','paid','rejected')),
 receipt_path text,
 declared_at timestamptz,
 bank_reference text unique,
 received_at timestamptz,
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 rejection_reason text,
 created_at timestamptz not null default now(),
 unique(user_id,course_id),
 check (status <> 'paid' or (bank_reference is not null and received_at is not null and reviewed_by is not null))
);
create table public.pix_order_events (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.pix_orders(id),
 actor_id uuid not null references public.profiles(id),
 event text not null check(event in ('created','receipt_submitted','approved','rejected')),
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index pix_order_events_order_created_idx on public.pix_order_events(order_id,created_at);
alter table public.pix_orders enable row level security;
alter table public.pix_order_events enable row level security;
revoke all on public.pix_orders, public.pix_order_events from public,anon,authenticated,service_role;
grant select on public.pix_orders to authenticated;
create policy pix_orders_read_own_or_admin on public.pix_orders for select to authenticated
 using ((user_id=(select auth.uid()) and exists(select 1 from public.profiles where id=(select auth.uid()) and is_active=true)) or (select public.current_user_can_admin()));
grant select,insert,update on public.pix_orders to service_role;
grant select,insert on public.pix_order_events to service_role;

create function public.submit_course_application(p_user uuid,p_course text,p_answers jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare result_id text := p_user::text || '_' || p_course; current_status text;
begin
 if not exists(select 1 from public.profiles where id=p_user and is_active=true) then raise exception 'Inactive profile'; end if;
 if not exists(select 1 from public.courses where id=p_course and is_published=true and status='open') then raise exception 'Course unavailable'; end if;
 if length(trim(coalesce(p_answers->>'fullName',''))) < 3 or length(regexp_replace(coalesce(p_answers->>'phone',''),'[^0-9]','','g')) < 10 or length(trim(coalesce(p_answers->>'profession',''))) < 2 then raise exception 'Invalid answers'; end if;
 insert into public.applications(id,user_id,course_id,answers,consent,status,source,updated_at)
 values(result_id,p_user,p_course,p_answers,jsonb_build_object('lgpd',true,'acceptedAt',now(),'version','enrollment-v1'),'submitted','internal',now())
 on conflict(id) do update set answers=excluded.answers,consent=excluded.consent,updated_at=now()
 where applications.status in ('draft','submitted') and applications.user_id=p_user and applications.course_id=p_course;
 select status into current_status from public.applications where id=result_id and user_id=p_user and course_id=p_course;
 if current_status is null then raise exception 'Application identity mismatch'; end if;
 return jsonb_build_object('applicationId',result_id,'status',current_status);
end $$;

create function public.create_manual_pix_order(p_user uuid,p_course text,p_id uuid,p_amount integer,p_txid text,p_payload text,p_merchant text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare existing_order public.pix_orders%rowtype; e public.enrollments%rowtype; c public.courses%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_course,0));
 if not exists(select 1 from public.profiles where id=p_user and is_active=true) then raise exception 'Inactive profile'; end if;
 select * into existing_order from public.pix_orders where user_id=p_user and course_id=p_course;
 if found then return to_jsonb(existing_order); end if;
 select * into c from public.courses where id=p_course;
 if not found or not c.is_published or c.status <> 'open' then raise exception 'Course unavailable'; end if;
 if c.pix_price_cents is null or c.pix_price_cents <> p_amount then raise exception 'Pix price unavailable or changed'; end if;
 if not exists(select 1 from public.applications where user_id=p_user and course_id=p_course and status in ('submitted','enrolled') and consent->>'lgpd'='true' and length(trim(coalesce(answers->>'fullName','')))>=3 and length(regexp_replace(coalesce(answers->>'phone',''),'[^0-9]','','g'))>=10 and length(trim(coalesce(answers->>'profession','')))>=2) then raise exception 'Application required'; end if;
 insert into public.enrollments(user_id,course_id,status,payment_status,payment_method,course_version_at_enrollment)
 values(p_user,p_course,'pending_approval','pending','pix',c.content_revision)
 on conflict(user_id,course_id) do nothing;
 select * into e from public.enrollments where user_id=p_user and course_id=p_course for update;
 if e.status <> 'pending_approval' or e.payment_method is distinct from 'pix' or e.payment_status='paid' then raise exception 'Enrollment cannot receive a Pix order'; end if;
 insert into public.pix_orders(id,user_id,course_id,enrollment_id,amount_cents,txid,payload,merchant_name)
 values(p_id,p_user,p_course,e.id,p_amount,p_txid,p_payload,p_merchant) returning * into existing_order;
 insert into public.pix_order_events(order_id,actor_id,event) values(p_id,p_user,'created');
 return to_jsonb(existing_order);
end $$;

create function public.submit_manual_pix_receipt(p_user uuid,p_order uuid,p_path text)
returns void language plpgsql security invoker set search_path=public as $$
declare o public.pix_orders%rowtype;
begin
 if not exists(select 1 from public.profiles where id=p_user and is_active=true) then raise exception 'Inactive profile'; end if;
 select * into o from public.pix_orders where id=p_order and user_id=p_user for update;
 if not found or o.status <> 'pending' then raise exception 'Pending order required'; end if;
 if p_path not like p_user::text || '/' || p_order::text || '/%' then raise exception 'Invalid receipt path'; end if;
 update public.pix_orders set receipt_path=p_path,declared_at=now() where id=p_order;
 insert into public.pix_order_events(order_id,actor_id,event,details) values(p_order,p_user,'receipt_submitted',jsonb_build_object('path',p_path));
end $$;

create function public.review_manual_pix_order(p_admin uuid,p_user uuid,p_course text,p_approve boolean,p_bank_reference text,p_received_at timestamptz,p_received_amount integer,p_reason text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare o public.pix_orders%rowtype; e public.enrollments%rowtype; reference text := regexp_replace(upper(trim(p_bank_reference)), '[[:space:]]', '', 'g');
begin
 if not exists(select 1 from public.profiles where id=p_admin and is_active=true and role::text in ('admin','administrador')) then raise exception 'Administrator required'; end if;
 select * into o from public.pix_orders where user_id=p_user and course_id=p_course for update;
 if not found then raise exception 'Pix order required'; end if;
 if o.status='paid' and p_approve then
  if o.bank_reference is distinct from reference or o.received_at is distinct from p_received_at or o.amount_cents is distinct from p_received_amount then raise exception 'Already approved with different reconciliation'; end if;
  return jsonb_build_object('alreadyProcessed',true,'orderId',o.id);
 end if;
 if o.status='rejected' and not p_approve then return jsonb_build_object('alreadyProcessed',true,'orderId',o.id); end if;
 if o.status <> 'pending' then raise exception 'Pending order required'; end if;
 select * into e from public.enrollments where id=o.enrollment_id and user_id=p_user and course_id=p_course for update;
 if not found or e.status <> 'pending_approval' or e.payment_method is distinct from 'pix' then raise exception 'Enrollment state mismatch'; end if;
 if p_approve then
  if p_received_amount is distinct from o.amount_cents then raise exception 'Received amount does not match order'; end if;
  if length(coalesce(reference,'')) < 6 or length(reference)>120 or p_received_at is null or p_received_at > now()+interval '5 minutes' or p_received_at < o.created_at-interval '1 day' then raise exception 'Bank reconciliation required'; end if;
  update public.pix_orders set status='paid',bank_reference=reference,received_at=p_received_at,reviewed_by=p_admin,reviewed_at=now() where id=o.id;
  update public.enrollments set status='active',payment_status='paid',paid_at=p_received_at,approved_by=p_admin,approved_at=now(),source_ref='pix_' || o.id::text,updated_at=now() where id=e.id;
  update public.applications set status='enrolled',updated_at=now() where user_id=p_user and course_id=p_course and status='submitted';
 else
  if length(trim(coalesce(p_reason,''))) < 5 or length(p_reason)>1000 then raise exception 'Rejection reason required'; end if;
  update public.pix_orders set status='rejected',rejection_reason=trim(p_reason),reviewed_by=p_admin,reviewed_at=now() where id=o.id;
  update public.enrollments set status='canceled',payment_status='failed',rejection_reason=trim(p_reason),approved_by=p_admin,approved_at=now(),updated_at=now() where id=e.id;
 end if;
 insert into public.pix_order_events(order_id,actor_id,event,details) values(o.id,p_admin,case when p_approve then 'approved' else 'rejected' end,jsonb_build_object('bankReference',reference,'receivedAt',p_received_at,'receivedAmountCents',p_received_amount,'reason',p_reason,'amountCents',o.amount_cents));
 return jsonb_build_object('alreadyProcessed',false,'orderId',o.id);
end $$;

create function public.enforce_pix_paid_order() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.status in ('active','completed') and (new.payment_method='pix' or (tg_op='UPDATE' and old.payment_method='pix')) then
  if new.payment_method is distinct from 'pix' or new.payment_status is distinct from 'paid' or not exists(select 1 from public.pix_orders o where o.enrollment_id=new.id and o.status='paid' and o.user_id=new.user_id and o.course_id=new.course_id and o.bank_reference is not null and new.source_ref='pix_' || o.id::text) then
   raise exception 'Pix requires a reconciled paid order' using errcode='42501';
  end if;
 end if;
 return new;
end $$;
create trigger enrollments_require_pix_paid_order before insert or update of status,payment_status,payment_method on public.enrollments for each row execute function public.enforce_pix_paid_order();
revoke all on function public.enforce_pix_paid_order() from public,anon,authenticated;

revoke all on function public.submit_course_application(uuid,text,jsonb),public.create_manual_pix_order(uuid,text,uuid,integer,text,text,text),public.submit_manual_pix_receipt(uuid,uuid,text),public.review_manual_pix_order(uuid,uuid,text,boolean,text,timestamptz,integer,text) from public,anon,authenticated;
grant execute on function public.submit_course_application(uuid,text,jsonb),public.create_manual_pix_order(uuid,text,uuid,integer,text,text,text),public.submit_manual_pix_receipt(uuid,uuid,text),public.review_manual_pix_order(uuid,uuid,text,boolean,text,timestamptz,integer,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('pix-receipts','pix-receipts',false,5242880,array['image/jpeg','image/png','application/pdf']) on conflict(id) do nothing;
do $$ begin if exists(select 1 from storage.buckets where id='pix-receipts' and public=true) then raise exception 'Pix receipts must remain private'; end if; end $$;
-- A pre-existing permissive Storage read policy covers every bucket except
-- assessment-submissions. A restrictive policy is required for Pix privacy.
create policy pix_receipts_no_direct_access on storage.objects as restrictive for all to anon,authenticated
 using (bucket_id <> 'pix-receipts') with check (bucket_id <> 'pix-receipts');
notify pgrst, 'reload schema';
commit;
