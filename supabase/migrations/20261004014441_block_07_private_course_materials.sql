begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
alter table public.lesson_materials add column visibility text not null default 'enrolled' check(visibility in ('enrolled','after_completion','team_only'));
alter table public.lesson_materials add column storage_bucket text;
alter table public.lesson_materials add column storage_path text;
alter table public.lesson_materials add column module_id text references public.course_modules(id) on delete set null;
-- Preserve recognized legacy restrictions; unknown legacy values stay hidden from students.
update public.lesson_materials set visibility=case when legacy_payload->>'visibility' in ('enrolled','after_completion','team_only') then legacy_payload->>'visibility' when legacy_payload ? 'visibility' then 'team_only' else 'enrolled' end;
alter table public.lesson_materials add constraint lesson_materials_storage_reference check(
 (storage_bucket is null and storage_path is null) or
 (storage_bucket is not null and storage_bucket='course-materials' and storage_path is not null and storage_path like ('courses/'||course_id||'/materials/%') and storage_path !~ '(^|/)\.\.(/|$)' and url='')
);
-- Existing unmanaged URLs remain classified for review; new file records must use the private bucket.
create function public.enforce_material_file_reference() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.module_id is not null and not exists(select 1 from public.course_modules where id=new.module_id and course_id=new.course_id) then raise exception 'Module must belong to material course'; end if;
 if new.lesson_id is not null and not exists(select 1 from public.lessons where id=new.lesson_id and course_id=new.course_id and (new.module_id is null or module_id=new.module_id)) then raise exception 'Lesson must belong to material course and module'; end if;
 if new.type in ('pdf','archive') and new.storage_bucket is null and (tg_op='INSERT' or old.type is distinct from new.type or old.url is distinct from new.url or old.storage_bucket is distinct from new.storage_bucket or old.storage_path is distinct from new.storage_path) then raise exception 'Private file reference required'; end if;
 if new.type='link' and (new.storage_bucket is not null or new.url !~ '^https://[^[:space:]]+$') then raise exception 'HTTPS external link required'; end if;
 return new;
end $$;
create trigger lesson_materials_validate_reference before insert or update on public.lesson_materials for each row execute function public.enforce_material_file_reference();
revoke all on function public.enforce_material_file_reference() from public,anon,authenticated;

create function public.can_user_read_course_material(p_user uuid,p_course text,p_visibility text,p_published boolean,p_module text,p_lesson text)
returns boolean language sql stable security invoker set search_path=public as $$
 select coalesce((p_user=(select auth.uid()) or current_user='service_role') and exists(
  select 1 from public.profiles p join public.courses c on c.id=p_course where p.id=p_user and p.is_active=true and (
   p.role::text in ('admin','administrador') or (
    c.is_published=true and c.status in ('open','closed') and (
     c.team->p_user::text->>'role' in ('author','tutor','admin') or (
      p_published=true and p_visibility in ('enrolled','after_completion') and
      (p_module is null or exists(select 1 from public.course_modules m where m.id=p_module and m.course_id=c.id and m.is_published)) and
      (p_lesson is null or exists(select 1 from public.lessons l join public.course_modules m on m.id=l.module_id where l.id=p_lesson and l.course_id=c.id and l.is_published and m.is_published)) and
      exists(select 1 from public.enrollments e where e.user_id=p_user and e.course_id=c.id and e.status in ('active','completed') and (e.access_until is null or e.access_until>now()) and (p_visibility<>'after_completion' or e.status='completed'))
     )
    )
   )
  )
 ),false);
$$;
revoke all on function public.can_user_read_course_material(uuid,text,text,boolean,text,text) from public,anon;
grant execute on function public.can_user_read_course_material(uuid,text,text,boolean,text,text) to authenticated,service_role;
drop policy if exists lesson_materials_read_enrolled_or_staff on public.lesson_materials;
create policy lesson_materials_read_enrolled_or_staff on public.lesson_materials for select to authenticated using(public.can_user_read_course_material((select auth.uid()),course_id,visibility,is_published,module_id,lesson_id));
create policy lesson_materials_restricted_read on public.lesson_materials as restrictive for select to authenticated using(public.can_user_read_course_material((select auth.uid()),course_id,visibility,is_published,module_id,lesson_id));

create function public.resolve_course_material(p_user uuid,p_material text) returns jsonb language plpgsql security invoker set search_path=public as $$
declare m public.lesson_materials%rowtype;
begin
 select * into m from public.lesson_materials where id=p_material;
 if not found or not public.can_user_read_course_material(p_user,m.course_id,m.visibility,m.is_published,m.module_id,m.lesson_id) then raise exception 'Material not available' using errcode='42501'; end if;
 return to_jsonb(m);
end $$;
revoke all on function public.resolve_course_material(uuid,text) from public,anon,authenticated;
grant execute on function public.resolve_course_material(uuid,text) to service_role;

create function public.list_readable_course_materials(p_user uuid,p_course text) returns jsonb language sql stable security invoker set search_path=public as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'type',m.type,'description',m.description) order by m.created_at desc),'[]'::jsonb) from public.lesson_materials m where m.course_id=p_course and public.can_user_read_course_material(p_user,m.course_id,m.visibility,m.is_published,m.module_id,m.lesson_id);
$$;
revoke all on function public.list_readable_course_materials(uuid,text) from public,anon,authenticated;
grant execute on function public.list_readable_course_materials(uuid,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('course-materials','course-materials',false,10485760,array['application/pdf']),('public-avatars','public-avatars',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']);
create policy course_materials_no_direct_access on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'course-materials') with check(bucket_id<>'course-materials');
-- A broad permissive legacy read otherwise allows any authenticated user to read uploads.
create policy uploads_admin_only on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'uploads' or (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role::text in ('admin','administrador')))) with check(bucket_id<>'uploads' or (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role::text in ('admin','administrador'))));
create policy public_avatars_read on storage.objects for select to anon,authenticated using(bucket_id='public-avatars');
create policy public_avatars_admin_write on storage.objects for all to authenticated using(bucket_id='public-avatars' and (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role::text in ('admin','administrador')))) with check(bucket_id='public-avatars' and (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role::text in ('admin','administrador'))));
create policy course_materials_not_public_insert on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'course-assets' or name !~ '^courses/[^/]+/materials/');
create policy course_materials_not_public_update on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'course-assets' or name !~ '^courses/[^/]+/materials/') with check(bucket_id<>'course-assets' or name !~ '^courses/[^/]+/materials/');
revoke truncate,references,trigger on public.lesson_materials from anon,authenticated;
notify pgrst,'reload schema';
commit;
