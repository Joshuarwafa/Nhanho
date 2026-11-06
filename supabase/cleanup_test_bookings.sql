-- ============================================================================
-- One-time cleanup: removes the test bookings created while building and
-- testing the booking flow (every current row is 'expired' or 'cancelled' —
-- none ever had a real payment taken). Deleting them unblocks removing the
-- vehicles they reference from the Fleet admin page.
--
-- This is NOT a schema migration — it's a one-off data cleanup for this
-- project only. Run it once in the Supabase SQL Editor; re-running it later
-- is harmless (it only ever touches expired/cancelled rows, so it won't
-- touch any real confirmed/completed booking you take afterwards).
-- ============================================================================

-- payments has its own foreign key to bookings. None are expected here (a
-- payment is only ever recorded once a booking is 'confirmed'), but this
-- clears them first just in case so the booking delete below can't be blocked.
delete from public.payments
where booking_id in (
  select id from public.bookings where status in ('expired', 'cancelled')
);

delete from public.bookings
where status in ('expired', 'cancelled');
