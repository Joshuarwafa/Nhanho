import { Link } from 'react-router';
import { ArrowRight, Briefcase, Building2, Car, CheckCircle2, KeyRound, MapPinned, Plane, Smartphone, Users, Wrench } from 'lucide-react';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/SectionHeading';
import { SERVICES } from '@/data/content';

const ICONS = [Car, Building2, Plane, KeyRound, Users, Wrench, Briefcase, MapPinned, Smartphone];

// The three services most customers actually come for get a bolder, larger
// treatment; the rest sit in a calmer secondary grid. Nine identical boxes in a
// row give the eye nowhere to land first — this gives the page an actual hierarchy.
const FEATURED_COUNT = 3;

export default function Services() {
  const featured = SERVICES.slice(0, FEATURED_COUNT);
  const rest = SERVICES.slice(FEATURED_COUNT);

  return (
    <div>
      <PageHeader
        eyebrow="Services"
        title="Nine ways we keep Zimbabwe moving"
        sub="Every service is delivered with the same promise — safe, reliable, affordable and technology-driven."
        image="/images/fortuner-safari.jpg"
      />

      {/* featured services — bold, filled cards */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading align="left" eyebrow="Most booked" title="Start here" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={s.id} delay={i * 110} className="h-full">
                <article id={s.id} className="lift flex h-full scroll-mt-28 flex-col rounded-3xl bg-navy p-8 text-white">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-6 font-display text-xl font-semibold tracking-tight">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{s.short}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-white/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/booking"
                    className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-brand-orange"
                  >
                    Book this service <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* every other service — compact, secondary weight */}
      <section className="bg-brand-mist py-20 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading align="left" eyebrow="Also available" title="The full picture" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((s, i) => {
              const Icon = ICONS[(i + FEATURED_COUNT) % ICONS.length];
              return (
                <Reveal key={s.id} delay={(i % 3) * 90} className="h-full">
                  <article id={s.id} className="lift flex h-full scroll-mt-28 items-start gap-4 rounded-2xl border border-navy/8 bg-card p-5 dark:border-white/10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/[0.06] text-navy dark:bg-white/10 dark:text-white">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-semibold tracking-tight text-navy dark:text-white">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.short}</p>
                      <Link to="/booking" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                        Book now <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy dark:text-white sm:text-4xl">Need something bespoke?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            NGO projects, government tenders, event transport masterplans — tell us the problem and we design the answer.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-block rounded-full bg-brand-orange px-8 py-4 font-display text-sm font-bold text-white shadow-xl shadow-brand-orange/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark"
          >
            Talk to our team
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
