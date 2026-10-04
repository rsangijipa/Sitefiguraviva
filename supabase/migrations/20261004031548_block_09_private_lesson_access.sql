begin;
set local lock_timeout='5s';
set local statement_timeout='30s';

-- A caller can inspect only their own persisted profile and enrollment.
create function public.can_current_user_read_course_outline(p_course text,p_published boolean)
returns boolean language sql stable security invoker set search_path=public as $$
 select coalesce(exists(
  select 1 from public.profiles p join public.courses c on c.id=p_course
  where p.id=(select auth.uid()) and p.is_active=true and (
   p.role::text in ('admin','administrador') or (
    c.is_published=true and c.status in ('open','closed') and (
     c.team->p.id::text->>'role' in ('author','tutor','admin') or (
      p_published=true and exists(select 1 from public.enrollments e
       where e.user_id=p.id and e.course_id=c.id and e.status in ('active','completed')
       and (e.access_until is null or e.access_until>now()))
     )
    )
   )
  )
 ),false);
$$;
revoke all on function public.can_current_user_read_course_outline(text,boolean) from public,anon;
grant execute on function public.can_current_user_read_course_outline(text,boolean) to authenticated,service_role;

alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
drop policy if exists course_modules_read_public_or_enrolled on public.course_modules;
drop policy if exists lessons_read_public_preview_or_enrolled on public.lessons;
create policy course_modules_read_authorized on public.course_modules for select to authenticated
 using(public.can_current_user_read_course_outline(course_id,is_published));
create policy course_modules_restricted_read on public.course_modules as restrictive for select to authenticated
 using(public.can_current_user_read_course_outline(course_id,is_published));
create policy lessons_read_authorized on public.lessons for select to authenticated
 using(public.can_current_user_read_course_outline(course_id,is_published) and exists(
  select 1 from public.course_modules m where m.id=lessons.module_id and m.course_id=lessons.course_id
  and public.can_current_user_read_course_outline(m.course_id,m.is_published)));
create policy lessons_restricted_read on public.lessons as restrictive for select to authenticated
 using(public.can_current_user_read_course_outline(course_id,is_published) and exists(
  select 1 from public.course_modules m where m.id=lessons.module_id and m.course_id=lessons.course_id
  and public.can_current_user_read_course_outline(m.course_id,m.is_published)));

-- RLS filters rows, not nested JSON blocks. Sensitive columns are server-only.
revoke all on public.course_modules,public.lessons from public,anon,authenticated;
do $$ declare r record; begin
 for r in select table_name,column_name from information_schema.columns
  where table_schema='public' and table_name in ('course_modules','lessons') loop
  execute format('revoke all (%I) on public.%I from public,anon,authenticated',r.column_name,r.table_name);
 end loop;
end $$;
grant select(id,course_id,title,description,sort_order,is_published,slug,created_at,updated_at)
 on public.course_modules to authenticated;
grant select(id,course_id,module_id,title,description,sort_order,is_published,slug,type,duration_minutes,thumbnail_url,is_free_preview,created_at,updated_at)
 on public.lessons to authenticated;
grant select,insert,update,delete on public.course_modules,public.lessons to service_role;
notify pgrst,'reload schema';
commit;
