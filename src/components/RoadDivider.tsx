import { cn } from '@/lib/utils';
import Reveal from './Reveal';

/**
 * Signature brand divider — the winding road from the Nhanho logo.
 * Road edges draw in on scroll; the centre line drives forward forever.
 */
export default function RoadDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <Reveal className={cn('pointer-events-none relative -my-6 select-none', className)} aria-hidden>
      <svg
        viewBox="0 0 1440 160"
        className={cn('h-20 w-full md:h-28', flip && '-scale-x-100')}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* road body */}
        <path
          d="M-20 150 C 240 150 320 60 560 60 C 800 60 860 130 1100 120 C 1280 113 1380 70 1460 50"
          stroke="currentColor"
          strokeWidth="34"
          strokeLinecap="round"
          className="road-path text-navy/90 dark:text-navy-500/60"
          pathLength={1400}
          style={{ ['--road-len' as string]: 1400 }}
        />
        {/* centre dashes — driving forward */}
        <path
          d="M-20 150 C 240 150 320 60 560 60 C 800 60 860 130 1100 120 C 1280 113 1380 70 1460 50"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="road-dash text-white/80"
        />
      </svg>
    </Reveal>
  );
}
