import { useId, useState } from 'react';
import { Crosshair, Loader2, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { locateCurrentAddress } from '@/lib/geo';
import { LOCATIONS } from '@/data/fleet';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Shows the "use my current location" crosshair button — meant for the pickup field. */
  locate?: boolean;
  dark?: boolean;
  className?: string;
}

export default function LocationField({ label, value, onChange, placeholder, locate = false, dark = false, className }: Props) {
  const listId = useId();
  const [locating, setLocating] = useState(false);

  async function useMyLocation() {
    setLocating(true);
    try {
      const address = await locateCurrentAddress();
      onChange(address);
      toast.success('Current location detected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not detect your location');
    } finally {
      setLocating(false);
    }
  }

  return (
    <label
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors',
        dark ? 'bg-white/10 hover:bg-white/15' : 'bg-navy/[0.04] hover:bg-navy/[0.07] dark:bg-white/10 dark:hover:bg-white/15',
        className
      )}
    >
      {locate ? <Navigation className="h-5 w-5 shrink-0 text-brand-orange" /> : <MapPin className="h-5 w-5 shrink-0 text-brand-orange" />}
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[11px] font-semibold uppercase tracking-wider', dark ? 'text-white/60' : 'text-muted-foreground')}>
          {label}
        </span>
        <input
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Enter an address'}
          className={cn(
            'w-full min-w-0 truncate bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-current placeholder:opacity-40',
            dark ? 'text-white' : 'text-navy dark:text-white'
          )}
        />
        <datalist id={listId}>
          {LOCATIONS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </span>
      {locate && (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          aria-label="Use my current location"
          title="Use my current location"
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60',
            dark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-navy/10 text-navy hover:bg-navy hover:text-white dark:bg-white/15 dark:text-white dark:hover:bg-white dark:hover:text-navy'
          )}
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
        </button>
      )}
    </label>
  );
}
