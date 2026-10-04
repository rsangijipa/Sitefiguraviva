-- Uma unica SELECT, apenas leitura. Execute no projeto jdxorryvmcvtqsddkpdm.
-- Copie a coluna audit_result inteira. Nao contem chaves, emails ou respostas.
-- Nao chama RPCs de escrita nem altera permissoes.
select jsonb_build_object(
 'checked_at', now(),
 'rpc_execution', coalesce((
   select jsonb_agg(jsonb_build_object(
     'signature', p.oid::regprocedure::text,
     'owner', pg_get_userbyid(p.proowner),
     'owner_is_superuser', r.rolsuper,
     'security_definer', p.prosecdef,
     'anon_can_execute', has_function_privilege('anon', p.oid, 'EXECUTE'),
     'authenticated_can_execute', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
     'service_role_can_execute', has_function_privilege('service_role', p.oid, 'EXECUTE'),
     'acl', p.proacl::text,
     'definition', pg_get_functiondef(p.oid)
   ) order by p.proname)
   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   join pg_roles r on r.oid = p.proowner
   where n.nspname = 'public' and p.proname in (
     'save_lesson_content','bump_course_content_revision','reorder_book_recommendations',
     'grant_xp_idempotent','current_user_can_access_course',
     'prevent_profile_privilege_escalation','prevent_submission_self_grading')
 ), '[]'::jsonb),
 'rls', coalesce((
   select jsonb_agg(jsonb_build_object('table', c.relname, 'enabled',c.relrowsecurity,
       'forced',c.relforcerowsecurity) order by c.relname)
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname in ('profiles','applications','enrollments',
     'lessons','course_modules','assessments','assessment_submissions','lesson_progress','certificates')
 ), '[]'::jsonb),
 'policies', coalesce((
   select jsonb_agg(to_jsonb(x) order by x.tablename, x.policyname)
   from (select tablename, policyname, roles, cmd, qual, with_check from pg_policies
     where schemaname = 'public' and tablename in ('profiles','applications','enrollments',
       'lessons','course_modules','assessments','assessment_submissions','lesson_progress','certificates')) x
 ), '[]'::jsonb),
 'unique_indexes', coalesce((
   select jsonb_agg(to_jsonb(x) order by x.tablename, x.indexname)
   from (select tablename, indexname, indexdef from pg_indexes where schemaname = 'public'
     and tablename in ('enrollments','lesson_progress','certificates','applications')
     and indexdef ilike 'create unique index%') x
 ), '[]'::jsonb),
 'triggers', coalesce((
   select jsonb_agg(to_jsonb(x) order by x.event_object_table, x.trigger_name)
   from (select event_object_table,trigger_name,action_timing,event_manipulation,action_statement
     from information_schema.triggers where trigger_schema = 'public'
       and event_object_table in ('profiles','assessment_submissions','lesson_progress')) x
 ), '[]'::jsonb),
 'buckets', coalesce((
   select jsonb_agg(jsonb_build_object('id', id, 'public', public,
     'file_size_limit',file_size_limit,'allowed_mime_types',allowed_mime_types) order by id)
   from storage.buckets
 ), '[]'::jsonb),
 'storage_policies', coalesce((
   select jsonb_agg(to_jsonb(x) order by x.policyname)
   from (select policyname, roles,cmd,qual,with_check from pg_policies
     where schemaname = 'storage' and tablename = 'objects') x
 ), '[]'::jsonb),
 'inactive_profiles_with_active_enrollment', (
   select count(*) from public.enrollments e join public.profiles p on p.id = e.user_id
   where p.is_active = false and e.status in ('active','completed')
 )
) as audit_result;
