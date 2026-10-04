begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
create table public.admin_operation_events (
 id uuid primary key default gen_random_uuid(), actor_id uuid not null, target_id uuid not null,
 action text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
alter table public.admin_operation_events enable row level security;
revoke all on public.admin_operation_events from public,anon,authenticated,service_role;
grant select,insert on public.admin_operation_events to service_role;
grant select on public.admin_operation_events to authenticated;
create policy admin_operation_events_admin_read on public.admin_operation_events for select to authenticated using((select public.current_user_can_admin()));
create index admin_operation_events_target_created_idx on public.admin_operation_events(target_id,created_at desc);
alter table public.applications add column contacted_at timestamptz;

create function public.protect_last_active_admin() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if old.is_active=true and old.role::text in ('admin','administrador') and (tg_op='DELETE' or new.is_active is distinct from true or new.role::text not in ('admin','administrador')) then
  perform pg_advisory_xact_lock(hashtextextended('profile-governance',0));
  if not exists(select 1 from public.profiles where id<>old.id and is_active=true and role::text in ('admin','administrador')) then raise exception 'Last active administrator must be preserved' using errcode='42501'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger profiles_protect_last_active_admin before update of role,is_active or delete on public.profiles for each row execute function public.protect_last_active_admin();
revoke all on function public.protect_last_active_admin() from public,anon,authenticated;

create function public.set_admin_profile_governance(p_actor uuid,p_target uuid,p_role text,p_active boolean)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare before_row public.profiles%rowtype; after_row public.profiles%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended('profile-governance',0));
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_role is not null and p_role not in ('admin','tutor','student') then raise exception 'Invalid role'; end if;
 select * into before_row from public.profiles where id=p_target for update;
 if not found then raise exception 'Profile not found'; end if;
 if p_target=p_actor and (p_active=false or (p_role is not null and p_role<>'admin')) then raise exception 'Self governance change denied' using errcode='42501'; end if;
 update public.profiles set role=coalesce(p_role::public.app_role,role),is_active=coalesce(p_active,is_active),updated_at=now() where id=p_target returning * into after_row;
 if before_row.role is distinct from after_row.role or before_row.is_active is distinct from after_row.is_active then
  insert into public.admin_operation_events(actor_id,target_id,action,details) values(p_actor,p_target,'profile_governance_updated',jsonb_build_object('before',jsonb_build_object('role',before_row.role,'isActive',before_row.is_active),'after',jsonb_build_object('role',after_row.role,'isActive',after_row.is_active)));
 end if;
 return jsonb_build_object('role',after_row.role,'isActive',after_row.is_active);
end $$;

create function public.profile_has_dependencies(p_target uuid) returns boolean language plpgsql security invoker set search_path=public as $$
declare link record; linked boolean;
begin
 for link in select n.nspname,c.relname,a.attname from pg_constraint f join pg_class c on c.oid=f.conrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=f.conkey[1] where f.contype='f' and f.confrelid='public.profiles'::regclass and array_length(f.conkey,1)=1
 loop
  execute format('select exists(select 1 from %I.%I where %I=$1)',link.nspname,link.relname,link.attname) into linked using p_target;
  if linked then return true; end if;
 end loop;
 return false;
end $$;

create function public.protect_profile_history() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if public.profile_has_dependencies(old.id) then raise exception 'Profile history must be preserved' using errcode='42501'; end if;
 return old;
end $$;
create trigger profiles_protect_history before delete on public.profiles for each row execute function public.protect_profile_history();
revoke all on function public.protect_profile_history() from public,anon,authenticated;

create function public.grant_manual_course_access(p_actor uuid,p_user uuid,p_course text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare c public.courses%rowtype; e public.enrollments%rowtype;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 if not exists(select 1 from public.profiles where id=p_user and is_active) then raise exception 'Active student required'; end if;
 select * into c from public.courses where id=p_course;
 if not found or not c.is_published or c.status not in ('open','closed') then raise exception 'Published course required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_course,0));
 select * into e from public.enrollments where user_id=p_user and course_id=p_course for update;
 if found then
  if e.status in ('active','completed') then return jsonb_build_object('enrollmentId',e.id,'alreadyProcessed',true,'status',e.status); end if;
  raise exception 'Existing enrollment requires its own review';
 end if;
 insert into public.enrollments(user_id,course_id,status,payment_status,payment_method,approved_by,approved_at,source_ref,course_version_at_enrollment)
 values(p_user,p_course,'active','pending','manual',p_actor,now(),'admin_grant',c.content_revision) returning * into e;
 update public.applications set status='enrolled',updated_at=now() where user_id=p_user and course_id=p_course and status in ('submitted','contacted');
 insert into public.admin_operation_events(actor_id,target_id,action,details) values(p_actor,p_user,'manual_access_granted',jsonb_build_object('courseId',p_course,'enrollmentId',e.id,'paymentConfirmed',false));
 return jsonb_build_object('enrollmentId',e.id,'alreadyProcessed',false,'status',e.status);
end $$;

create function public.prepare_application_pix(p_actor uuid,p_application text,p_id uuid,p_amount integer,p_txid text,p_payload text,p_merchant text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare a public.applications%rowtype; result jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from public.applications where id=p_application for update;
 if not found or a.user_id is null or a.status not in ('submitted','contacted') then raise exception 'Eligible linked application required'; end if;
 if a.status='contacted' then update public.applications set status='submitted',contacted_at=coalesce(contacted_at,now()),updated_at=now() where id=a.id; end if;
 result:=public.create_manual_pix_order(a.user_id,a.course_id,p_id,p_amount,p_txid,p_payload,p_merchant);
 return result;
end $$;

create function public.mark_application_contacted(p_actor uuid,p_application text)
returns void language plpgsql security invoker set search_path=public as $$
declare a public.applications%rowtype;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from public.applications where id=p_application for update;
 if not found or a.user_id is null then raise exception 'Linked application required'; end if;
 if a.status='enrolled' then raise exception 'Enrolled application cannot change'; end if;
 if a.contacted_at is null then
  update public.applications set contacted_at=now(),updated_at=now() where id=a.id;
  insert into public.admin_operation_events(actor_id,target_id,action,details) values(p_actor,a.user_id,'application_contacted',jsonb_build_object('applicationId',a.id));
 end if;
end $$;

create function public.delete_unconverted_application(p_actor uuid,p_application text)
returns void language plpgsql security invoker set search_path=public as $$
declare a public.applications%rowtype;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from public.applications where id=p_application for update;
 if not found then raise exception 'Application not found'; end if;
 if a.status='enrolled' or exists(select 1 from public.enrollments where user_id=a.user_id and course_id=a.course_id) then raise exception 'Application with enrollment must be preserved'; end if;
 delete from public.applications where id=a.id;
 insert into public.admin_operation_events(actor_id,target_id,action,details) values(p_actor,coalesce(a.user_id,p_actor),'application_deleted',jsonb_build_object('applicationId',a.id));
end $$;

create function public.set_enrollment_admin_state(p_actor uuid,p_user uuid,p_course text,p_status text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare e public.enrollments%rowtype;
begin
 if not exists(select 1 from public.profiles where id=p_actor and is_active and role::text in ('admin','administrador')) then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_status is null or p_status not in ('active','completed','canceled','pending_approval') then raise exception 'Supported access state required'; end if;
 select * into e from public.enrollments where user_id=p_user and course_id=p_course for update;
 if not found then raise exception 'Enrollment not found'; end if;
 if e.payment_method='pix' and p_status in ('active','pending_approval') then raise exception 'Use Pix reconciliation'; end if;
 if p_status='active' and (e.payment_method is null or e.payment_method not in ('manual','free') or e.status not in ('pending_approval','active')) then raise exception 'Enrollment requires its own review'; end if;
 if p_status='completed' and e.status not in ('active','completed') then raise exception 'Active enrollment required'; end if;
 if p_status='pending_approval' and e.status<>'pending_approval' then raise exception 'Final access state cannot regress'; end if;
 if p_status in ('active','completed') and not exists(select 1 from profiles where id=p_user and is_active) then raise exception 'Active student required'; end if;
 if e.status::text<>p_status then
  update public.enrollments set status=p_status::public.enrollment_status,approved_by=p_actor,approved_at=now(),updated_at=now() where id=e.id;
  if p_status='active' then update public.applications set status='enrolled',updated_at=now() where user_id=p_user and course_id=p_course and status in ('submitted','contacted'); end if;
  insert into public.admin_operation_events(actor_id,target_id,action,details) values(p_actor,p_user,'enrollment_access_updated',jsonb_build_object('enrollmentId',e.id,'courseId',p_course,'before',e.status,'after',p_status,'paymentConfirmed',false));
 end if;
 return jsonb_build_object('enrollmentId',e.id,'status',p_status);
end $$;
revoke all on function public.set_enrollment_admin_state(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.set_enrollment_admin_state(uuid,uuid,text,text) to service_role;

revoke all on function public.set_admin_profile_governance(uuid,uuid,text,boolean),public.profile_has_dependencies(uuid),public.grant_manual_course_access(uuid,uuid,text),public.prepare_application_pix(uuid,text,uuid,integer,text,text,text),public.mark_application_contacted(uuid,text),public.delete_unconverted_application(uuid,text) from public,anon,authenticated;
grant execute on function public.set_admin_profile_governance(uuid,uuid,text,boolean),public.profile_has_dependencies(uuid),public.grant_manual_course_access(uuid,uuid,text),public.prepare_application_pix(uuid,text,uuid,integer,text,text,text),public.mark_application_contacted(uuid,text),public.delete_unconverted_application(uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
