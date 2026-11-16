begin;
create table public.enrollment_email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  kind text not null check (kind in ('application_received','enrollment_confirmed')),
  status text not null default 'pending' check (status in ('pending','sending','sent','delivered','failed','canceled')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  next_attempt_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  locked_at timestamptz,
  provider_id text unique,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.enrollment_email_outbox enable row level security;
revoke all on public.enrollment_email_outbox from public, anon, authenticated;
grant select,insert,update,delete on public.enrollment_email_outbox to service_role;
create index enrollment_email_dispatch_idx on public.enrollment_email_outbox(next_attempt_at) where status in ('pending','sending');
create index enrollment_email_user_course_idx on public.enrollment_email_outbox(user_id,course_id);

-- Trigger functions are private and have no public execution grant. They only enqueue
-- the event from the row already authorized by the existing enrollment/application flow.
create or replace function private.queue_enrollment_confirmation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.user_id is not null and new.status::text='active' and
     (tg_op='INSERT' or old.status::text is distinct from 'active') then
    insert into public.enrollment_email_outbox(event_key,user_id,course_id,enrollment_id,kind)
    values ('enrollment-confirmed/'||new.id::text,new.user_id,new.course_id,new.id,'enrollment_confirmed')
    on conflict(event_key) do nothing;
  end if;
  return new;
end $$;
revoke all on function private.queue_enrollment_confirmation() from public,anon,authenticated;
create trigger queue_enrollment_confirmation after insert or update of status on public.enrollments
for each row execute function private.queue_enrollment_confirmation();

create or replace function private.queue_application_received()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.user_id is not null and new.status::text='submitted' and
     (tg_op='INSERT' or old.status::text is distinct from 'submitted') then
    insert into public.enrollment_email_outbox(event_key,user_id,course_id,kind)
    values ('application-received/'||new.id::text,new.user_id,new.course_id,'application_received')
    on conflict(event_key) do nothing;
  end if;
  return new;
end $$;
revoke all on function private.queue_application_received() from public,anon,authenticated;
create trigger queue_application_received after insert or update of status on public.applications
for each row execute function private.queue_application_received();

-- Atomic lease prevents two workers sending the same event concurrently.
create function public.claim_enrollment_emails(p_user uuid default null,p_course text default null,p_limit integer default 10)
returns setof public.enrollment_email_outbox language sql security invoker set search_path='' as $$
  with eligible as (
    select id from public.enrollment_email_outbox
    where (status='pending' or (status='sending' and locked_at < now()-interval '10 minutes'))
      and next_attempt_at <= now() and attempts < 5
      and (p_user is null or user_id=p_user) and (p_course is null or course_id=p_course)
    order by created_at for update skip locked limit least(greatest(p_limit,1),20)
  )
  update public.enrollment_email_outbox o
    set status='sending',attempts=attempts+1,locked_at=now(),
        first_attempt_at=coalesce(first_attempt_at,now()),updated_at=now()
    from eligible where o.id=eligible.id returning o.*;
$$;
revoke all on function public.claim_enrollment_emails(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.claim_enrollment_emails(uuid,text,integer) to service_role;
commit;


;
