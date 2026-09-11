alter table public.profiles
  add column if not exists bio text,
  add column if not exists phone_number text,
  add column if not exists profession text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists date_of_birth date,
  add column if not exists instagram text,
  add column if not exists profile_completion integer not null default 0,
  add column if not exists profile_completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_profile_completion_range'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_profile_completion_range
      check (profile_completion between 0 and 100);
  end if;
end $$;
