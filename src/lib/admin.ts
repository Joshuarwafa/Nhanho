import { supabase } from '@/lib/supabase';
import type { BookingRow, BookingStatus, VehicleRow, VehicleStatus, VehicleStatusLogRow } from '@/types/database';

export async function fetchAllBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
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

/** Recent vehicle status changes — every manual admin action, with who/when/why. Omit vehicleId for the fleet-wide feed. */
export async function fetchStatusLog(vehicleId?: string, limit = 20): Promise<VehicleStatusLogRow[]> {
  let query = supabase.from('vehicle_status_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (vehicleId) query = query.eq('vehicle_id', vehicleId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function bookingsToCSV(rows: BookingRow[]): string {
  const headers = ['Reference', 'Vehicle', 'Guest name', 'Guest email', 'Guest phone', 'Pickup', 'Destination', 'Start', 'End', 'Driver', 'Total (USD)', 'Status', 'Created'];
  const lines = rows.map((b) =>
    [b.reference, b.vehicle_id, b.guest_name ?? '', b.guest_email ?? '', b.guest_phone ?? '', b.pickup_location, b.destination ?? '', b.start_date, b.end_date, b.driver, b.total, b.status, b.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...lines].join('\n');
}
