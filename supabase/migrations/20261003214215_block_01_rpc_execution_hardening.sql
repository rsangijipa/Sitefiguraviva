-- Administrative RPCs need the service role, which already has table access
-- and bypasses RLS. They do not need the function owner's privileges.
begin;

do $$
declare target_table text;
begin
  foreach target_table in array array['public.lessons','public.courses','public.book_recommendations'] loop
    if not has_table_privilege('service_role', target_table, 'SELECT')
       or not has_table_privilege('service_role', target_table, 'UPDATE') then
      raise exception 'Missing service_role access to %; review grants before applying', target_table;
    end if;
  end loop;
end;
$$;

alter function public.save_lesson_content(text, text, text, jsonb) security invoker;
alter function public.bump_course_content_revision(text) security invoker;
alter function public.reorder_book_recommendations(uuid[]) security invoker;

revoke all on function public.save_lesson_content(text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.bump_course_content_revision(text) from public, anon, authenticated;
revoke all on function public.reorder_book_recommendations(uuid[]) from public, anon, authenticated;

grant execute on function public.save_lesson_content(text, text, text, jsonb) to service_role;
grant execute on function public.bump_course_content_revision(text) to service_role;
grant execute on function public.reorder_book_recommendations(uuid[]) to service_role;

-- Keep policy lookup functions unchanged: authenticated RLS depends on them.
commit;
