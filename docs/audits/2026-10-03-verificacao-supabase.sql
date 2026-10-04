-- Auditoria Figura Viva, 03/10/2026. Apenas leitura; NAO aplica correcoes.
-- Executar no SQL Editor do ambiente de homologacao e depois comparar producao.
-- Resultados de esquema e contagens; nao exporta nomes, emails ou respostas.
begin transaction read only;

-- 1. RLS habilitada e quantidade de politicas. applications sem politica
--    nao pode ser operada pelo cliente autenticado comum.
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced,
       count(p.oid) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relname in ('profiles','applications','enrollments','course_modules',
                   'lessons','assessment_submissions','assessments',
                   'lesson_progress','certificates','audit_logs')
group by n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
order by c.relname;

-- 2. Expressoes reais das politicas, incluindo INSERT de notas e provas.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','applications','enrollments','lessons',
                   'course_modules','assessments','assessment_submissions',
                   'lesson_progress','certificates')
order by tablename, policyname;

-- 3. Conferir indices unicos parciais versus onConflict sem predicado.
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('enrollments','lesson_progress','certificates','applications')
order by tablename, indexname;

select conrelid::regclass as relation_name, conname, contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (select c.oid from pg_class c
                  join pg_namespace n on n.oid = c.relnamespace
                  where n.nspname = 'public'
                    and c.relname in ('enrollments','lesson_progress','certificates'))
order by relation_name, conname;

-- 4. Verificar se protecao de notas cobre tambem INSERT, nao apenas UPDATE.
select event_object_table, trigger_name, action_timing,
       event_manipulation, action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('profiles','assessment_submissions','enrollments')
order by event_object_table, trigger_name, event_manipulation;

-- 5. Definicoes e ACL das funcoes de autorizacao/RPC sensiveis.
select p.oid::regprocedure as function_name, p.prosecdef as security_definer,
       p.proacl as privileges, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('current_profile_role','current_user_can_access_course',
                   'current_user_can_admin','current_user_can_staff',
                   'prevent_submission_self_grading',
                   'prevent_profile_privilege_escalation','save_lesson_content',
                   'bump_course_content_revision');

-- 6. Buckets e limites, sem listar objetos ou URLs privadas.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets order by id;

-- 7. Contagens de inconsistencias. Dependem das tabelas previstas nas migracoes.
select status, payment_method, payment_status,
       count(*) as total,
       count(*) filter (where paid_at is null) as without_paid_at,
       count(*) filter (where approved_by is null) as without_approver
from public.enrollments
group by status, payment_method, payment_status
order by status, payment_method, payment_status;

select count(*) as duplicate_user_course_groups
from (select user_id, course_id from public.enrollments
      where user_id is not null group by user_id, course_id having count(*) > 1) d;

select count(*) as duplicate_certificate_user_course_groups
from (select user_id, course_id from public.certificates
      where user_id is not null group by user_id, course_id having count(*) > 1) d;

select count(*) as inactive_profiles_with_active_enrollment
from public.enrollments e join public.profiles p on p.id = e.user_id
where p.is_active = false and e.status in ('active','completed');

-- Nao altera dados, politicas, chaves ou estrutura.
rollback;
