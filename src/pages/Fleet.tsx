import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import CollectionHeader from '@/components/CollectionHeader';
import VehicleCard from '@/components/VehicleCard';
import { DateField } from '@/components/BookingWidget';
import { CATEGORIES } from '@/data/fleet';
import { useFleet } from '@/hooks/useFleet';
import { useFleetAvailability } from '@/hooks/useFleetAvailability';
import { groupByModel } from '@/lib/fleetGroups';

type Sort = 'featured' | 'low' | 'high';

export default function Fleet() {
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('cat') ?? 'all');
  const [trans, setTrans] = useState<'all' | 'Automatic' | 'Manual'>('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [pickup, setPickup] = useState<Date | undefined>(addDays(new Date(), 2));
  const [dropoff, setDropoff] = useState<Date | undefined>(addDays(new Date(), 5));

  const days = pickup && dropoff ? Math.max(1, differenceInCalendarDays(dropoff, pickup)) : 0;
  const bookState = { pickup: pickup?.toISOString(), dropoff: dropoff?.toISOString() };
  const { availability, availableFrom } = useFleetAvailability(pickup, days);
  const { fleet } = useFleet();

  // One card per model (a fleet of 4 identical Vitzes is 4 rows, not 4 cards) — each
  // group carries every unit's availability so the card can show "x of y available"
  // and hand the booking flow a specific free unit without the customer ever seeing ids.
  const list = useMemo(() => {
    const filtered = fleet.filter((v) => (cat === 'all' || v.category === cat) && (trans === 'all' || v.transmission === trans));
    let groups = groupByModel(filtered).map((g) => {
      const availableUnits = g.units.filter((u) => (availability[u.id] ?? 'available') === 'available');
      const earliestFrom = g.units.reduce<Date | undefined>((min, u) => {
        const d = availableFrom[u.id];
        if (!d) return min;
        return !min || d < min ? d : min;
      }, undefined);
      return {
        ...g,
        unitsAvailable: availableUnits.length,
        bookVehicleId: (availableUnits[0] ?? g.units[0]).id,
        earliestFrom,
      };
    });
    if (sort === 'low') groups = [...groups].sort((a, b) => a.vehicle.daily - b.vehicle.daily);
    if (sort === 'high') groups = [...groups].sort((a, b) => b.vehicle.daily - a.vehicle.daily);
    // Models with a free unit first regardless of sort — a fully-booked model buried
    // below the fold is more useful than one sitting at the top of the results.
    return [...groups].sort((a, b) => {
      const aFree = a.unitsAvailable > 0;
      const bFree = b.unitsAvailable > 0;
      return aFree === bFree ? 0 : aFree ? -1 : 1;
    });
  }, [fleet, cat, trans, sort, availability, availableFrom]);

  return (
    <div>
      <CollectionHeader
        eyebrow="The collection"
        titleLines={['A vehicle for', 'every chapter.']}
        description="Every vehicle is meticulously inspected, immaculately presented and supported around the clock."
        photo="/images/fortuner-safari.jpg"
      />

      {/* count + category filter — its own clean row, not fighting the photo above it */}
      <div className="border-b border-navy/8 bg-background py-6 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <p className="flex items-baseline gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="font-display text-base text-brand-orange">{fleet.length}</span> vehicles ready to move
          </p>
          <div className="flex flex-wrap gap-1">
            {[{ id: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  'rounded-full px-5 py-2 text-xs font-bold transition-all',
                  cat === c.id
                    ? 'bg-navy text-white shadow-lg shadow-navy/25 dark:bg-white dark:text-navy'
                    : 'text-navy/60 hover:text-navy dark:text-white/60 dark:hover:text-white'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* filter bar */}
      <div className="sticky top-16 z-30 border-b border-navy/8 bg-background/90 py-4 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <div className="w-full sm:w-52">
            <DateField label="Pickup" date={pickup} onSelect={setPickup} />
          </div>
          <div className="w-full sm:w-52">
            <DateField label="Return" date={dropoff} onSelect={setDropoff} min={pickup} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <select
              value={trans}
              onChange={(e) => setTrans(e.target.value as typeof trans)}
              className="cursor-pointer rounded-full bg-navy/[0.05] px-4 py-2.5 text-xs font-semibold text-navy outline-none dark:bg-white/10 dark:text-white [&>option]:text-navy"
            >
              <option value="all">All transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="cursor-pointer rounded-full bg-navy/[0.05] px-4 py-2.5 text-xs font-semibold text-navy outline-none dark:bg-white/10 dark:text-white [&>option]:text-navy"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          {days > 0 && (
            <span className="ml-auto rounded-full bg-brand-green/10 px-4 py-2 text-xs font-bold text-brand-green-dark dark:text-brand-green">
              {days}-day rental · tiered rates applied
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* grid */}
        <div className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g, i) => (
            <Reveal key={g.vehicle.id} delay={(i % 3) * 90} className="h-full">
              <VehicleCard
                v={g.vehicle}
                index={i}
                bookVehicleId={g.bookVehicleId}
                unitsAvailable={g.unitsAvailable}
                unitsTotal={g.units.length}
                availableFrom={g.earliestFrom}
                bookState={bookState}
              />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">No vehicles match these filters.</p>
        )}

        {/* fleet strategy note */}
        <Reveal className="mb-20 rounded-3xl bg-brand-mist p-8 text-center dark:bg-white/5">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-navy dark:text-white">Can’t find what you need?</span> Our fleet
            extends beyond the public catalogue — availability is managed live through our booking system.
            Contact us for long-term, corporate and special-vehicle requests.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
