-- Prevent authenticated users from self-promoting via profiles UPDATE RLS.
-- Service role / SQL (bypass RLS) and postgres superuser still can set is_admin.

create or replace function public.protect_profiles_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Block client roles only; service_role and direct SQL (null role) may change the flag.
  if tg_op = 'UPDATE'
     and new.is_admin is distinct from old.is_admin
     and coalesce(auth.role(), '') in ('authenticated', 'anon') then
    raise exception 'is_admin can only be changed via service role or SQL';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_is_admin on public.profiles;

create trigger profiles_protect_is_admin
  before update on public.profiles
  for each row
  execute function public.protect_profiles_is_admin();

comment on function public.protect_profiles_is_admin() is
  'Blocks non-service-role changes to profiles.is_admin.';
