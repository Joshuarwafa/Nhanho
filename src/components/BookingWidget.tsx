import { useState } from 'react';
import { useNavigate } from 'react-router';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LocationField from '@/components/LocationField';
import { LOCATIONS } from '@/data/fleet';

export function DateField({
  label,
  date,
  onSelect,
  min,
  dark,
}: {
  label: string;
  date?: Date;
  onSelect: (d: Date | undefined) => void;
  min?: Date;
  dark?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors',
            dark ? 'bg-white/10 hover:bg-white/15' : 'bg-navy/[0.04] hover:bg-navy/[0.07] dark:bg-white/10 dark:hover:bg-white/15'
          )}
        >
          <CalendarIcon className="h-5 w-5 shrink-0 text-brand-orange" />
          <span className="min-w-0">
            <span className={cn('block text-[11px] font-semibold uppercase tracking-wider', dark ? 'text-white/60' : 'text-muted-foreground')}>
              {label}
            </span>
            <span className={cn('block truncate text-sm font-semibold', dark ? 'text-white' : 'text-navy dark:text-white')}>
              {date ? format(date, 'EEE, dd MMM yyyy') : 'Select date'}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={{ before: min ?? new Date() }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function BookingWidget({ dark = false, className }: { dark?: boolean; className?: string }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState<Date | undefined>(addDays(new Date(), 2));
  const [dropoff, setDropoff] = useState<Date | undefined>(addDays(new Date(), 5));

  const days = pickup && dropoff ? Math.max(1, differenceInCalendarDays(dropoff, pickup)) : 0;

  return (
    <div
      className={cn(
        'glass rounded-[28px] p-3 shadow-2xl shadow-navy/20 ring-1 ring-white/40 dark:ring-white/10',
        className
      )}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <LocationField label="Pickup location" value={location} onChange={setLocation} placeholder="City, address or airport" locate dark={dark} />
        <LocationField label="Destination" value={destination} onChange={setDestination} placeholder="Where to? (optional)" dark={dark} />
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <DateField label="Pickup date" date={pickup} onSelect={setPickup} dark={dark} />
        <DateField label="Return date" date={dropoff} onSelect={setDropoff} min={pickup} dark={dark} />

        <button
          onClick={() =>
            navigate('/booking', {
              state: {
                location,
                destination,
                pickup: pickup?.toISOString(),
                dropoff: dropoff?.toISOString(),
              },
            })
          }
          className="group flex items-center justify-center gap-2 rounded-2xl bg-brand-orange px-7 py-3 font-display text-sm font-bold text-white shadow-lg shadow-brand-orange/40 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark"
        >
          <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
          Search
          {days > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
