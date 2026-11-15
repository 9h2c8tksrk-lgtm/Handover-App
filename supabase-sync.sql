-- Cross-device sync for the Handover App.
-- Run this once in the Supabase SQL editor of the Parts Tracker project
-- (the same project index.html already connects to).

create table if not exists public.handover_sync (
  id text primary key,          -- e.g. handover:<id>, task:<id>, pin:<name>, shift:current
  kind text not null,           -- handover | task | pin | shift
  value jsonb,                  -- the record itself; {"deleted":true} is a tombstone
  updated_at timestamptz not null default now()
);

create index if not exists handover_sync_updated_at on public.handover_sync (updated_at);

-- Keep updated_at server-side so last-write-wins works across devices with skewed clocks.
create or replace function public.handover_sync_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists handover_sync_touch on public.handover_sync;
create trigger handover_sync_touch
  before insert or update on public.handover_sync
  for each row execute function public.handover_sync_touch();

alter table public.handover_sync enable row level security;

-- The app uses the publishable (anon) key without a login, so the crew's
-- shared devices can read/write this table. Deletes are tombstones, so no
-- delete policy is granted.
drop policy if exists "handover_sync read" on public.handover_sync;
create policy "handover_sync read" on public.handover_sync
  for select to anon, authenticated using (true);

drop policy if exists "handover_sync insert" on public.handover_sync;
create policy "handover_sync insert" on public.handover_sync
  for insert to anon, authenticated with check (true);

drop policy if exists "handover_sync update" on public.handover_sync;
create policy "handover_sync update" on public.handover_sync
  for update to anon, authenticated using (true) with check (true);
