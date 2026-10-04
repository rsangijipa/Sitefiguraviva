create or replace function public.save_lesson_content(
  p_course_id text,
  p_module_id text,
  p_lesson_id text,
  p_blocks jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lessons
  set blocks = p_blocks,
      updated_at = now()
  where id = p_lesson_id
    and course_id = p_course_id
    and module_id = p_module_id;

  if not found then
    raise exception 'Lesson not found';
  end if;

  update public.courses
  set content_revision = coalesce(content_revision, 0) + 1,
      updated_at = now()
  where id = p_course_id;

  if not found then
    raise exception 'Course not found';
  end if;
end;
$$;

revoke all on function public.save_lesson_content(text, text, text, jsonb) from public;
grant execute on function public.save_lesson_content(text, text, text, jsonb) to service_role;
