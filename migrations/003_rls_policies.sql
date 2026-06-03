-- RLS policies for bookings, contact_inquiries, user_profiles, admin_profiles
-- Safe to re-run: drops all policies before recreating them

-- ─────────────────────────────────────────
-- Helper: is the current user an admin?
-- ─────────────────────────────────────────
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_profiles
    where user_id = auth.uid()
  );
$$;


-- ═════════════════════════════════════════
-- BOOKINGS
-- ═════════════════════════════════════════
alter table bookings enable row level security;

drop policy if exists "bookings: owner can read"      on bookings;
drop policy if exists "bookings: owner can insert"    on bookings;
drop policy if exists "bookings: admin can read all"  on bookings;
drop policy if exists "bookings: admin can update"    on bookings;
drop policy if exists "bookings: admin can delete"    on bookings;
drop policy if exists "bookings: anon can insert"     on bookings;

create policy "bookings: owner can read"
  on bookings for select
  to authenticated
  using (user_id = auth.uid());

create policy "bookings: owner can insert"
  on bookings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "bookings: admin can read all"
  on bookings for select
  to authenticated
  using (is_admin());

create policy "bookings: admin can update"
  on bookings for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "bookings: admin can delete"
  on bookings for delete
  to authenticated
  using (is_admin());

create policy "bookings: anon can insert"
  on bookings for insert
  to anon
  with check (true);


-- ═════════════════════════════════════════
-- CONTACT_INQUIRIES
-- ═════════════════════════════════════════
alter table contact_inquiries enable row level security;

drop policy if exists "contact_inquiries: anon can insert"  on contact_inquiries;
drop policy if exists "contact_inquiries: admin can read"   on contact_inquiries;
drop policy if exists "contact_inquiries: admin can update" on contact_inquiries;
drop policy if exists "contact_inquiries: admin can delete" on contact_inquiries;

create policy "contact_inquiries: anon can insert"
  on contact_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "contact_inquiries: admin can read"
  on contact_inquiries for select
  to authenticated
  using (is_admin());

create policy "contact_inquiries: admin can update"
  on contact_inquiries for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "contact_inquiries: admin can delete"
  on contact_inquiries for delete
  to authenticated
  using (is_admin());


-- ═════════════════════════════════════════
-- USER_PROFILES
-- ═════════════════════════════════════════
alter table user_profiles enable row level security;

drop policy if exists "user_profiles: owner can read"      on user_profiles;
drop policy if exists "user_profiles: owner can insert"    on user_profiles;
drop policy if exists "user_profiles: owner can update"    on user_profiles;
drop policy if exists "user_profiles: admin can read all"  on user_profiles;

create policy "user_profiles: owner can read"
  on user_profiles for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_profiles: owner can insert"
  on user_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_profiles: owner can update"
  on user_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_profiles: admin can read all"
  on user_profiles for select
  to authenticated
  using (is_admin());


-- ═════════════════════════════════════════
-- ADMIN_PROFILES
-- ═════════════════════════════════════════
alter table admin_profiles enable row level security;

drop policy if exists "admin_profiles: admin can read own" on admin_profiles;

create policy "admin_profiles: admin can read own"
  on admin_profiles for select
  to authenticated
  using (user_id = auth.uid());
