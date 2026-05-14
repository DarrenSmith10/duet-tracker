-- Scheduled background push notifications
-- Run this in Supabase SQL Editor.

create table if not exists public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  notification_key text,
  type text not null,
  title text not null,
  body text not null,
  url text not null default '/',
  notify_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scheduled_notifications_due_idx
on public.scheduled_notifications (notify_at)
where sent_at is null;

create unique index if not exists scheduled_notifications_unique_key_idx
on public.scheduled_notifications (user_id, notification_key)
where notification_key is not null;

alter table public.scheduled_notifications enable row level security;

drop policy if exists "Users can read their own scheduled notifications" on public.scheduled_notifications;
create policy "Users can read their own scheduled notifications"
on public.scheduled_notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own scheduled notifications" on public.scheduled_notifications;
create policy "Users can insert their own scheduled notifications"
on public.scheduled_notifications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own scheduled notifications" on public.scheduled_notifications;
create policy "Users can update their own scheduled notifications"
on public.scheduled_notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own scheduled notifications" on public.scheduled_notifications;
create policy "Users can delete their own scheduled notifications"
on public.scheduled_notifications
for delete
to authenticated
using (auth.uid() = user_id);
