-- Canonical, atomic content-version increment for administrative course edits.
create or replace function public.bump_course_content_revision(p_course_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_revision integer;
begin
  update public.courses
  set content_revision = coalesce(content_revision, 0) + 1,
      updated_at = now()
  where id = p_course_id
  returning content_revision into next_revision;

  if not found then
    raise exception 'Course not found';
  end if;

  return next_revision;
end;
$$;

revoke all on function public.bump_course_content_revision(text) from public;
grant execute on function public.bump_course_content_revision(text) to service_role;
