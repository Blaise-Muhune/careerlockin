-- Allow up to 3 regenerations per roadmap (app enforces Free/Unlock = 1, Pro = 3).
alter table public.roadmaps
  drop constraint if exists roadmaps_regeneration_count_check;

alter table public.roadmaps
  add constraint roadmaps_regeneration_count_check
  check (regeneration_count >= 0 and regeneration_count <= 3);

comment on column public.roadmaps.regeneration_count is
  'Times this roadmap was regenerated. Cap 3 in DB; Free/Unlock limited to 1 in app, Pro to 3.';
