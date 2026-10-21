import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  sub?: string;
  image: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Full-bleed photo header with a dark overlay — used only by Booking now.
 * Every other inner page uses the light CollectionHeader instead; Home keeps
 * its own real-photo slider.
 */
export default function PageHeader({ eyebrow, title, sub, image, actions, className }: PageHeaderProps) {
  return (
    <section className={cn('relative overflow-hidden bg-navy pb-16 pt-36', className)}>
      <div className="absolute inset-0">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/75 to-navy-deep/55" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading dark align="left" eyebrow={eyebrow} title={title} sub={sub} />
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
