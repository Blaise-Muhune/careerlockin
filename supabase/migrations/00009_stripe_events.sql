-- Idempotency for Stripe webhooks: record processed event ids so repeats are no-ops.
-- Webhook handler uses service role (bypasses RLS). No user-facing access.
create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_type text not null,
  received_at timestamptz default now() not null
);

create index if not exists stripe_events_event_id_idx on public.stripe_events(event_id);

alter table public.stripe_events enable row level security;

-- No select/insert/update/delete for anon or authenticated; webhook uses service role
create policy "stripe_events_no_direct_access"
  on public.stripe_events
  for all
  using (false)
  with check (false);
