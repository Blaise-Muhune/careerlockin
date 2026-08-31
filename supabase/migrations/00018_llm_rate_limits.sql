-- Per-user LLM generation rate limiting (service role writes; users read own).
create table if not exists public.llm_generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists llm_generation_events_user_created_idx
  on public.llm_generation_events (user_id, created_at desc);

alter table public.llm_generation_events enable row level security;

create policy "llm_generation_events_select_own"
  on public.llm_generation_events
  for select
  using (user_id = auth.uid());

-- inserts/deletes via service role only (no insert policy for authenticated)
