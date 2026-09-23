import { supabase } from '@/lib/supabase';
import type { BookingStatus, DriverOption, VehicleStatus } from '@/types/database';

/** 'unavailable' = pulled from service by an admin; 'booked' = a real customer reservation covers these dates. */
export type Availability = 'available' | 'booked' | 'unavailable';

const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'active'];
const UNAVAILABLE_VEHICLE_STATUSES: VehicleStatus[] = ['maintenance', 'out_of_service', 'rented'];

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Real-time availability for every vehicle over a date range: a vehicle is
 * unavailable if it's manually flagged (maintenance/out of service) or has a
 * confirmed/active booking that overlaps the requested dates.
 */
export async function fetchFleetAvailability(pickup: Date, days: number): Promise<Record<string, Availability>> {
  const start = toISODate(pickup);
  const end = toISODate(new Date(pickup.getTime() + Math.max(1, days) * 86400000));

  const [{ data: vehicles, error: vErr }, { data: bookings, error: bErr }] = await Promise.all([
    supabase.from('vehicles').select('id, status'),
    supabase
      .from('bookings')
      .select('vehicle_id')
      .in('status', ACTIVE_STATUSES)
      .lte('start_date', end)
      .gte('end_date', start),
  ]);

  if (vErr) throw vErr;
  if (bErr) throw bErr;

  const map: Record<string, Availability> = {};
  for (const v of vehicles ?? []) {
    map[v.id] = UNAVAILABLE_VEHICLE_STATUSES.includes(v.status) ? 'unavailable' : 'available';
  }
  for (const b of bookings ?? []) {
    if (map[b.vehicle_id] !== 'unavailable') map[b.vehicle_id] = 'booked';
  }
  return map;
}

/** Every upcoming confirmed/active date range for one vehicle — powers the availability calendar. */
export async function fetchVehicleBookedRanges(vehicleId: string): Promise<{ start: Date; end: Date }[]> {
  const today = toISODate(new Date());
  const { data, error } = await supabase
    .from('bookings')
    .select('start_date, end_date')
    .eq('vehicle_id', vehicleId)
    .in('status', ACTIVE_STATUSES)
    .gte('end_date', today);

  if (error) throw error;
  return (data ?? []).map((r) => ({ start: new Date(r.start_date), end: new Date(r.end_date) }));
}

export interface CreateBookingInput {
  reference: string;
  vehicleId: string;
  pickupLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  driver: DriverOption;
  extras: string[];
  total: number;
  customerId?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export class BookingConflictError extends Error {
  constructor() {
    super('This vehicle was just booked for these dates by someone else. Pick different dates or another vehicle.');
    this.name = 'BookingConflictError';
  }
}

/** Writes the booking to the database. Postgres itself rejects overlapping dates for the same vehicle (see 002_prevent_double_booking.sql), surfaced here as BookingConflictError. */
export async function createBooking(input: CreateBookingInput) {
  const { error } = await supabase.from('bookings').insert({
    reference: input.reference,
    vehicle_id: input.vehicleId,
    customer_id: input.customerId ?? null,
    guest_name: input.guestName,
    guest_email: input.guestEmail,
    guest_phone: input.guestPhone,
    pickup_location: input.pickupLocation,
    destination: input.destination || null,
    start_date: toISODate(input.startDate),
    end_date: toISODate(input.endDate),
    driver: input.driver,
    extras: input.extras,
    total: input.total,
    status: 'confirmed',
  });

  if (error) {
    // Postgres exclusion-constraint violation — the race we guard against at the DB level.
    if (error.code === '23P01') throw new BookingConflictError();
    throw error;
  }
}
