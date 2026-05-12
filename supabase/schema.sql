-- My DNA Companion Tracker
-- Supabase schema for cloud saves and push notification subscriptions

create table if not exists public.user_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_saves enable row level security;

drop policy if exists "Users can read their own save" on public.user_saves;
create policy "Users can read their own save"
on public.user_saves
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own save" on public.user_saves;
create policy "Users can insert their own save"
on public.user_saves
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own save" on public.user_saves;
create policy "Users can update their own save"
on public.user_saves
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Push subscriptions are inserted by Next.js API route using SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY in client code.
