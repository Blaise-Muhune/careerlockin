-- Lightweight product funnel events (service role writes; users cannot read others').
create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_name_created_idx
  on public.product_events (event_name, created_at desc);

create index if not exists product_events_user_created_idx
  on public.product_events (user_id, created_at desc);

alter table public.product_events enable row level security;

-- No client policies: inserts via service role only; admin can query via service role.
create policy "product_events_no_direct_access"
  on public.product_events
  for all
  using (false)
  with check (false);
