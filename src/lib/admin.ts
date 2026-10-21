import { supabase } from '@/lib/supabase';
import type { BookingRow, BookingStatus, PaymentRow, VehicleRow, VehicleStatus, VehicleStatusLogRow } from '@/types/database';

export async function fetchAllBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

/**
 * Records a cash receipt as its own audit row, then moves the booking to 'confirmed'.
 * Never just flips a "paid" flag on the booking — payments stays the source of truth for
 * who took what, when, so part-payments/deposits and dispute resolution stay possible later.
 */
export async function confirmCashPayment(bookingId: string, amount: number, receiptNumber: string, cashierId: string, note?: string) {
  const { error: payErr } = await supabase.from('payments').insert({
    booking_id: bookingId,
    amount,
    receipt_number: receiptNumber,
    cashier_id: cashierId,
    note: note || null,
  });
  if (payErr) throw payErr;

  const { error: statusErr } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
  if (statusErr) throw statusErr;
}

export async function fetchAllPayments(): Promise<PaymentRow[]> {
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPaymentsForBooking(bookingId: string): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllVehicles(): Promise<VehicleRow[]> {
  const { data, error } = await supabase.from('vehicles').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Updates the vehicle's status and records the change in vehicle_status_log for the audit trail. */
export async function setVehicleStatus(vehicle: VehicleRow, newStatus: VehicleStatus, note: string, adminUserId: string) {
  const { error: updateErr } = await supabase.from('vehicles').update({ status: newStatus }).eq('id', vehicle.id);
  if (updateErr) throw updateErr;

  const { error: logErr } = await supabase.from('vehicle_status_log').insert({
    vehicle_id: vehicle.id,
    old_status: vehicle.status,
    new_status: newStatus,
    changed_by: adminUserId,
    note: note || null,
  });
  if (logErr) throw logErr;
}

export interface VehiclePrices {
  daily: number;
  weekly: number;
  monthly: number;
}

/** Updates a vehicle's rates — this is what the public site's booking quotes and listings actually read. */
export async function updateVehiclePrices(vehicleId: string, prices: VehiclePrices) {
  const { error } = await supabase.from('vehicles').update(prices).eq('id', vehicleId);
  if (error) throw error;
}

/** Uploads a photo to the vehicle-photos storage bucket and returns its public URL. */
export async function uploadVehiclePhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('vehicle-photos').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
  return data.publicUrl;
}

export interface NewVehicleInput {
  name: string;
  category: string;
  category_label: string;
  image: string;
  seats: number;
  bags: number;
  transmission: 'Automatic' | 'Manual';
  fuel: 'Petrol' | 'Diesel' | 'Hybrid';
  year: number;
  daily: number;
  weekly: number;
  monthly: number;
  features: string[];
  popular: boolean;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Adds a new vehicle (one row = one physical unit) to the catalogue — shows up on the
 * public site immediately. Multiple units of the same model are expected (a fleet of
 * 4 identical Vitzes, say) and the public site groups same-name rows into one card with
 * an availability count, but each unit still needs its own unique id/primary key — so
 * this auto-suffixes (vitz, vitz-2, vitz-3, …) instead of failing on the 2nd+ one.
 */
export async function createVehicle(input: NewVehicleInput) {
  const base = slugify(input.name);
  if (!base) throw new Error('That name needs at least one letter or number');

  for (let attempt = 0; attempt < 30; attempt++) {
    const id = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { error } = await supabase.from('vehicles').insert({ ...input, id });
    if (!error) return;
    if (error.code !== '23505') throw error; // not a duplicate-id conflict — a real error
  }
  throw new Error('Could not find a free id for this vehicle — try a more distinct name');
}

/**
 * Removes a vehicle entirely. If it has existing bookings (foreign key reference),
 * Postgres rejects the delete rather than orphaning booking history — callers should
 * catch that and point staff at "mark out of service" instead, which just hides it.
 */
export async function deleteVehicle(id: string) {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

/** Recent vehicle status changes — every manual admin action, with who/when/why. Omit vehicleId for the fleet-wide feed. */
export async function fetchStatusLog(vehicleId?: string, limit = 20): Promise<VehicleStatusLogRow[]> {
  let query = supabase.from('vehicle_status_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (vehicleId) query = query.eq('vehicle_id', vehicleId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
}

/**
 * On a non-2xx response, supabase-js only gives a generic "non-2xx status code"
 * error — the actual message is in the response body, reachable via error.context
 * (a Response) *if* the function actually ran. A network/CORS failure before any
 * response comes back wraps a plain Error there instead (no .json method), which
 * is usually "the function isn't deployed yet" — so that gets a pointed message.
 */
async function invokeCreateAdmin(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('create-admin', { body });
  if (error) {
    const ctx = (error as { context?: unknown }).context;
    let serverMessage: string | null = null;
    if (ctx && typeof ctx === 'object' && typeof (ctx as Response).json === 'function') {
      try {
        const parsed = await (ctx as Response).clone().json();
        if (parsed?.error) serverMessage = parsed.error;
      } catch {
        // response wasn't JSON — fall through to the generic message below
      }
    }
    throw new Error(
      serverMessage ??
        'Could not reach the create-admin function. Make sure it’s deployed in Supabase (Edge Functions) ' +
          'and that the SUPABASE_SERVICE_ROLE_KEY secret is set.'
    );
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

/** Current admin allow-list with emails — resolved server-side (the create-admin function). */
export async function listAdmins(): Promise<AdminUser[]> {
  const data = await invokeCreateAdmin({ action: 'list' });
  return Array.isArray(data?.admins) ? data.admins : [];
}

/**
 * Creates a new admin account (email + password) via the create-admin edge function,
 * which runs with the service-role key — the client can't do this directly, since
 * supabase.auth.signUp() would replace the caller's own session with the new one.
 */
export async function createAdminUser(email: string, password: string) {
  await invokeCreateAdmin({ action: 'create', email, password });
}

export function bookingsToCSV(rows: BookingRow[]): string {
  const headers = ['Reference', 'Vehicle', 'Guest name', 'Guest email', 'Guest phone', 'Pickup', 'Destination', 'Start', 'End', 'Driver', 'Total (USD)', 'Status', 'Payment deadline', 'Created'];
  const lines = rows.map((b) =>
    [b.reference, b.vehicle_id, b.guest_name ?? '', b.guest_email ?? '', b.guest_phone ?? '', b.pickup_location, b.destination ?? '', b.start_date, b.end_date, b.driver, b.total, b.status, b.payment_deadline, b.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...lines].join('\n');
}
