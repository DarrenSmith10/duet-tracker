-- Realtime sync table for My DNA Companion Tracker

create table if not exists public.realtime_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  save_key text not null,
  save_data jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, save_key)
);

alter table public.realtime_saves enable row level security;

drop policy if exists "Users can read their own realtime saves" on public.realtime_saves;
create policy "Users can read their own realtime saves"
on public.realtime_saves
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own realtime saves" on public.realtime_saves;
create policy "Users can insert their own realtime saves"
on public.realtime_saves
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own realtime saves" on public.realtime_saves;
create policy "Users can update their own realtime saves"
on public.realtime_saves
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.realtime_saves;
