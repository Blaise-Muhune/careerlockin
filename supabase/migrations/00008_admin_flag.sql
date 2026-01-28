-- Admin access: is_admin on profiles. Set via service role / SQL only.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is 'Admin dashboard access. Set via Supabase SQL or service role only.';
