-- Store when a canceled subscription ends so we can show "Pro until [date]"
alter table public.subscriptions
  add column if not exists cancel_at_period_end timestamptz;

comment on column public.subscriptions.cancel_at_period_end is
  'When set, subscription is canceled but active until this time (end of billing period).';
