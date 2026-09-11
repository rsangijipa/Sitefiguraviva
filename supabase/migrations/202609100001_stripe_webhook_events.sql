create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  livemode boolean not null default false,
  event_created_at timestamptz,
  status text not null check (status in ('processing', 'done', 'error')),
  processing_started_at timestamptz not null default now(),
  processed_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_status_created_idx
  on public.stripe_webhook_events (status, created_at desc);

alter table public.stripe_webhook_events enable row level security;

drop policy if exists stripe_webhook_events_service_only on public.stripe_webhook_events;
create policy stripe_webhook_events_service_only
  on public.stripe_webhook_events
  for all
  to service_role
  using (true)
  with check (true);
