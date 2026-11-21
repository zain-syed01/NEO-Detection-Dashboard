-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run. Fixes "permission denied for table watchlist" by granting
-- access to the authenticated role, then locking rows down with RLS.

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  neo_id text not null,
  neo_name text not null,
  nasa_jpl_url text,
  is_potentially_hazardous boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, neo_id)
);

create index if not exists watchlist_user_id_idx on public.watchlist (user_id);

-- Required: without these grants, logged-in users get "permission denied for table".
grant usage on schema public to anon, authenticated;
grant select, insert, delete on table public.watchlist to authenticated;

alter table public.watchlist enable row level security;

drop policy if exists "Users can read own watchlist" on public.watchlist;
create policy "Users can read own watchlist"
  on public.watchlist
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own watchlist" on public.watchlist;
create policy "Users can insert own watchlist"
  on public.watchlist
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own watchlist" on public.watchlist;
create policy "Users can delete own watchlist"
  on public.watchlist
  for delete
  to authenticated
  using (auth.uid() = user_id);
