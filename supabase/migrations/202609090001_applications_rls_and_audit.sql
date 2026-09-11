-- Harden the application workflow after enabling RLS on applications.
-- Admin screens currently use the browser client, while public submission
-- goes through the server route with the service role.

drop policy if exists applications_read_own_or_admin on public.applications;
create policy applications_read_own_or_admin
  on public.applications for select to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_admin()));

drop policy if exists applications_insert_own on public.applications;
create policy applications_insert_own
  on public.applications for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists applications_update_own_or_admin on public.applications;
create policy applications_update_own_or_admin
  on public.applications for update to authenticated
  using (user_id = (select auth.uid()) or (select public.current_user_can_admin()))
  with check (user_id = (select auth.uid()) or (select public.current_user_can_admin()));

drop policy if exists applications_delete_admin on public.applications;
create policy applications_delete_admin
  on public.applications for delete to authenticated
  using ((select public.current_user_can_admin()));

create index if not exists applications_status_created_idx
  on public.applications (status, created_at desc);
