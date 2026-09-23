-- ============================================================================
-- Nhanho Mobility — core schema (Phase 1: real fleet + booking tracking)
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id            text primary key,
  name          text not null,
  category      text not null,
  category_label text not null,
  image         text not null,
  seats         int not null,
  bags          int not null,
  transmission  text not null check (transmission in ('Automatic','Manual')),
  fuel          text not null check (fuel in ('Petrol','Diesel','Hybrid')),
  year          int not null,
  daily         numeric not null,
  weekly        numeric not null,
  monthly       numeric not null,
  features      text[] not null default '{}',
  popular       boolean not null default false,
  plate         text,                              -- internal only, never exposed to anon
  status        text not null default 'available'
                check (status in ('available','rented','reserved','maintenance','out_of_service')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customers — one row per registered account, keyed to Supabase Auth
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text,
  phone          text,
  loyalty_points int not null default 0,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bookings — guest checkout is allowed, so customer_id may be null
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  vehicle_id      text not null references public.vehicles(id),
  customer_id     uuid references public.customers(id),
  guest_name      text,
  guest_email     text,
  guest_phone     text,
  pickup_location text not null,
  destination     text,
  start_date      date not null,
  end_date        date not null,
  driver          text not null default 'self' check (driver in ('self','chauffeur')),
  extras          text[] not null default '{}',
  total           numeric not null,
  status          text not null default 'confirmed'
                  check (status in ('confirmed','active','completed','cancelled')),
  created_at      timestamptz not null default now(),
  constraint bookings_dates_valid check (end_date >= start_date)
);

create index if not exists bookings_vehicle_dates_idx
  on public.bookings (vehicle_id, start_date, end_date)
  where status in ('confirmed','active');

-- ---------------------------------------------------------------------------
-- vehicle_status_log — audit trail for every status change
-- ---------------------------------------------------------------------------
create table if not exists public.vehicle_status_log (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  text not null references public.vehicles(id),
  old_status  text,
  new_status  text not null,
  changed_by  uuid references auth.users(id),
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admins — allow-list of staff user ids (populated after you sign up once)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.vehicles           enable row level security;
alter table public.customers          enable row level security;
alter table public.bookings           enable row level security;
alter table public.vehicle_status_log enable row level security;
alter table public.admins             enable row level security;

-- vehicles: everyone can read (site needs this to show the fleet); only admins write.
drop policy if exists "vehicles_select_all" on public.vehicles;
create policy "vehicles_select_all" on public.vehicles for select using (true);

drop policy if exists "vehicles_write_admin" on public.vehicles;
create policy "vehicles_write_admin" on public.vehicles for all
  using (is_admin()) with check (is_admin());

-- bookings: anyone can create a booking (guest checkout); customers see their own;
-- admins see and manage everything.
drop policy if exists "bookings_insert_anyone" on public.bookings;
create policy "bookings_insert_anyone" on public.bookings for insert with check (true);

drop policy if exists "bookings_select_own_or_admin" on public.bookings;
create policy "bookings_select_own_or_admin" on public.bookings for select
  using (is_admin() or customer_id = auth.uid());

drop policy if exists "bookings_update_admin" on public.bookings;
create policy "bookings_update_admin" on public.bookings for update
  using (is_admin()) with check (is_admin());

-- customers: a user manages their own row; admins see all.
drop policy if exists "customers_select_own_or_admin" on public.customers;
create policy "customers_select_own_or_admin" on public.customers for select
  using (is_admin() or id = auth.uid());

drop policy if exists "customers_upsert_own" on public.customers;
create policy "customers_upsert_own" on public.customers for insert with check (id = auth.uid());

drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own" on public.customers for update
  using (id = auth.uid()) with check (id = auth.uid());

-- vehicle_status_log: admin only.
drop policy if exists "status_log_admin_only" on public.vehicle_status_log;
create policy "status_log_admin_only" on public.vehicle_status_log for all
  using (is_admin()) with check (is_admin());

-- admins allow-list: admins can read it (so the admin UI can list staff); no public access.
drop policy if exists "admins_select_admin_only" on public.admins;
create policy "admins_select_admin_only" on public.admins for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Seed data — today's fleet, migrated from src/data/fleet.ts
-- ---------------------------------------------------------------------------
insert into public.vehicles (id, name, category, category_label, image, seats, bags, transmission, fuel, year, daily, weekly, monthly, features, popular)
values
  ('vitz',     'Toyota Vitz',          'economy',   'Economy',   '/images/car-economy.jpg',   5, 2, 'Automatic', 'Petrol', 2022, 40,  35,  28,  array['Bluetooth audio','USB charging','Air conditioning','Excellent fuel economy'], false),
  ('fit',      'Honda Fit',            'economy',   'Economy',   '/images/car-economy.jpg',   5, 3, 'Automatic', 'Hybrid', 2023, 38,  33,  26,  array['Hybrid efficiency','Magic seats','Reverse camera','Air conditioning'], false),
  ('spade',    'Toyota Spade',         'economy',   'Economy',   '/images/car-sedan.jpg',     5, 3, 'Automatic', 'Petrol', 2023, 40,  35,  28,  array['Sliding doors','Spacious cabin','Easy city parking','Air conditioning'], true),
  ('axio',     'Toyota Axio',          'sedan',     'Sedan',     '/images/car-sedan.jpg',     5, 3, 'Automatic', 'Petrol', 2022, 50,  44,  35,  array['Smooth CVT','Bluetooth audio','Spacious boot','Air conditioning'], false),
  ('xtrail',   'Nissan X-Trail',       'suv',       'SUV',       '/images/car-suv.jpg',       5, 4, 'Automatic', 'Petrol', 2023, 60,  53,  42,  array['AWD capability','Apple CarPlay','Roof rails','Air conditioning'], true),
  ('fortuner', 'Toyota Fortuner',      'suv',       'SUV',       '/images/car-suv.jpg',       7, 4, 'Automatic', 'Diesel', 2023, 95,  84,  68,  array['7 seats','4x4 low range','Tow bar','Hill assist','Air conditioning'], true),
  ('eclass',   'Mercedes-Benz E-Class','executive', 'Executive', '/images/car-executive.jpg', 5, 3, 'Automatic', 'Petrol', 2023, 150, 132, 108, array['Leather interior','Ambient lighting','Chauffeur available','Climate control'], true),
  ('range',    'Range Rover Sport',    'luxury',    'Luxury',    '/images/car-luxury.jpg',    5, 4, 'Automatic', 'Diesel', 2024, 250, 220, 180, array['Premium leather','Panoramic roof','Meridian sound','Chauffeur available'], false),
  ('noah',     'Toyota Noah',          'family',    'Family',    '/images/car-family.jpg',    7, 5, 'Automatic', 'Petrol', 2022, 85,  75,  60,  array['Sliding doors','Rear climate','Child-seat friendly','Air conditioning'], false),
  ('nv350',    'Nissan NV350',         'minibus',   'Minibus',   '/images/car-minibus.jpg',  14, 10, 'Manual',    'Diesel', 2023, 100, 88,  70,  array['14 seats','High roof','PA system option','Driver available'], true)
on conflict (id) do nothing;
