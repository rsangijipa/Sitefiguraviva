-- Profile details migrated from the legacy document store.
-- These fields remain on the existing profile row so RLS ownership continues
-- to be enforced by the profile policies created in the LMS foundation.

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

alter table public.profiles
  drop constraint if exists profiles_profile_completion_range,
  add constraint profiles_profile_completion_range
    check (profile_completion between 0 and 100);
