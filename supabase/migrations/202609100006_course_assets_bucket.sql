-- Public documents are uploaded to the shared course-assets bucket.
-- This is safe to run repeatedly in the Supabase SQL editor.
insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = true;

drop policy if exists course_assets_public_read on storage.objects;
create policy course_assets_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'course-assets');

drop policy if exists course_assets_staff_insert on storage.objects;
create policy course_assets_staff_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-assets'
    and (select public.current_user_can_staff())
  );

drop policy if exists course_assets_staff_update on storage.objects;
create policy course_assets_staff_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-assets'
    and (select public.current_user_can_staff())
  )
  with check (
    bucket_id = 'course-assets'
    and (select public.current_user_can_staff())
  );

drop policy if exists course_assets_staff_delete on storage.objects;
create policy course_assets_staff_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-assets'
    and (select public.current_user_can_staff())
  );
