-- ============================================================================
-- Cash-payment workflow: booking lifecycle, a separate payments audit table,
-- and automatic expiry of unpaid holds.
-- Run this in the SQL Editor after schema.sql and 002_prevent_double_booking.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. New booking status lifecycle:
--    pending_payment -> confirmed -> completed
--                    -> expired   (auto, unpaid past deadline)
--                    -> cancelled (by customer or staff)
-- ---------------------------------------------------------------------------
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending_payment', 'confirmed', 'expired', 'cancelled', 'completed'));

alter table public.bookings alter column status set default 'pending_payment';

-- Every booking gets a payment deadline at creation (the app sets this
-- explicitly; the default here only covers rows that don't pass one).
alter table public.bookings add column if not exists payment_deadline timestamptz
  not null default (now() + interval '48 hours');

-- ---------------------------------------------------------------------------
-- 2. Double-booking prevention now also holds the slot while payment is
--    pending — otherwise a second customer could book the same vehicle/dates
--    while the first one is walking to the cash office.
-- ---------------------------------------------------------------------------
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
  where (status in ('pending_payment', 'confirmed'));

-- ---------------------------------------------------------------------------
-- 3. payments — one row per cash receipt. Never overwrite a booking's paid
--    status directly; this table is the audit trail of who took what, when.
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id),
  amount          numeric not null,
  receipt_number  text not null,
  cashier_id      uuid references auth.users(id),
  note            text,
  created_at      timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "payments_admin_only" on public.payments;
create policy "payments_admin_only" on public.payments for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- 4. Auto-expiry — every 15 minutes, release any booking still unpaid past
--    its deadline so the slot becomes bookable again. Requires the pg_cron
--    extension; if this errors with "extension not available", enable it
--    first via Dashboard -> Database -> Extensions -> search "pg_cron".
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'expire-unpaid-bookings';

select cron.schedule(
  'expire-unpaid-bookings',
  '*/15 * * * *',
  $$
    update public.bookings
    set status = 'expired'
    where status = 'pending_payment'
      and payment_deadline < now();
  $$
);
