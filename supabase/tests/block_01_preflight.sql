-- Read-only release preflight; contains no identities or credentials.
select jsonb_build_object(
  'active_admin_profiles', (select count(*) from public.profiles where role::text in ('admin','administrador') and is_active = true),
  'service_table_access', (
    select jsonb_agg(jsonb_build_object('table', x.name,
      'select', has_table_privilege('service_role', x.name, 'SELECT'),
      'update', has_table_privilege('service_role', x.name, 'UPDATE')))
    from (values ('public.lessons'),('public.courses'),('public.book_recommendations')) x(name)
  ),
  'role_helpers', (
    select jsonb_agg(jsonb_build_object('name',p.proname,'definition',pg_get_functiondef(p.oid)))
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('current_user_can_admin','current_user_can_staff')
  )
) as preflight;
