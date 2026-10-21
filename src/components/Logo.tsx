import { cn } from '@/lib/utils';

interface LogoProps {
  /** Controls the footprint + "NHANHO" text colour via currentColor — e.g. "text-navy dark:text-white" or "text-white". */
  className?: string;
  /** Hides the wordmark, showing only the icon — for tight spaces. */
  iconOnly?: boolean;
}

/**
 * Drawn (not photographed) footprint-and-road icon — a vector redraw of the real
 * artwork's shapes instead of a raster cutout, so there's no background to remove and
 * no halo/fringe to chase at any size. The footprint uses currentColor so it adapts
 * with the navbar (white over a dark photo, navy once scrolled); the orange/green
 * swoosh and the road's white lane dashes stay fixed brand colours either way, the
 * same split the original artwork uses.
 */
export default function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 44 44" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" fill="none" aria-hidden="true">
        <g fill="currentColor">
          <ellipse cx="13" cy="9" rx="3.3" ry="4.6" />
          <ellipse cx="20.2" cy="6.2" rx="3.6" ry="5.1" />
          <ellipse cx="27.5" cy="6.8" rx="3.4" ry="4.9" />
          <ellipse cx="33.8" cy="9.6" rx="2.9" ry="4.2" />
          <path d="M9 17c-4.2 3-6.6 9-4.5 14.9 2.1 5.9 8 9 14 7.9 5-1 8-5 8-10.7 0-5-3-9-7-11-4-2-8.2-2.2-10.5-1.1z" />
        </g>
        <path
          d="M14.5 41.5c-2-8 4-14.5 12-16.5 6.3-1.6 10-6.5 9.3-13"
          stroke="#F58220"
          strokeWidth="2.3"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M12.5 39.8c-1.3-7.6 4.8-13.6 12.6-15.8 6.1-1.7 9.6-6.3 9-12.4"
          stroke="#6CB33F"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M16 41.5c-1.8-7.6 4-13.6 11.6-15.7 6-1.7 9.6-6.3 9-12.8"
          stroke="currentColor"
          strokeWidth="5.2"
          strokeLinecap="round"
        />
        <path
          d="M16 41.5c-1.8-7.6 4-13.6 11.6-15.7 6-1.7 9.6-6.3 9-12.8"
          stroke="#fff"
          strokeWidth="1"
          strokeDasharray="2.4 3"
          strokeLinecap="round"
        />
      </svg>
      {!iconOnly && (
        <span className="hidden leading-none sm:block">
          <span className="block font-display text-xl font-extrabold tracking-tight">NHANHO</span>
          <span className="block font-display text-[11px] font-bold tracking-[0.25em] text-brand-orange">MOBILITY</span>
        </span>
      )}
    </span>
  );
}
