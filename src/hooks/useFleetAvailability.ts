import { useEffect, useState } from 'react';
import { fetchFleetAvailability, type Availability } from '@/lib/bookings';

/** Live availability for every vehicle over [pickup, pickup + days), refetched whenever the range changes. */
export function useFleetAvailability(pickup: Date | undefined, days: number) {
  const [map, setMap] = useState<Record<string, Availability>>({});
  const [availableFrom, setAvailableFrom] = useState<Record<string, Date>>({});
  const [loading, setLoading] = useState(() => Boolean(pickup) && days > 0);

  useEffect(() => {
    if (!pickup || days <= 0) return;
    let cancelled = false;
    setLoading(true);
    fetchFleetAvailability(pickup, days)
      .then(({ availability, availableFrom }) => {
        if (!cancelled) {
          setMap(availability);
          setAvailableFrom(availableFrom);
        }
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

  return { availability: map, availableFrom, loading };
}
