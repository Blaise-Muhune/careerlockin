-- Add personalization fields to profiles for roadmap quality
-- Backward compatible: goal_intent defaults for existing rows; optional fields nullable
alter table public.profiles
  add column if not exists goal_intent text not null default 'skill_upgrade' check (goal_intent in ('job', 'internship', 'career_switch', 'skill_upgrade')),
  add column if not exists target_timeline_weeks int check (target_timeline_weeks is null or target_timeline_weeks in (8, 12, 16, 24)),
  add column if not exists prior_exposure text[] check (prior_exposure is null or prior_exposure <@ array['html_css', 'javascript', 'git', 'react', 'databases', 'apis', 'python', 'none']::text[]),
  add column if not exists learning_preference text check (learning_preference is null or learning_preference in ('reading', 'video', 'project_first', 'mixed'));
