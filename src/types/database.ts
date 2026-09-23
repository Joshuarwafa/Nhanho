/**
 * Hand-written to match supabase/schema.sql. Regenerate with the Supabase CLI later if the schema drifts.
 *
 * IMPORTANT: keep every row/table shape below as a `type` object literal, not an `interface`.
 * @supabase/supabase-js's generic inference for `createClient<Database>()` silently resolves to
 * `never` for every query result if any of these are declared with `interface` instead of `type`.
 */

export type VehicleStatus = 'available' | 'rented' | 'reserved' | 'maintenance' | 'out_of_service';
export type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';
export type DriverOption = 'self' | 'chauffeur';

export type VehicleRow = {
  id: string;
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
  status: VehicleStatus;
  created_at: string;
};

/** What anon/public queries can see — never selects the internal `plate` column. */
export type PublicVehicleRow = VehicleRow;

export type BookingRow = {
  id: string;
  reference: string;
  vehicle_id: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  pickup_location: string;
  destination: string | null;
  start_date: string;
  end_date: string;
  driver: DriverOption;
  extras: string[];
  total: number;
  status: BookingStatus;
  created_at: string;
};

export type CustomerRow = {
  id: string;
  name: string | null;
  phone: string | null;
  loyalty_points: number;
  created_at: string;
};

export type VehicleStatusLogRow = {
  id: string;
  vehicle_id: string;
  old_status: VehicleStatus | null;
  new_status: VehicleStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type AdminRow = {
  user_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: VehicleRow;
        Insert: Partial<VehicleRow> & Pick<VehicleRow, 'id' | 'name' | 'category' | 'category_label' | 'image' | 'seats' | 'bags' | 'transmission' | 'fuel' | 'year' | 'daily' | 'weekly' | 'monthly'>;
        Update: Partial<VehicleRow>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Partial<BookingRow> & Pick<BookingRow, 'reference' | 'vehicle_id' | 'pickup_location' | 'start_date' | 'end_date' | 'total'>;
        Update: Partial<BookingRow>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: Partial<CustomerRow> & Pick<CustomerRow, 'id'>;
        Update: Partial<CustomerRow>;
        Relationships: [];
      };
      vehicle_status_log: {
        Row: VehicleStatusLogRow;
        Insert: Partial<VehicleStatusLogRow> & Pick<VehicleStatusLogRow, 'vehicle_id' | 'new_status'>;
        Update: Partial<VehicleStatusLogRow>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: Partial<AdminRow> & Pick<AdminRow, 'user_id'>;
        Update: Partial<AdminRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
