-- Each roadmap gets 1 regeneration. Track usage.
alter table public.roadmaps
  add column if not exists regeneration_count int not null default 0 check (regeneration_count >= 0 and regeneration_count <= 1);
