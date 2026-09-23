import { Link } from 'react-router';
import { ArrowRight, Briefcase, Cog, Fuel, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUSD, type Vehicle } from '@/data/fleet';

interface Props {
  v: Vehicle;
  availability?: 'available' | 'booked' | 'unavailable';
  bookState?: Record<string, unknown>;
}

const AVAIL_STYLE = {
  available: { label: 'Available', cls: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' },
  booked: { label: 'Booked', cls: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  unavailable: { label: 'Unavailable', cls: 'bg-navy/15 text-navy dark:bg-white/15 dark:text-white' },
} as const;

export default function VehicleCard({ v, availability, bookState }: Props) {
  const booked = availability === 'booked' || availability === 'unavailable';

  return (
    <div className="lift group flex h-full flex-col overflow-hidden rounded-3xl border border-navy/8 bg-card dark:border-white/10">
      <div className="relative overflow-hidden bg-brand-mist dark:bg-white/5">
        <img
          src={v.image}
          alt={`${v.name} — ${v.categoryLabel} rental`}
          loading="lazy"
          className={cn(
            'aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105',
            booked && 'opacity-60 grayscale'
          )}
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-navy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {v.categoryLabel}
          </span>
          {v.popular && (
            <span className="rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Popular
            </span>
          )}
        </div>
        {availability && (
          <span
            className={cn(
              'absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur',
              AVAIL_STYLE[availability].cls
            )}
          >
            {AVAIL_STYLE[availability].label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-navy dark:text-white">{v.name}</h3>
            <p className="text-xs text-muted-foreground">{v.year} · or similar</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-navy dark:text-white">
              {formatUSD(v.daily)}
              <span className="text-xs font-medium text-muted-foreground">/day</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-muted-foreground">
          {(
            [
              [Users, `${v.seats} seats`],
              [Briefcase, `${v.bags} bags`],
              [Cog, v.transmission],
              [Fuel, v.fuel],
            ] as [LucideIcon, string][]
          ).map(([Icon, label], i) => (
            <div key={i} className="rounded-xl bg-navy/[0.04] px-1 py-2 dark:bg-white/5">
              <Icon className="mx-auto h-4 w-4 text-navy dark:text-white/80" />
              <p className="mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-mist px-3 py-2 text-xs dark:bg-white/5">
          <span className="text-muted-foreground">
            Weekly <span className="font-semibold text-navy dark:text-white">{formatUSD(v.weekly)}/day</span>
          </span>
          <span className="text-muted-foreground">
            Monthly <span className="font-semibold text-navy dark:text-white">{formatUSD(v.monthly)}/day</span>
          </span>
        </div>

        <Link
          to={booked ? '#' : '/booking'}
          state={{ ...bookState, vehicleId: v.id }}
          aria-disabled={booked}
          className={cn(
            'mt-5 inline-flex items-center justify-center gap-2 rounded-full py-3 font-display text-sm font-bold transition-all',
            booked
              ? 'cursor-not-allowed bg-navy/10 text-muted-foreground dark:bg-white/10'
              : 'bg-navy text-white hover:-translate-y-0.5 hover:bg-brand-orange'
          )}
        >
          {availability === 'unavailable' ? 'Currently unavailable' : booked ? 'Unavailable for dates' : 'Book now'}
          {!booked && <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}
