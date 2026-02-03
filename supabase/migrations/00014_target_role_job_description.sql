-- Optional job description to tailor roadmap to real requirements
alter table public.profiles
  add column if not exists target_role_job_description text check (char_length(target_role_job_description) <= 2000);
