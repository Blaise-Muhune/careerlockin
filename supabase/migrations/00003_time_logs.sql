-- time_logs: daily time entries for weekly aggregation
create table public.time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  minutes int not null check (minutes between 1 and 1440),
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index time_logs_user_id_log_date_idx on public.time_logs(user_id, log_date);

create trigger time_logs_updated_at
  before update on public.time_logs
  for each row execute function public.set_updated_at();

-- RLS for time_logs
alter table public.time_logs enable row level security;

create policy "time_logs_select_own" on public.time_logs
  for select using (user_id = auth.uid());

create policy "time_logs_insert_own" on public.time_logs
  for insert with check (user_id = auth.uid());

create policy "time_logs_update_own" on public.time_logs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "time_logs_delete_own" on public.time_logs
  for delete using (user_id = auth.uid());
