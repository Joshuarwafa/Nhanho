import type { Vehicle } from '@/data/fleet';

export interface VehicleGroup {
  /** The group's representative unit — image/specs/price are the same across units of one model. */
  vehicle: Vehicle;
  /** Every physical unit of this model currently in the fleet (1 row per real car). */
  units: Vehicle[];
}

/**
 * Groups fleet rows by model name. A fleet of 4 identical Toyota Vitzes is 4 rows in
 * the database (each with its own plate/status), but customers book "a Vitz," not
 * "unit #3" — so the public site shows one card per model with an availability count,
 * and only the booking flow resolves that down to one specific unit.
 */
export function groupByModel(vehicles: Vehicle[]): VehicleGroup[] {
  const map = new Map<string, Vehicle[]>();
  for (const v of vehicles) {
    const list = map.get(v.name);
    if (list) list.push(v);
    else map.set(v.name, [v]);
  }
  return Array.from(map.values()).map((units) => ({ vehicle: units[0], units }));
}
