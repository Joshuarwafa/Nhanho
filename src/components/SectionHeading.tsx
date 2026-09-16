import { cn } from '@/lib/utils';
import Reveal from './Reveal';

interface Props {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export default function SectionHeading({ eyebrow, title, sub, align = 'center', dark = false }: Props) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]',
          dark ? 'text-white' : 'text-navy dark:text-white'
        )}
      >
        {title}
      </h2>
      {sub && (
        <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', dark ? 'text-white/70' : 'text-muted-foreground')}>
          {sub}
        </p>
      )}
    </Reveal>
  );
}
