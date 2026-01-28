-- profiles: one per auth user, onboarding + target role
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  target_role text not null,
  weekly_hours int not null,
  current_level text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index profiles_user_id_idx on public.profiles(user_id);

-- roadmaps: generated roadmaps per user
create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_role text not null,
  version int default 1 not null,
  model text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index roadmaps_user_id_idx on public.roadmaps(user_id);
create index roadmaps_user_id_updated_at_idx on public.roadmaps(user_id, updated_at desc);

-- roadmap_steps: phases/steps of a roadmap
create table public.roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  phase text not null,
  title text not null,
  description text not null,
  est_hours numeric,
  step_order int not null,
  created_at timestamptz default now() not null
);

create index roadmap_steps_roadmap_id_idx on public.roadmap_steps(roadmap_id);

-- resources: links/materials per step
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.roadmap_steps(id) on delete cascade,
  title text not null,
  url text not null,
  resource_type text,
  is_free boolean default true not null,
  created_at timestamptz default now() not null
);

create index resources_step_id_idx on public.resources(step_id);

-- progress: user completion per step
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id uuid not null references public.roadmap_steps(id) on delete cascade,
  is_done boolean default false not null,
  done_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, step_id)
);

create index progress_user_id_idx on public.progress(user_id);
create index progress_step_id_idx on public.progress(step_id);

-- weekly_checkins: per-user per week
create table public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  planned_hours int,
  completed_hours int,
  notes text,
  created_at timestamptz default now() not null,
  unique(user_id, week_start)
);

create index weekly_checkins_user_id_idx on public.weekly_checkins(user_id);
create index weekly_checkins_user_week_idx on public.weekly_checkins(user_id, week_start desc);

-- updated_at triggers for profiles, roadmaps, progress
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger roadmaps_updated_at
  before update on public.roadmaps
  for each row execute function public.set_updated_at();

create trigger progress_updated_at
  before update on public.progress
  for each row execute function public.set_updated_at();
