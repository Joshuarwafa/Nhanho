import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import VehicleCard from '@/components/VehicleCard';
import { DateField } from '@/components/BookingWidget';
import { CATEGORIES, FLEET } from '@/data/fleet';
import { useFleetAvailability } from '@/hooks/useFleetAvailability';

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
  const { availability } = useFleetAvailability(pickup, days);

  const list = useMemo(() => {
    let out = FLEET.filter((v) => (cat === 'all' || v.category === cat) && (trans === 'all' || v.transmission === trans));
    if (sort === 'low') out = [...out].sort((a, b) => a.daily - b.daily);
    if (sort === 'high') out = [...out].sort((a, b) => b.daily - a.daily);
    return out;
  }, [cat, trans, sort]);

  return (
    <div>
      {/* header */}
      <section className="relative overflow-hidden bg-navy pb-16 pt-36">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/hero-savanna.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-navy/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow="Fleet catalogue"
            title="Choose your vehicle"
            sub="Select your dates to see live availability and exact pricing for your rental period."
          />
        </div>
      </section>

      {/* filter bar */}
      <div className="sticky top-[68px] z-30 border-b border-navy/8 bg-background/90 py-4 backdrop-blur-xl dark:border-white/10">
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

      {/* categories */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <Reveal className="flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All vehicles' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                'rounded-full px-5 py-2.5 text-xs font-bold transition-all',
                cat === c.id
                  ? 'bg-navy text-white shadow-lg shadow-navy/25 dark:bg-white dark:text-navy'
                  : 'bg-navy/[0.05] text-navy hover:bg-navy/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
              )}
            >
              {c.label}
            </button>
          ))}
        </Reveal>

        {/* grid */}
        <div className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 90} className="h-full">
              <VehicleCard v={v} availability={availability[v.id] ?? 'available'} bookState={bookState} />
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
