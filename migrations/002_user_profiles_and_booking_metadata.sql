-- Add user profiles and enriched booking metadata for admin reporting

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bookings
  add column service_type text not null default 'unknown',
  add column package_label text,
  add column contact_name text not null default '',
  add column contact_phone text not null default '',
  add column amount numeric(12,2) not null default 0;
