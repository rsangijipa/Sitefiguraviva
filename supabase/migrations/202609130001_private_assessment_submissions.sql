-- Assessment evidence is sensitive. Public course assets must never contain it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-submissions',
  'assessment-submissions',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Browser clients never access this bucket. Server routes use service-role
-- authorization against the submission owner or staff claims.
drop policy if exists assessment_submissions_no_direct_read on storage.objects;
create policy assessment_submissions_no_direct_read
on storage.objects for select to authenticated
using (bucket_id <> 'assessment-submissions');

alter table public.assessment_submissions
  add column if not exists attachment_migration_state text not null default 'native'
  check (attachment_migration_state in ('native', 'legacy_pending', 'migrated', 'failed'));
