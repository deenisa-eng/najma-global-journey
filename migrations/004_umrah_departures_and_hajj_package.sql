-- Create tables for admin-managed Umrah departures and Hajj package data

create table if not exists umrah_departures (
  id text primary key,
  label text not null,
  depart date not null,
  ret date not null,
  seatsLeft int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hajj_package (
  id text primary key,
  title text not null,
  departDate date not null,
  returnDate date not null,
  departRoute text not null,
  returnRoute text not null,
  price numeric(12,2) not null default 0,
  seatsLeft int not null default 0,
  inclusions text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
