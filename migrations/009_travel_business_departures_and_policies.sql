-- Create tables for admin-managed Travel and Business departures and policies

create table if not exists travel_departures (
  id text primary key,
  label text not null,
  depart date not null,
  ret date not null,
  seatsLeft int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_departures (
  id text primary key,
  label text not null,
  depart date not null,
  ret date not null,
  seatsLeft int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable row-level security and policies for travel_departures

alter table travel_departures enable row level security;

drop policy if exists "travel_departures: public can select" on travel_departures;
drop policy if exists "travel_departures: admin can insert" on travel_departures;
drop policy if exists "travel_departures: admin can update" on travel_departures;
drop policy if exists "travel_departures: admin can delete" on travel_departures;

create policy "travel_departures: public can select"
  on travel_departures for select
  to public
  using (true);

create policy "travel_departures: admin can insert"
  on travel_departures for insert
  to authenticated
  with check (is_admin());

create policy "travel_departures: admin can update"
  on travel_departures for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "travel_departures: admin can delete"
  on travel_departures for delete
  to authenticated
  using (is_admin());

grant select on travel_departures to anon;
grant select on travel_departures to authenticated;

-- Enable row-level security and policies for business_departures

alter table business_departures enable row level security;

drop policy if exists "business_departures: public can select" on business_departures;
drop policy if exists "business_departures: admin can insert" on business_departures;
drop policy if exists "business_departures: admin can update" on business_departures;
drop policy if exists "business_departures: admin can delete" on business_departures;

create policy "business_departures: public can select"
  on business_departures for select
  to public
  using (true);

create policy "business_departures: admin can insert"
  on business_departures for insert
  to authenticated
  with check (is_admin());

create policy "business_departures: admin can update"
  on business_departures for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "business_departures: admin can delete"
  on business_departures for delete
  to authenticated
  using (is_admin());

grant select on business_departures to anon;
grant select on business_departures to authenticated;
