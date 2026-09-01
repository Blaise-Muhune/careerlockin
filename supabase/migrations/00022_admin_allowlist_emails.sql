-- Grant admin dashboard access to founder allowlisted emails.
-- is_admin remains protected from client self-promotion (00017).

create or replace function public.grant_admin_for_allowlisted_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
begin
  select lower(email) into user_email
  from auth.users
  where id = new.user_id;

  if user_email in ('blaisemu007@gmail.com', 'muyumba@andrews.edu') then
    new.is_admin := true;
  end if;

  return new;
end;
$$;

comment on function public.grant_admin_for_allowlisted_emails() is
  'Sets profiles.is_admin on insert for founder allowlisted auth emails.';

drop trigger if exists profiles_grant_admin_allowlist on public.profiles;

create trigger profiles_grant_admin_allowlist
  before insert on public.profiles
  for each row
  execute function public.grant_admin_for_allowlisted_emails();

-- Existing accounts (must already have signed up).
update public.profiles p
set is_admin = true
from auth.users u
where p.user_id = u.id
  and lower(u.email) in ('blaisemu007@gmail.com', 'muyumba@andrews.edu');
