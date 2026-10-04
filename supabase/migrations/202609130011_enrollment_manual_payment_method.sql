-- Manual staff enrollments are a first-class Supabase payment method.
-- The original constraint omitted it even though the administrative actions
-- already write `payment_method = 'manual'`.
alter table public.enrollments
  drop constraint if exists enrollments_payment_method_check;

alter table public.enrollments
  add constraint enrollments_payment_method_check
  check (
    payment_method is null
    or payment_method in ('pix', 'stripe', 'subscription', 'free', 'manual')
  );
