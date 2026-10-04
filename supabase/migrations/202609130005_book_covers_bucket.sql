-- Isolated public bucket for authorized book-cover images used by the Estante feature.
-- Safe to run repeatedly in the Supabase SQL editor.
insert into storage.buckets (id, name, public)
values ('public-book-covers', 'public-book-covers', true)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[];

update storage.buckets
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
where id = 'public-book-covers';

drop policy if exists book_covers_public_read on storage.objects;
create policy book_covers_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'public-book-covers');

drop policy if exists book_covers_staff_insert on storage.objects;
create policy book_covers_staff_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'public-book-covers'
    and (select public.current_user_can_staff())
  );

drop policy if exists book_covers_staff_update on storage.objects;
create policy book_covers_staff_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'public-book-covers'
    and (select public.current_user_can_staff())
  )
  with check (
    bucket_id = 'public-book-covers'
    and (select public.current_user_can_staff())
  );

drop policy if exists book_covers_staff_delete on storage.objects;
create policy book_covers_staff_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'public-book-covers'
    and (select public.current_user_can_staff())
  );
