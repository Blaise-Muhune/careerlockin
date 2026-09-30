-- Stepwise lesson on an existing study card. Run after 00023_study_loop.sql.

alter table public.study_cards
  add column if not exists steps jsonb not null default '[]'::jsonb;

alter table public.study_cards
  add column if not exists step_index int not null default 0;
