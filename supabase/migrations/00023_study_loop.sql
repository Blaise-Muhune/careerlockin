-- Daily study cards, spaced reviews, cached page reads, and job-market snapshots.

create table if not exists public.study_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id uuid not null references public.roadmap_steps(id) on delete cascade,
  mode text not null check (mode in ('example', 'build', 'recall')),
  example text not null,
  try_this text not null,
  question text not null,
  focus text,
  resource_url text,
  resource_title text,
  due timestamptz not null default now(),
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  elapsed_days int not null default 0,
  scheduled_days int not null default 0,
  learning_steps int not null default 0,
  reps int not null default 0,
  lapses int not null default 0,
  state int not null default 0,
  last_review timestamptz,
  last_answer text,
  last_correction text,
  last_rating smallint check (last_rating is null or last_rating between 1 and 4),
  check_kind text check (check_kind is null or check_kind in ('code', 'repo')),
  check_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create index if not exists study_cards_user_due_idx on public.study_cards(user_id, due);

create table if not exists public.study_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.study_cards(id) on delete cascade,
  answer text,
  rating smallint not null check (rating between 1 and 4),
  correction text,
  created_at timestamptz not null default now()
);

create index if not exists study_reviews_card_id_idx on public.study_reviews(card_id);

-- Shared cache of public documentation pages. No user policies: service role only.
create table if not exists public.resource_reads (
  url text primary key,
  markdown text not null,
  fetched_at timestamptz not null default now()
);

create table if not exists public.roadmap_market_snapshots (
  roadmap_id uuid primary key references public.roadmaps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  occupation_title text,
  signals text[] not null default '{}',
  refreshed_at timestamptz not null default now()
);

alter table public.roadmap_steps
  add column if not exists is_market_optional boolean not null default false;

alter table public.study_cards enable row level security;
alter table public.study_reviews enable row level security;
alter table public.resource_reads enable row level security;
alter table public.roadmap_market_snapshots enable row level security;

create policy "study_cards_select_own" on public.study_cards
  for select using (user_id = auth.uid());
create policy "study_cards_insert_own" on public.study_cards
  for insert with check (user_id = auth.uid());
create policy "study_cards_update_own" on public.study_cards
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "study_cards_delete_own" on public.study_cards
  for delete using (user_id = auth.uid());

create policy "study_reviews_select_own" on public.study_reviews
  for select using (user_id = auth.uid());
create policy "study_reviews_insert_own" on public.study_reviews
  for insert with check (user_id = auth.uid());

create policy "market_snapshots_select_own" on public.roadmap_market_snapshots
  for select using (user_id = auth.uid());
create policy "market_snapshots_insert_own" on public.roadmap_market_snapshots
  for insert with check (user_id = auth.uid());
create policy "market_snapshots_update_own" on public.roadmap_market_snapshots
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists study_cards_updated_at on public.study_cards;
create trigger study_cards_updated_at
  before update on public.study_cards
  for each row execute function public.set_updated_at();
