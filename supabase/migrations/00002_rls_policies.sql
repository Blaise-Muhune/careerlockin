-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_steps enable row level security;
alter table public.resources enable row level security;
alter table public.progress enable row level security;
alter table public.weekly_checkins enable row level security;

-- profiles: user_id = auth.uid()
create policy "profiles_select_own" on public.profiles
  for select using (user_id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (user_id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "profiles_delete_own" on public.profiles
  for delete using (user_id = auth.uid());

-- roadmaps: user_id = auth.uid()
create policy "roadmaps_select_own" on public.roadmaps
  for select using (user_id = auth.uid());

create policy "roadmaps_insert_own" on public.roadmaps
  for insert with check (user_id = auth.uid());

create policy "roadmaps_update_own" on public.roadmaps
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "roadmaps_delete_own" on public.roadmaps
  for delete using (user_id = auth.uid());

-- roadmap_steps: access only through a roadmap owned by auth.uid()
create policy "roadmap_steps_select_via_own_roadmap" on public.roadmap_steps
  for select using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

create policy "roadmap_steps_insert_via_own_roadmap" on public.roadmap_steps
  for insert with check (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_id and r.user_id = auth.uid()
    )
  );

create policy "roadmap_steps_update_via_own_roadmap" on public.roadmap_steps
  for update using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_id and r.user_id = auth.uid()
    )
  );

create policy "roadmap_steps_delete_via_own_roadmap" on public.roadmap_steps
  for delete using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

-- resources: access only through a step whose roadmap is owned by auth.uid()
create policy "resources_select_via_own_roadmap" on public.resources
  for select using (
    exists (
      select 1 from public.roadmap_steps rs
      join public.roadmaps r on r.id = rs.roadmap_id
      where rs.id = resources.step_id and r.user_id = auth.uid()
    )
  );

create policy "resources_insert_via_own_roadmap" on public.resources
  for insert with check (
    exists (
      select 1 from public.roadmap_steps rs
      join public.roadmaps r on r.id = rs.roadmap_id
      where rs.id = step_id and r.user_id = auth.uid()
    )
  );

create policy "resources_update_via_own_roadmap" on public.resources
  for update using (
    exists (
      select 1 from public.roadmap_steps rs
      join public.roadmaps r on r.id = rs.roadmap_id
      where rs.id = resources.step_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.roadmap_steps rs
      join public.roadmaps r on r.id = rs.roadmap_id
      where rs.id = step_id and r.user_id = auth.uid()
    )
  );

create policy "resources_delete_via_own_roadmap" on public.resources
  for delete using (
    exists (
      select 1 from public.roadmap_steps rs
      join public.roadmaps r on r.id = rs.roadmap_id
      where rs.id = resources.step_id and r.user_id = auth.uid()
    )
  );

-- progress: user_id = auth.uid()
create policy "progress_select_own" on public.progress
  for select using (user_id = auth.uid());

create policy "progress_insert_own" on public.progress
  for insert with check (user_id = auth.uid());

create policy "progress_update_own" on public.progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "progress_delete_own" on public.progress
  for delete using (user_id = auth.uid());

-- weekly_checkins: user_id = auth.uid()
create policy "weekly_checkins_select_own" on public.weekly_checkins
  for select using (user_id = auth.uid());

create policy "weekly_checkins_insert_own" on public.weekly_checkins
  for insert with check (user_id = auth.uid());

create policy "weekly_checkins_update_own" on public.weekly_checkins
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "weekly_checkins_delete_own" on public.weekly_checkins
  for delete using (user_id = auth.uid());
