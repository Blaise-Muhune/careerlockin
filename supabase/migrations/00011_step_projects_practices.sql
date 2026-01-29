-- Store phase projects and optional practices without new tables
alter table public.roadmap_steps
  add column if not exists phase_project jsonb,
  add column if not exists practices jsonb;

