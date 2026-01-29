-- Networking Support (minimal, phase-aware tracking)
-- Philosophy: track attempts, not outcomes.

-- A) profiles: add networking-related fields (backward compatible)
alter table public.profiles
  add column if not exists linkedin_url text,
  add column if not exists networking_weekly_goal int not null default 1 check (networking_weekly_goal between 0 and 14),
  add column if not exists networking_preference text not null default 'balanced'
    check (networking_preference in ('balanced', 'quiet', 'active'));

-- B) networking_actions: record small weekly actions
create table if not exists public.networking_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_date date not null,
  action_type text not null check (action_type in (
    'outreach_sent',
    'follow_up_sent',
    'comment_left',
    'post_published',
    'coffee_chat_requested'
  )),
  -- If you later add a phases table, migrate this to a FK.
  context_phase_id uuid,
  notes text,
  created_at timestamptz default now() not null
);

create index if not exists networking_actions_user_id_idx on public.networking_actions(user_id);
create index if not exists networking_actions_user_id_action_date_idx on public.networking_actions(user_id, action_date);

-- RLS: users may CRUD only their own networking_actions
alter table public.networking_actions enable row level security;

create policy "networking_actions_select_own" on public.networking_actions
  for select using (user_id = auth.uid());

create policy "networking_actions_insert_own" on public.networking_actions
  for insert with check (user_id = auth.uid());

create policy "networking_actions_update_own" on public.networking_actions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "networking_actions_delete_own" on public.networking_actions
  for delete using (user_id = auth.uid());

