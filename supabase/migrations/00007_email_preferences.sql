-- Email preferences on profiles (all opt-in, default true for backward compatibility)
alter table public.profiles
  add column if not exists email_weekly_recap boolean not null default true,
  add column if not exists email_inactivity_nudge boolean not null default true,
  add column if not exists email_milestones boolean not null default true,
  add column if not exists last_inactivity_nudge_at timestamptz;

-- Track which phase-completion emails we sent (avoid duplicates)
create table if not exists public.email_milestone_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  phase text not null,
  sent_at timestamptz default now() not null,
  unique(user_id, roadmap_id, phase)
);

create index if not exists email_milestone_sent_user_roadmap_idx
  on public.email_milestone_sent(user_id, roadmap_id);

-- RLS: only service role should read/write (cron jobs). No policies = no anon/auth access.
alter table public.email_milestone_sent enable row level security;

-- No policies: table is server-only for cron. Service role bypasses RLS.
