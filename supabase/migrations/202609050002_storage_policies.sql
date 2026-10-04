-- Public course imagery lives in a deliberately public bucket. All other
-- user-uploaded material belongs in the private uploads bucket and must be
-- accessed through an authorized request or a short-lived signed URL.

insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists figure_viva_course_assets_public_select on storage.objects;
create policy figure_viva_course_assets_public_select
  on storage.objects
  for select
  to public
  using (bucket_id = 'course-assets');

drop policy if exists figure_viva_managed_assets_admin_select on storage.objects;
create policy figure_viva_managed_assets_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id in ('course-assets', 'uploads')
    and (select public.current_user_can_admin())
  );

drop policy if exists figure_viva_managed_assets_admin_insert on storage.objects;
create policy figure_viva_managed_assets_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('course-assets', 'uploads')
    and (select public.current_user_can_admin())
  );

drop policy if exists figure_viva_managed_assets_admin_update on storage.objects;
create policy figure_viva_managed_assets_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('course-assets', 'uploads')
    and (select public.current_user_can_admin())
  )
  with check (
    bucket_id in ('course-assets', 'uploads')
    and (select public.current_user_can_admin())
  );

drop policy if exists figure_viva_managed_assets_admin_delete on storage.objects;
create policy figure_viva_managed_assets_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('course-assets', 'uploads')
    and (select public.current_user_can_admin())
  );
