-- Allow curated fallback resources and freer prior_exposure skills.
alter table public.resources
  drop constraint if exists resources_verification_status_check;

alter table public.resources
  add constraint resources_verification_status_check
  check (
    verification_status is null
    or verification_status in ('verified', 'unverified', 'fallback')
  );

comment on column public.resources.verification_status is
  'verified = web_search grounded; fallback = curated canonical docs; unverified should not ship.';

-- Drop enum-only check so users can store real skill strings (validated in app).
alter table public.profiles
  drop constraint if exists profiles_prior_exposure_check;
