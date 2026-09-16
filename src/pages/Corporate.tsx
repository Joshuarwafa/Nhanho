import { useState } from 'react';
import { Building2, CheckCircle2, FileText, Handshake, LineChart, Percent, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import Reveal from '@/components/Reveal';
import RoadDivider from '@/components/RoadDivider';
import SectionHeading from '@/components/SectionHeading';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const OFFERINGS = [
  { icon: Building2, title: 'Corporate accounts', text: 'One account, consolidated monthly billing, credit terms and a dedicated portal for your team’s bookings.' },
  { icon: FileText, title: 'Long-term rentals', text: 'Monthly and annual hire with preferential rates, scheduled maintenance included and swap vehicles when serviced.' },
  { icon: LineChart, title: 'Fleet outsourcing', text: 'Hand us your fleet headaches — vehicles, maintenance, insurance, licensing, drivers and utilisation reporting.' },
  { icon: UserCheck, title: 'Employee transport', text: 'Route-planned staff shuttles with shift scheduling, attendance tracking and trip reporting.' },
  { icon: ShieldCheck, title: 'Executive mobility', text: 'Chauffeured executive vehicles for directors, visiting partners and VIP delegations.' },
  { icon: Percent, title: 'Corporate discounts', text: 'Volume-based pricing tiers that improve as your usage grows — automatically applied to every booking.' },
  { icon: Handshake, title: 'Service-level agreements', text: 'Guaranteed response times, vehicle standards and replacement commitments, in writing.' },
  { icon: UserCheck, title: 'Account management', text: 'A named account manager who knows your routes, your people and your budget.' },
];

const inputCls =
  'rounded-2xl border-navy/15 bg-navy/[0.03] px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function Corporate() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="relative overflow-hidden bg-navy pb-24 pt-36">
        <div className="absolute inset-0 opacity-25">
          <img src="/images/corporate.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy/80 to-navy/60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow="Corporate solutions"
            title="Mobility infrastructure for serious organisations"
            sub="From five staff shuttles to a fully outsourced national fleet — scoped, contracted and reported with enterprise rigour."
          />
        </div>
      </section>

      <RoadDivider />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((o, i) => (
            <Reveal key={o.title} delay={(i % 4) * 90} className="h-full">
              <div className="lift h-full rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <o.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-navy dark:text-white">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* process */}
      <section className="bg-brand-mist py-20 dark:bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="How it works" title="From enquiry to ignition in four steps" />
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              ['Discovery call', 'We map your routes, headcount, schedules and budget.'],
              ['Tailored proposal', 'Vehicles, rates, SLA terms and reporting — in one document.'],
              ['Onboarding', 'Account setup, driver briefings and system access within days.'],
              ['Run & report', 'Trips delivered, monthly utilisation and cost reports in your inbox.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 110} className="relative">
                <p className="font-display text-5xl font-bold text-brand-orange/25">{`0${i + 1}`}</p>
                <h3 className="mt-3 font-display text-lg font-bold text-navy dark:text-white">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* enquiry form */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Corporate enquiry</p>
            <h2 className="mt-3 text-3xl font-bold text-navy dark:text-white sm:text-4xl">
              Let’s design your mobility programme
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Tell us about your organisation and transport needs. A dedicated account manager will
              respond within one business day with next steps.
            </p>
            <ul className="mt-8 space-y-3">
              {['Response within 1 business day', 'No-obligation scoping call', 'References from existing corporate clients available'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-medium text-navy dark:text-white/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-brand-green/30 bg-brand-green/5 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-navy dark:text-white">Enquiry received</h3>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                  Thank you. An account manager will contact you within one business day.
                </p>
              </div>
            ) : (
              <form
                className="grid gap-4 rounded-3xl border border-navy/8 bg-card p-7 shadow-xl shadow-navy/5 dark:border-white/10"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast.success('Corporate enquiry submitted');
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input required placeholder="Company name *" className={inputCls} />
                  <Input required placeholder="Contact person *" className={inputCls} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input required type="email" placeholder="Work email *" className={inputCls} />
                  <Input required type="tel" placeholder="Phone *" className={inputCls} />
                </div>
                <select required defaultValue="" className={inputCls}>
                  <option value="" disabled>
                    Service needed *
                  </option>
                  {['Corporate account', 'Long-term rental', 'Fleet outsourcing', 'Staff transport', 'Executive mobility', 'Other / multiple'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <Textarea rows={4} placeholder="Tell us about your requirements (routes, headcount, timelines)…" className={inputCls} />
                <button className="rounded-full bg-brand-orange py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark">
                  Submit enquiry
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
