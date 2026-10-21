import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Reveal from './Reveal';

interface CollectionHeaderProps {
  eyebrow: string;
  /** Two-line heading — first line in the body colour, second in brand orange. */
  titleLines: [string, string];
  description: string;
  /** Optional photo as the section's own background, with a dark overlay for contrast. */
  photo?: string;
  /** Optional row below the divider — e.g. a live count, filters. */
  children?: ReactNode;
  className?: string;
}

/**
 * Static editorial header shared by every inner page except Booking (which keeps
 * its own photo header). Replaces the old dark/animated Sunset header — a shifting
 * multi-colour background read as noisy once the whole site settled on one brand
 * colour. Either a plain light background, or (with `photo`) that same layout laid
 * over a real photo instead.
 */
export default function CollectionHeader({ eyebrow, titleLines, description, photo, children, className }: CollectionHeaderProps) {
  return (
    <section className={cn('relative overflow-hidden pb-10 pt-36', photo ? 'bg-navy' : 'bg-brand-mist dark:bg-transparent', className)}>
      {photo && (
        <div className="absolute inset-0">
          <img src={photo} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-navy-deep/40" />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">
              <span className="h-px w-6 bg-brand-orange" /> {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              <span className={cn('block', photo ? 'text-white' : 'text-navy dark:text-white')}>{titleLines[0]}</span>
              <span className="block text-brand-orange">{titleLines[1]}</span>
            </h1>
          </Reveal>
          <Reveal delay={120} className="max-w-sm lg:text-right">
            <p className={cn('text-sm leading-relaxed sm:text-base', photo ? 'text-white/75' : 'text-muted-foreground')}>{description}</p>
          </Reveal>
        </div>

        {children && (
          <Reveal
            delay={180}
            className={cn('mt-10 flex flex-wrap items-center justify-between gap-6 border-t pt-6', photo ? 'border-white/20' : 'border-navy/10 dark:border-white/10')}
          >
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
