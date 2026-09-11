alter table public.announcements
  add column if not exists publish_at timestamptz not null default now();

update public.announcements
set publish_at = created_at
where publish_at is null;

create index if not exists announcements_course_publish_at_idx
  on public.announcements (course_id, publish_at desc);
