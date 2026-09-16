import { Link } from 'react-router';
import { ArrowRight, Briefcase, Building2, Car, CheckCircle2, KeyRound, MapPinned, Plane, Smartphone, Users, Wrench } from 'lucide-react';
import Reveal from '@/components/Reveal';
import RoadDivider from '@/components/RoadDivider';
import SectionHeading from '@/components/SectionHeading';
import { SERVICES } from '@/data/content';

const ICONS = [Car, Building2, Plane, KeyRound, Users, Wrench, Briefcase, MapPinned, Smartphone];

export default function Services() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy pb-16 pt-36">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/hero-chauffeur.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-navy/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow="Services"
            title="Nine ways we keep Zimbabwe moving"
            sub="Every service is delivered with the same promise — safe, reliable, affordable and technology-driven."
          />
        </div>
      </section>

      <RoadDivider />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={s.id} delay={(i % 3) * 100} className="h-full">
                <article id={s.id} className="lift flex h-full scroll-mt-28 flex-col rounded-3xl border border-navy/8 bg-card p-7 dark:border-white/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-6 font-display text-xl font-bold text-navy dark:text-white">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-navy/90 dark:text-white/80">
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

      <section className="bg-navy py-20">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Need something bespoke?</h2>
          <p className="mt-4 text-lg text-white/70">
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
