-- Add departure_city field to all departure tables

alter table umrah_departures add column if not exists departure_city text default 'Kano (KAN)';
alter table travel_departures add column if not exists departure_city text default 'Lagos (LOS)';
alter table business_departures add column if not exists departure_city text default 'Lagos (LOS)';
