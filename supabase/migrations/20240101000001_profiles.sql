-- profiles table: one row per auth.users entry.
-- role is nullable and only set after the user picks one from the role-selection screen.
-- Approval status lives in the per-role application tables, not here.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  phone       text,
  city        text,
  role        text,               -- nullable; set when user picks a role (band, venue, etc.)
  created_at  timestamptz not null default now()
);

-- Index for quick role lookups (admin dashboards)
create index if not exists profiles_role_idx on public.profiles (role);

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read only their own row
create policy "profiles: own select"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own row (OTP signup creates it client-side)
create policy "profiles: own insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own row
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Service-role (admin) bypass: Supabase's service_role key already bypasses RLS,
-- so no explicit admin policy is needed here.
