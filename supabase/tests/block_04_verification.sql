SELECT jsonb_build_object(
 'rpcs',(SELECT jsonb_agg(jsonb_build_object('name',p.proname,'security_definer',p.prosecdef,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE'))) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('submit_course_application','create_manual_pix_order','submit_manual_pix_receipt','review_manual_pix_order')),
 'rls',(SELECT jsonb_agg(jsonb_build_object('table',c.relname,'enabled',c.relrowsecurity)) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('pix_orders','pix_order_events')),
 'receipt_bucket',(SELECT jsonb_build_object('public',public,'size_limit',file_size_limit,'mime_types',allowed_mime_types) FROM storage.buckets WHERE id='pix-receipts'),
 'storage_restriction',(SELECT jsonb_build_object('permissive',permissive,'qual',qual,'check',with_check) FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='pix_receipts_no_direct_access'),
 'financial_guard_exists',exists(SELECT 1 FROM pg_trigger WHERE tgname='enrollments_require_pix_paid_order' AND NOT tgisinternal),
 'audit_service_can_update',has_table_privilege('service_role','public.pix_order_events','UPDATE'),
 'order_count',(SELECT count(*) FROM public.pix_orders),
 'event_count',(SELECT count(*) FROM public.pix_order_events),
 'priced_courses',(SELECT count(*) FROM public.courses WHERE pix_price_cents IS NOT NULL),
 'version_registered',exists(SELECT 1 FROM supabase_migrations.schema_migrations WHERE version='20261003225204')
) AS verification;