import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '@/data/content';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_HUES = ['from-navy to-navy-600', 'from-brand-green to-brand-green-dark', 'from-brand-orange to-brand-orange-dark'];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-mist to-transparent dark:from-white/[0.03]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Client voices" title="Trusted on the road, and off it" sub="Real feedback from the individuals and businesses who move with Nhanho." />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90} className="h-full">
              <div className="relative flex h-full flex-col rounded-[28px] border border-navy/8 bg-card p-7 shadow-lg shadow-navy/5 dark:border-white/10">
                <Quote className="absolute right-6 top-6 h-10 w-10 text-navy/5 dark:text-white/5" />
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="relative mt-4 flex-1 text-sm leading-relaxed text-navy dark:text-white">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_HUES[i % AVATAR_HUES.length]} font-display text-xs font-bold text-white`}
                  >
                    {initials(t.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-navy dark:text-white">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
