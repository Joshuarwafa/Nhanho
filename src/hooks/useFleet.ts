import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FLEET, type Vehicle } from '@/data/fleet';
import type { VehicleRow } from '@/types/database';

function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label,
    image: row.image,
    seats: row.seats,
    bags: row.bags,
    transmission: row.transmission,
    fuel: row.fuel,
    year: row.year,
    daily: Number(row.daily),
    weekly: Number(row.weekly),
    monthly: Number(row.monthly),
    features: row.features,
    popular: row.popular,
  };
}

/**
 * Live fleet data from the database — this is what makes admin price edits actually
 * show up on the site. Renders instantly with the bundled FLEET data (no loading flash),
 * then swaps in the live rows once fetched. Falls back to the bundled data if the fetch
 * fails, so a Supabase hiccup never blanks the fleet catalogue.
 *
 * Vehicles marked 'out_of_service' are excluded entirely — that status means "retired
 * from the fleet" (e.g. no real photo, discontinued), distinct from 'maintenance' or
 * 'rented', which still show up (just flagged unavailable) since they're still real
 * fleet vehicles a customer might book for other dates.
 */
export function useFleet() {
  const [fleet, setFleet] = useState<Vehicle[]>(FLEET);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('vehicles')
      .select('*')
      .neq('status', 'out_of_service')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data && data.length > 0) {
          setFleet(data.map(rowToVehicle));
        } else if (error) {
          console.error('Failed to load live fleet data, showing bundled defaults', error);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { fleet, loading };
}
