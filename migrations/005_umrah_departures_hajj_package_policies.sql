-- Enable row-level security and allow authenticated admin users to manage schedules

alter table umrah_departures enable row level security;

drop policy if exists "umrah_departures: admin can select" on umrah_departures;
drop policy if exists "umrah_departures: admin can insert" on umrah_departures;
drop policy if exists "umrah_departures: admin can update" on umrah_departures;
drop policy if exists "umrah_departures: admin can delete" on umrah_departures;

create policy "umrah_departures: public can select"
  on umrah_departures for select
  to public
  using (true);

create policy "umrah_departures: admin can insert"
  on umrah_departures for insert
  to authenticated
  with check (is_admin());

create policy "umrah_departures: admin can update"
  on umrah_departures for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "umrah_departures: admin can delete"
  on umrah_departures for delete
  to authenticated
  using (is_admin());

grant select on umrah_departures to anon;

grant select on umrah_departures to authenticated;

alter table hajj_package enable row level security;

drop policy if exists "hajj_package: admin can select" on hajj_package;
drop policy if exists "hajj_package: admin can insert" on hajj_package;
drop policy if exists "hajj_package: admin can update" on hajj_package;
drop policy if exists "hajj_package: admin can delete" on hajj_package;

create policy "hajj_package: public can select"
  on hajj_package for select
  to public
  using (true);

create policy "hajj_package: admin can insert"
  on hajj_package for insert
  to authenticated
  with check (is_admin());

create policy "hajj_package: admin can update"
  on hajj_package for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "hajj_package: admin can delete"
  on hajj_package for delete
  to authenticated
  using (is_admin());

grant select on hajj_package to anon;

grant select on hajj_package to authenticated;
