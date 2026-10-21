import { Link } from 'react-router';
import { format } from 'date-fns';
import { ArrowRight, Briefcase, Cog, Fuel, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSD, type Vehicle } from '@/data/fleet';

interface Props {
  v: Vehicle;
  index: number;
  availability?: 'available' | 'booked' | 'unavailable';
  availableFrom?: Date;
  bookState?: Record<string, unknown>;
}

const AVAIL_DOT = {
  available: 'bg-brand-green',
  booked: 'bg-red-500',
  unavailable: 'bg-navy/40 dark:bg-white/40',
} as const;

const AVAIL_LABEL = {
  available: 'Available',
  booked: 'Booked',
  unavailable: 'Unavailable',
} as const;

// A short marketing line per card — popular vehicles say so, everything else
// gets a category-flavoured tag instead of repeating the category label twice.
const CATEGORY_TAG: Record<string, string> = {
  economy: 'Smart city travel',
  suv: 'Built for any road',
  executive: 'Executive class',
  luxury: 'VIP treatment',
  minibus: 'Group transport',
};

export default function VehicleCard({ v, index, availability, availableFrom, bookState }: Props) {
  const booked = availability === 'booked' || availability === 'unavailable';
  const tag = v.popular ? 'Most requested' : CATEGORY_TAG[v.category] ?? v.categoryLabel;

  return (
    <div className="lift group flex h-full flex-col overflow-hidden rounded-[28px] border border-navy/8 bg-card dark:border-white/10">
      <div className="relative overflow-hidden bg-brand-mist dark:bg-white/5">
        <img
          src={v.image}
          alt={`${v.name} — ${v.categoryLabel} rental`}
          loading="lazy"
          className={cn(
            'aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105',
            booked && 'opacity-70'
          )}
        />
        <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-navy/85 font-display text-[11px] font-bold text-white backdrop-blur">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy shadow-sm">
          {tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-brand-orange">{v.categoryLabel}</span>
          <span className="font-display text-xl font-semibold tracking-tight text-navy dark:text-white">
            {formatUSD(v.daily)}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-navy dark:text-white">{v.name}</h3>
            <p className="text-xs text-muted-foreground">{v.year} · or similar</p>
          </div>
          {availability && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', AVAIL_DOT[availability])} />
              {AVAIL_LABEL[availability]}
              {availability === 'booked' && availableFrom && <>· {format(availableFrom, 'd MMM')}</>}
            </p>
          )}
        </div>

        {/* a single row of icon + text, not four boxed tiles */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-navy/50 dark:text-white/50" /> {v.seats} seats
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-navy/50 dark:text-white/50" /> {v.bags} bags
          </span>
          <span className="flex items-center gap-1.5">
            <Cog className="h-3.5 w-3.5 text-navy/50 dark:text-white/50" /> {v.transmission}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-navy/50 dark:text-white/50" /> {v.fuel}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Weekly <span className="font-semibold text-navy dark:text-white">{formatUSD(v.weekly)}/day</span>
          </span>
          <span>
            Monthly <span className="font-semibold text-navy dark:text-white">{formatUSD(v.monthly)}/day</span>
          </span>
        </div>

        <Link
          to={booked ? '#' : '/booking'}
          state={{ ...bookState, vehicleId: v.id }}
          aria-disabled={booked}
          className={cn(
            'mt-6 inline-flex items-center justify-center gap-2 rounded-full py-3 font-display text-sm font-semibold transition-all',
            booked
              ? 'cursor-not-allowed bg-navy/10 text-muted-foreground dark:bg-white/10'
              : 'bg-navy text-white hover:-translate-y-0.5 hover:bg-navy-700'
          )}
        >
          {availability === 'unavailable' ? 'Currently unavailable' : booked ? 'Unavailable for dates' : 'Book now'}
          {!booked && <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}
