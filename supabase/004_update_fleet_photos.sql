-- ============================================================================
-- Update the fleet catalogue with real photos and correct model names.
-- Run this after 003_cash_payments.sql.
--
-- Note on identity: internal `id`s (e.g. 'eclass', 'range') are kept unchanged
-- even where the model name changes — ids aren't customer-facing and keeping
-- them stable avoids breaking any bookings/status-log rows that already
-- reference them.
-- ============================================================================

update public.vehicles set image = '/images/toyota-vitz.jpg' where id = 'vitz';
update public.vehicles set image = '/images/honda-fit.jpg' where id = 'fit';
update public.vehicles set image = '/images/toyota-spade.jpg' where id = 'spade';
update public.vehicles set image = '/images/nissan-xtrail.jpg' where id = 'xtrail';
update public.vehicles set image = '/images/toyota-fortuner.jpg' where id = 'fortuner';

-- Real photo turned out to be an S-Class, not an E-Class.
update public.vehicles set
  name = 'Mercedes-Benz S-Class',
  image = '/images/mercedes-s-class.jpg'
where id = 'eclass';

-- Real photo turned out to be a Range Rover, not the Sport trim.
update public.vehicles set
  name = 'Range Rover',
  image = '/images/range-rover.jpg'
where id = 'range';

-- Photo is a Toyota Quantum/HiAce-style minibus, not a Nissan NV350.
update public.vehicles set
  name = 'Toyota Quantum',
  image = '/images/toyota-quantum.jpg'
where id = 'nv350';

-- No current photo for these — retire them from the fleet. Not a hard delete:
-- real bookings reference these ids (foreign key), so instead they're marked
-- out_of_service, which the site now treats as fully hidden from public
-- listings (not just "unavailable") — same visible outcome, no orphaned data.
update public.vehicles set status = 'out_of_service' where id in ('axio', 'noah');
