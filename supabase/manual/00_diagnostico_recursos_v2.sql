-- Diagnóstico SOMENTE LEITURA para aplicar os Recursos Interativos v2.
-- Cole no SQL Editor do Supabase e rode. Nada é alterado.
-- Cada linha diz se um pré-requisito existe e qual migração o cria.
select item, existe, origem from (values
 ('tabela public.profiles',                    to_regclass('public.profiles') is not null,                       '202606110001_p2_lms_foundation'),
 ('tabela public.courses',                     to_regclass('public.courses') is not null,                        '202606110001_p2_lms_foundation'),
 ('tabela public.enrollments',                 to_regclass('public.enrollments') is not null,                    '202606110001_p2_lms_foundation'),
 ('schema private',                            exists(select 1 from pg_namespace where nspname='private'),      '20261012145104_consolidated_audit_database_hardening'),
 ('função private.current_auth_session_is_active', to_regprocedure('private.current_auth_session_is_active()') is not null, '20261012145104_consolidated_audit_database_hardening'),
 ('função private.current_user_can_admin',     to_regprocedure('private.current_user_can_admin()') is not null,  '20261012145104_consolidated_audit_database_hardening'),
 ('função private.current_user_can_staff',     to_regprocedure('private.current_user_can_staff()') is not null,  '20261012145104_consolidated_audit_database_hardening'),
 ('tabela public.interactive_resource_entries', to_regclass('public.interactive_resource_entries') is not null, '202609100010_interactive_resource_entries'),
 ('tabela public.pause_sessions',              to_regclass('public.pause_sessions') is not null,                 '202609110011_pause_sessions'),
 ('tabela public.listening_sessions',          to_regclass('public.listening_sessions') is not null,             '202609120001_listening_sessions'),
 ('tabela public.river_sessions',              to_regclass('public.river_sessions') is not null,                 '202609120002_river_sessions'),
 ('tabela public.need_records',                to_regclass('public.need_records') is not null,                   '202609130008_need_records'),
 ('Recursos v2 já aplicada (tipo fv_resource_key)', to_regtype('public.fv_resource_key') is not null,           '20261012161154_recursos_interativos_v2'),
 ('Devolução editorial já aplicada (review_note)', exists(select 1 from information_schema.columns where table_schema='public' and table_name='resource_content_versions' and column_name='review_note'), '20261013090000_recursos_editorial_devolucao'),
 ('Administração também escreve',              exists(select 1 from pg_proc where proname='fv_resource_transition' and prosrc like '%not(author_ok or admin_ok) or current_row.status<>''draft''%'), '20261013100000_recursos_admin_autoria'),
 ('Modo demonstração (coluna demo)',           exists(select 1 from information_schema.columns where table_schema='public' and table_name='resource_content_versions' and column_name='demo'), '20261013110000_recursos_modo_demonstracao'),
 ('Recursos publicados como demonstração',     (select count(*) from public.resource_content_versions where status='published' and to_jsonb(resource_content_versions)->>'demo'='true') > 0, '02_conteudo_demonstracao.sql')
) as d(item, existe, origem);
