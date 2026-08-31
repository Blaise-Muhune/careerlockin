-- Recoverable webhook idempotency: only short-circuit when processing finished.
alter table public.stripe_events
  add column if not exists processed_at timestamptz;

comment on column public.stripe_events.processed_at is
  'Set when handler finishes successfully. Null means Stripe may retry safely.';
