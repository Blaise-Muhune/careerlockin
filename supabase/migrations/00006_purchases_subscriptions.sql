-- purchases: one-time unlocks (e.g. roadmap_unlock)
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  stripe_customer_id text,
  stripe_payment_intent_id text unique,
  status text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, product_key)
);

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_stripe_payment_intent_id_idx on public.purchases(stripe_payment_intent_id);

-- subscriptions: monthly Pro (one per user)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);

-- updated_at triggers
create trigger purchases_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- RLS: users may only SELECT their own rows; writes happen via service role in webhook
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;

create policy "purchases_select_own" on public.purchases
  for select using (user_id = auth.uid());

-- no insert/update/delete for anon/authenticated; webhook uses service role

create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid());

-- no insert/update/delete for anon/authenticated; webhook uses service role
