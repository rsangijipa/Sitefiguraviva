create table if not exists public.applications (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  consent jsonb not null default '{}'::jsonb,
  status text not null default 'submitted',
  source text not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_course_idx
  on public.applications (user_id, course_id);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;
