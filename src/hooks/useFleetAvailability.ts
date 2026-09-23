import { useEffect, useState } from 'react';
import { fetchFleetAvailability, type Availability } from '@/lib/bookings';

/** Live availability for every vehicle over [pickup, pickup + days), refetched whenever the range changes. */
export function useFleetAvailability(pickup: Date | undefined, days: number) {
  const [map, setMap] = useState<Record<string, Availability>>({});
  const [loading, setLoading] = useState(() => Boolean(pickup) && days > 0);

  useEffect(() => {
    if (!pickup || days <= 0) return;
    let cancelled = false;
    setLoading(true);
    fetchFleetAvailability(pickup, days)
      .then((m) => {
        if (!cancelled) setMap(m);
      })
      .catch((err) => {
        console.error('Failed to load fleet availability', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pickup, days]);

  return { availability: map, loading };
}
