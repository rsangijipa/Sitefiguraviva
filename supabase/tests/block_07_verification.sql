-- Aggregate read-only verification. No filenames, identities or student data.
select jsonb_build_object(
 'buckets',(select jsonb_agg(jsonb_build_object('id',b.id,'public',b.public,'size_limit',b.file_size_limit,'mime_types',b.allowed_mime_types,'objects',(select count(*) from storage.objects o where o.bucket_id=b.id)) order by b.id) from storage.buckets b),
 'material_total',(select count(*) from public.lesson_materials),
 'material_columns',(select jsonb_agg(column_name order by column_name) from information_schema.columns where table_schema='public' and table_name='lesson_materials' and column_name in ('visibility','storage_bucket','storage_path','module_id')),
 'routines',(select jsonb_agg(jsonb_build_object('name',p.proname,'security_definer',p.prosecdef,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('enforce_material_file_reference','can_user_read_course_material','resolve_course_material','list_readable_course_materials')),
 'material_rls',(select relrowsecurity from pg_class where oid='public.lesson_materials'::regclass),
 'restrictive_policies',(select jsonb_agg(jsonb_build_object('table',tablename,'name',policyname,'permissive',permissive,'roles',roles,'command',cmd) order by policyname) from pg_policies where schemaname in ('public','storage') and policyname in ('lesson_materials_restricted_read','course_materials_no_direct_access','uploads_admin_only','course_materials_not_public_insert','course_materials_not_public_update')),
 'metadata_unsafe_privileges',jsonb_build_object('anon_truncate',has_table_privilege('anon','public.lesson_materials','TRUNCATE'),'authenticated_truncate',has_table_privilege('authenticated','public.lesson_materials','TRUNCATE'),'authenticated_trigger',has_table_privilege('authenticated','public.lesson_materials','TRIGGER'),'authenticated_references',has_table_privilege('authenticated','public.lesson_materials','REFERENCES')),
 'legacy_public_material_paths',(select count(*) from storage.objects where bucket_id='course-assets' and name like 'courses/%/materials/%'),
 'legacy_public_pdfs',(select count(*) from storage.objects where bucket_id='course-assets' and metadata->>'mimetype'='application/pdf'),
 'active_admins',(select count(*) from public.profiles where role='admin' and is_active),
 'applications',(select count(*) from public.applications),
 'pix_orders',(select count(*) from public.pix_orders),
 'pix_events',(select count(*) from public.pix_order_events),
 'admin_events',(select count(*) from public.admin_operation_events),
 'inactive_profiles_with_active_enrollment',(select count(*) from public.enrollments e join public.profiles p on p.id=e.user_id where p.is_active is distinct from true and e.status in ('active','completed'))
) as verification;
