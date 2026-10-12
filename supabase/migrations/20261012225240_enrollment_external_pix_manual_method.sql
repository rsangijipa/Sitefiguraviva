begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';
-- Some deployed databases still have the original constraint without manual.
alter table public.enrollments drop constraint if exists enrollments_payment_method_check;
alter table public.enrollments add constraint enrollments_payment_method_check
  check (payment_method is null or payment_method in ('pix', 'stripe', 'subscription', 'free', 'manual'));
notify pgrst, 'reload schema';
commit;
