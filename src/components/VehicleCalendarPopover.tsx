import { useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchVehicleBookedRanges } from '@/lib/bookings';

interface Props {
  vehicleId: string;
  vehicleName: string;
}

/** "Availability calendar" — shows this vehicle's real booked dates, fetched fresh each time it's opened. */
export default function VehicleCalendarPopover({ vehicleId, vehicleName }: Props) {
  const [ranges, setRanges] = useState<{ start: Date; end: Date }[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onOpenChange(open: boolean) {
    if (!open || ranges) return;
    setLoading(true);
    try {
      setRanges(await fetchVehicleBookedRanges(vehicleId));
    } catch (err) {
      console.error('Failed to load booked dates', err);
      setRanges([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/15 px-3 py-1.5 text-[11px] font-bold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-navy"
        >
          <CalendarDays className="h-3.5 w-3.5" /> Availability
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b border-navy/8 px-4 py-3 dark:border-white/10">
          <p className="text-xs font-bold text-navy dark:text-white">{vehicleName} — booked dates</p>
          <p className="text-[11px] text-muted-foreground">Live from the booking system</p>
        </div>
        {loading ? (
          <div className="flex h-64 w-64 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Calendar
              disabled={(ranges ?? []).map((r) => ({ from: r.start, to: r.end }))}
              modifiers={{ booked: (ranges ?? []).map((r) => ({ from: r.start, to: r.end })) }}
              modifiersClassNames={{ booked: 'bg-red-500/10 text-red-600 dark:text-red-400 line-through' }}
              fromDate={new Date()}
            />
            <div className="flex items-center gap-2 border-t border-navy/8 px-4 py-2.5 text-[11px] text-muted-foreground dark:border-white/10">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500/20" /> Booked
              <span className="ml-3 h-2.5 w-2.5 rounded-sm bg-transparent ring-1 ring-navy/20 dark:ring-white/20" /> Free
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
