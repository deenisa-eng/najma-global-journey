-- Initial database schema for Najma Global backend

-- Store admin profiles linked to Supabase auth users
create table if not exists admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Travel packages used for bookings and site content
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text,
  price numeric(12,2) not null default 0,
  duration_days int,
  availability jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bookings created by users for trips and services
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  package_id uuid references packages(id) on delete set null,
  travel_date date,
  travelers_count int not null default 1,
  status text not null default 'pending',
  contact_email text not null,
  notes text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contact inquiries submitted through the site
create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  source text,
  is_read boolean not null default false,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
