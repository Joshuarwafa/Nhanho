-- ============================================================================
-- Hard guarantee against double-booking: an exclusion constraint at the
-- database level. Even if two customers submit the same vehicle/dates at the
-- exact same instant, Postgres itself rejects the second insert — this is
-- not just a check the app does before submitting, it's enforced no matter
-- what path writes to the table.
-- Run this in the SQL Editor after schema.sql.
-- ============================================================================

create extension if not exists btree_gist;

alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
  where (status in ('confirmed', 'active'));
