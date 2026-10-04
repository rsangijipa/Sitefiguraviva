SELECT jsonb_build_object(
 'rpc',(SELECT jsonb_build_object('security_definer',p.prosecdef,'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='set_course_commercial_state'),
 'rls_enabled',(SELECT relrowsecurity FROM pg_class WHERE oid='public.courses'::regclass),
 'public_policy',(SELECT jsonb_build_object('roles',roles,'command',cmd,'qual',qual) FROM pg_policies WHERE schemaname='public' AND tablename='courses' AND policyname='courses_public_read'),
 'commercial_columns',(SELECT jsonb_agg(jsonb_build_object('name',column_name,'type',data_type,'nullable',is_nullable)) FROM information_schema.columns WHERE table_schema='public' AND table_name='courses' AND column_name IN ('total_price_cents','installment_count')),
 'commercial_constraints',(SELECT count(*) FROM pg_constraint WHERE conrelid='public.courses'::regclass AND contype='c' AND (pg_get_constraintdef(oid) LIKE '%total_price_cents%' OR pg_get_constraintdef(oid) LIKE '%installment_count%')),
 'course_count',(SELECT count(*) FROM public.courses),
 'configured_total_prices',(SELECT count(*) FROM public.courses WHERE total_price_cents IS NOT NULL),
 'configured_installments',(SELECT count(*) FROM public.courses WHERE installment_count IS NOT NULL),
 'version_registered',exists(SELECT 1 FROM supabase_migrations.schema_migrations WHERE version='20261004003242')
) AS verification;
