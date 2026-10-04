alter table public.assessments
  add column if not exists is_required boolean not null default false;
