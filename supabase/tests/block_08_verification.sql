-- Read-only aggregate verification of block 08; no answers, hashes or identities.
select jsonb_build_object(
 'applications',(select count(*) from public.applications),
 'application_rls',(select relrowsecurity from pg_class where oid='public.applications'::regclass),
 'application_policies',(select jsonb_agg(jsonb_build_object('name',policyname,'roles',roles,'permissive',permissive,'command',cmd) order by policyname) from pg_policies where schemaname='public' and tablename='applications'),
 'application_permissions',jsonb_build_object('anon_select',has_table_privilege('anon','public.applications','SELECT'),'authenticated_select',has_table_privilege('authenticated','public.applications','SELECT'),'authenticated_insert',has_table_privilege('authenticated','public.applications','INSERT'),'authenticated_update',has_table_privilege('authenticated','public.applications','UPDATE'),'authenticated_delete',has_table_privilege('authenticated','public.applications','DELETE'),'authenticated_truncate',has_table_privilege('authenticated','public.applications','TRUNCATE'),'service_insert',has_table_privilege('service_role','public.applications','INSERT'),'service_update',has_table_privilege('service_role','public.applications','UPDATE'),'service_delete',has_table_privilege('service_role','public.applications','DELETE')),
 'rate_limit_rls',(select relrowsecurity from pg_class where oid='public.request_rate_limits'::regclass),
 'rate_limit_rows',(select count(*) from public.request_rate_limits),
 'rate_limit_permissions',jsonb_build_object('anon_select',has_table_privilege('anon','public.request_rate_limits','SELECT'),'authenticated_select',has_table_privilege('authenticated','public.request_rate_limits','SELECT'),'authenticated_insert',has_table_privilege('authenticated','public.request_rate_limits','INSERT'),'service_select',has_table_privilege('service_role','public.request_rate_limits','SELECT'),'service_insert',has_table_privilege('service_role','public.request_rate_limits','INSERT'),'service_update',has_table_privilege('service_role','public.request_rate_limits','UPDATE'),'service_delete',has_table_privilege('service_role','public.request_rate_limits','DELETE')),
 'limiter_function',(select jsonb_build_object('security_definer',p.prosecdef,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='consume_request_rate_limit'),
 'active_admins',(select count(*) from public.profiles where role='admin' and is_active),
 'pix_orders',(select count(*) from public.pix_orders),
 'pix_events',(select count(*) from public.pix_order_events),
 'admin_events',(select count(*) from public.admin_operation_events),
 'inactive_profiles_with_active_enrollment',(select count(*) from public.enrollments e join public.profiles p on p.id=e.user_id where p.is_active is distinct from true and e.status in ('active','completed'))
) as verification;
