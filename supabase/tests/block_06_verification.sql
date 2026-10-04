-- Read-only aggregate verification; no personal data or financial mutation.
select jsonb_build_object(
 'active_admins',(select count(*) from public.profiles where role='admin' and is_active),
 'profile_guards',(select jsonb_agg(tgname order by tgname) from pg_trigger where tgrelid='public.profiles'::regclass and tgname in ('profiles_protect_last_active_admin','profiles_protect_history')),
 'routines',(select jsonb_agg(jsonb_build_object('name',p.proname,'security_definer',p.prosecdef,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('set_admin_profile_governance','profile_has_dependencies','grant_manual_course_access','prepare_application_pix','mark_application_contacted','delete_unconverted_application','set_enrollment_admin_state')),
 'audit_rls',(select relrowsecurity from pg_class where oid='public.admin_operation_events'::regclass),
 'audit_service_update',has_table_privilege('service_role','public.admin_operation_events','UPDATE'),
 'audit_service_delete',has_table_privilege('service_role','public.admin_operation_events','DELETE'),
 'audit_events',(select count(*) from public.admin_operation_events),
 'applications_contacted',(select count(*) from public.applications where contacted_at is not null),
 'applications',(select count(*) from public.applications),
 'pix_orders',(select count(*) from public.pix_orders),
 'pix_events',(select count(*) from public.pix_order_events),
 'courses',(select count(*) from public.courses),
 'enrollment_status_counts',(select jsonb_object_agg(status,n) from (select status,count(*) as n from public.enrollments group by status) e),
 'inactive_profiles_with_active_enrollment',(select count(*) from public.enrollments e join public.profiles p on p.id=e.user_id where p.is_active is distinct from true and e.status in ('active','completed'))
) as verification;
