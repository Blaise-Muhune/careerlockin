-- current_work: one row per user, tracks which step they are working on
create table public.current_work (
  user_id uuid primary key references auth.users(id) on delete cascade,
  roadmap_id uuid references public.roadmaps(id) on delete set null,
  phase_title text,
  step_id uuid references public.roadmap_steps(id) on delete set null,
  status text not null default 'in_progress' check (status in ('in_progress', 'paused', 'completed')),
  started_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create trigger current_work_updated_at
  before update on public.current_work
  for each row execute function public.set_updated_at();

alter table public.current_work enable row level security;

create policy "current_work_select_own" on public.current_work
  for select using (user_id = auth.uid());

create policy "current_work_insert_own" on public.current_work
  for insert with check (user_id = auth.uid());

create policy "current_work_update_own" on public.current_work
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "current_work_delete_own" on public.current_work
  for delete using (user_id = auth.uid());
