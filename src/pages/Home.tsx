import { Link } from 'react-router';
import {
  ArrowRight, Briefcase, Building2, Car, CheckCircle2, ChevronRight, Clock, Plane,
  ShieldCheck, Smartphone, Tag, Users, Wrench, MapPinned, KeyRound,
} from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import Reveal from '@/components/Reveal';
import RoadDivider from '@/components/RoadDivider';
import SectionHeading from '@/components/SectionHeading';
import StatCounter from '@/components/StatCounter';
import VehicleCard from '@/components/VehicleCard';
import Testimonials from '@/components/Testimonials';
import MagneticLink from '@/components/MagneticLink';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CATEGORIES } from '@/data/fleet';
import { CONTACT, FAQS, NEWS, PARTNERS, SERVICES, STATS, WHY_US } from '@/data/content';
import { useFleet } from '@/hooks/useFleet';

const SERVICE_ICONS = [Car, Building2, Plane, KeyRound, Users, Wrench, Briefcase, MapPinned, Smartphone];

export default function Home() {
  const { fleet } = useFleet();
  const featured = fleet.filter((v) => v.popular).slice(0, 4);

  return (
    <div className="overflow-x-clip">
      <HeroSlider />

      {/* ---------- Intro ---------- */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">
              Nhanho Mobility (Private Limited)
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy dark:text-white sm:text-4xl lg:text-[2.75rem]">
              Technology-driven mobility, built for Zimbabwe’s roads.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              From a single airport pickup to a fully outsourced corporate fleet, we combine a modern
              vehicle line-up with an online booking platform that gives you instant quotes, transparent
              pricing and confirmations in minutes.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'Instant online booking with live availability',
                'Self-drive or professional chauffeur options',
                'PayNow, EcoCash, InnBucks, Visa & Mastercard',
                'Automatic invoices and receipts for every trip',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-medium text-navy dark:text-white/85">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-display text-sm font-bold text-navy underline decoration-brand-orange decoration-2 underline-offset-8 transition-colors hover:text-brand-orange dark:text-white"
            >
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-navy/20">
              <img src="/images/hero-chauffeur.jpg" alt="Nhanho chauffeur service" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="glass absolute -bottom-6 -left-4 rounded-3xl p-5 shadow-xl sm:-left-8">
              <p className="font-display text-3xl font-bold text-navy dark:text-white">
                98<span className="text-brand-orange">%</span>
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">On-time pickups</p>
            </div>
            <div className="glass absolute -right-4 -top-6 flex items-center gap-3 rounded-3xl p-4 shadow-xl sm:-right-6" style={{ animation: 'float-slow 6s ease-in-out infinite' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy dark:text-white">Fully insured</p>
                <p className="text-xs text-muted-foreground">Every vehicle, every trip</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <RoadDivider />

      {/* ---------- Services ---------- */}
      <section className="bg-brand-mist py-24 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What we do"
            title="One partner for every kind of journey"
            sub="Nine service lines, one standard: safe, reliable, technology-driven mobility."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <Reveal key={s.id} delay={(i % 3) * 100}>
                  <Link
                    to={`/services#${s.id}`}
                    className="lift group flex h-full flex-col rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white transition-colors group-hover:bg-brand-orange">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-navy dark:text-white">{s.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
                      Learn more <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Fleet preview ---------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow="Our fleet"
              title="Vehicles for every mission"
              sub="From city hatchbacks to flagship SUVs — transparent daily, weekly and monthly rates."
            />
            <Reveal delay={100}>
              <Link
                to="/fleet"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-3 font-display text-sm font-bold text-navy transition-all hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy"
              >
                View full fleet <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          {/* category chips */}
          <Reveal className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/fleet?cat=${c.id}`}
                className="rounded-full bg-navy/[0.05] px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-navy"
              >
                {c.label}
              </Link>
            ))}
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v, i) => (
              <Reveal key={v.id} delay={i * 90} className="h-full">
                <VehicleCard v={v} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stats band ---------- */}
      <section className="relative overflow-hidden bg-navy py-20">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/hero-savanna.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/80 to-navy/60" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ---------- Why choose us ---------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Why Nhanho"
            title="The road deserves better than average"
          />
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 120} className="flex gap-6">
                <span className="font-display text-5xl font-bold leading-none text-navy/10 dark:text-white/10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-navy dark:text-white">{w.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RoadDivider flip />

      {/* ---------- Corporate band ---------- */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-navy/20">
              <img src="/images/corporate.jpg" alt="Corporate transport partnership" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="glass absolute -bottom-6 right-4 rounded-3xl p-5 shadow-xl sm:right-8">
              <p className="flex items-center gap-2 font-display text-lg font-bold text-navy dark:text-white">
                <Tag className="h-5 w-5 text-brand-orange" /> Corporate rates
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Volume discounts & consolidated billing</p>
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Corporate solutions</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy dark:text-white sm:text-4xl">
              Mobility that works as hard as your business
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Corporate accounts, long-term rentals, fleet outsourcing and employee transport —
              backed by service-level agreements, a dedicated account manager and monthly reporting.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {['Corporate accounts', 'Long-term rentals', 'Fleet outsourcing', 'Employee transport', 'Executive mobility', 'Volume discounts'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm font-medium text-navy dark:text-white/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/corporate"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-orange"
            >
              Explore corporate <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Testimonials />

      {/* ---------- Partners marquee ---------- */}
      <section className="border-y border-navy/8 bg-brand-mist py-10 dark:border-white/10 dark:bg-transparent">
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Trusted by teams across Zimbabwe
        </p>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-14 pr-14">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="whitespace-nowrap font-display text-lg font-semibold text-navy/40 dark:text-white/30">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ + News ---------- */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Questions" title="Frequently asked" />
            <Reveal className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.slice(0, 5).map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-navy/10 dark:border-white/10">
                    <AccordionTrigger className="text-left font-display text-sm font-bold text-navy hover:text-brand-orange dark:text-white">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Newsroom" title="Latest from Nhanho" />
            <div className="mt-8 space-y-4">
              {NEWS.map((n, i) => (
                <Reveal key={n.title} delay={i * 90}>
                  <article className="lift rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-brand-orange/10 px-3 py-1 font-bold uppercase tracking-wider text-brand-orange">
                        {n.tag}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {n.date}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-navy dark:text-white">{n.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0">
          <img src="/images/hero-savanna.jpg" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-deep/85" />
        </div>
        <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
            Ready when the road calls.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
            Book online in under three minutes — or talk to a real person, any time.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <MagneticLink
              to="/booking"
              className="rounded-full bg-brand-orange px-8 py-4 font-display text-sm font-bold text-white shadow-xl shadow-brand-orange/40 transition-all hover:bg-brand-orange-dark"
            >
              Book your vehicle
            </MagneticLink>
            <a
              href={`tel:${CONTACT.phone1Raw}`}
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Call {CONTACT.phone1}
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
