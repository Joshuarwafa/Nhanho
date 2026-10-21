import { HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/SectionHeading';
import { MILESTONES, VALUES } from '@/data/content';

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About us"
        title="The road is our promise"
        sub="Nhanho Mobility (Private Limited) is building Zimbabwe’s most trusted, technology-driven mobility company."
        image="/images/fortuner-safari.jpg"
      />

      {/* story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <img src="/images/corporate.jpg" alt="Nhanho Mobility team" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-2xl shadow-navy/20" />
          </Reveal>
          <Reveal delay={120}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Our story</p>
            <h2 className="mt-3 text-3xl font-bold text-navy dark:text-white sm:text-4xl">
              Born from a simple frustration: moving around Zimbabwe was harder than it should be.
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Nhanho — a footprint on the move. Our logo says it plainly: a footprint becoming a road.
              We started in Harare with the belief that mobility should be safe, reliable, affordable
              and as easy to book as sending a message.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Today we serve individuals, corporates and institutions with vehicle rental, chauffeur
              services, airport transfers, staff transport and full fleet management — all orchestrated
              through our digital platform. Tomorrow: Southern Africa.
            </p>
          </Reveal>
        </div>
      </section>

      {/* mission / vision — editorial, not a card grid. The word itself is the
          visual anchor instead of an icon badge, divided by rules rather than
          boxes, so it doesn't read as the same component repeated three times. */}
      <section className="bg-brand-mist py-20 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid divide-y divide-navy/10 dark:divide-white/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {[
              { title: 'Mission', text: 'To provide safe, reliable, affordable, and technology-driven mobility solutions for individuals, businesses, and institutions.' },
              { title: 'Vision', text: 'To become Zimbabwe’s leading mobility solutions company before expanding into Southern Africa.' },
              { title: 'Promise', text: 'Every vehicle roadworthy. Every driver vetted. Every price transparent. Every call answered.' },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 120} className={cn('py-8 lg:py-0', i > 0 && 'lg:pl-10', i < 2 && 'lg:pr-10')}>
                <p className="font-display text-4xl font-bold uppercase italic tracking-tight text-brand-orange/25">
                  {c.title}
                </p>
                <p className="mt-4 max-w-xs text-lg leading-relaxed text-navy dark:text-white">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* values */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Our values" title="What every kilometre stands on" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="h-full">
                <div className="h-full rounded-3xl bg-brand-mist p-6 dark:bg-white/5">
                  <p className="font-display text-3xl font-bold text-brand-orange/30">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-display text-lg font-bold text-navy dark:text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* milestones — kept light; the header already carries the one dark band this
          page needs, stacking a second full-width navy section back-to-back with the
          others reads as busy rather than premium. */}
      <section className="bg-brand-mist py-24 dark:bg-transparent">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="Milestones" title="The journey so far" />
          <div className="relative mt-16">
            <div className="absolute left-4 top-0 h-full w-px bg-navy/10 dark:bg-white/10 md:left-1/2" />
            {MILESTONES.map((m, i) => (
              <Reveal key={m.title} delay={i * 100} className={`relative mb-12 pl-14 md:w-1/2 md:pl-0 ${i % 2 ? 'md:ml-auto md:pl-14' : 'md:pr-14 md:text-right'}`}>
                <span className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange font-display text-[10px] font-bold text-white left-0 ${i % 2 ? 'md:-left-4' : 'md:left-auto md:-right-4'}`}>
                  {m.year.slice(2)}
                </span>
                <p className="font-display text-sm font-bold text-brand-orange">{m.year}</p>
                <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-navy dark:text-white">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* leadership */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <SectionHeading eyebrow="Leadership" title="Driven by people who love the road" />
          <Reveal className="mx-auto mt-10 max-w-2xl">
            <div className="rounded-3xl border border-navy/8 bg-card p-8 dark:border-white/10">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy font-display text-2xl font-bold text-white">
                <HeartHandshake className="h-9 w-9" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-navy dark:text-white">The Nhanho Leadership Team</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                A compact leadership bench across operations, fleet, technology and customer experience —
                united by one obsession: journeys that start on time and end with a smile.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
