import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { differenceInCalendarDays, format, addDays } from 'date-fns';
import {
  ArrowLeft, ArrowRight, BadgePercent, Banknote, CalendarDays, Car, Check, CheckCircle2,
  CreditCard, Loader2, MapPin, Printer, ShieldCheck, Smartphone, User, Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Reveal from '@/components/Reveal';
import { DateField } from '@/components/BookingWidget';
import LocationField from '@/components/LocationField';
import VehicleCalendarPopover from '@/components/VehicleCalendarPopover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DRIVER_OPTIONS, EXTRAS, FLEET, LOCATIONS, PROMO_CODES,
  formatUSD, rateFor, type Vehicle,
} from '@/data/fleet';
import { useFleetAvailability } from '@/hooks/useFleetAvailability';
import { createBooking, BookingConflictError } from '@/lib/bookings';

const STEPS = ['Dates & location', 'Choose vehicle', 'Configure', 'Your details', 'Payment', 'Confirmed'];

const PAYMENT_METHODS = [
  { id: 'paynow', label: 'PayNow', desc: 'Zimbabwe’s online payment gateway', icon: Wallet },
  { id: 'ecocash', label: 'EcoCash', desc: 'Pay from your EcoCash wallet', icon: Smartphone },
  { id: 'innbucks', label: 'InnBucks', desc: 'Pay via InnBucks', icon: Smartphone },
  { id: 'card', label: 'Visa / Mastercard', desc: 'Secure card payment', icon: CreditCard },
  { id: 'bank', label: 'Bank transfer', desc: 'EFT — booking held 24 hours', icon: Banknote },
];

interface Customer {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const inputCls =
  'rounded-2xl border-navy/15 bg-navy/[0.03] px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function Booking() {
  const { state } = useLocation() as { state: Record<string, string> | null };
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState(state?.location ?? LOCATIONS[0]);
  const [destination, setDestination] = useState(state?.destination ?? '');
  const [pickup, setPickup] = useState<Date | undefined>(
    state?.pickup ? new Date(state.pickup) : addDays(new Date(), 2)
  );
  const [dropoff, setDropoff] = useState<Date | undefined>(
    state?.dropoff ? new Date(state.dropoff) : addDays(new Date(), 5)
  );
  const [vehicleId, setVehicleId] = useState<string | undefined>(state?.vehicleId);
  const [driver, setDriver] = useState<'self' | 'chauffeur'>('self');
  const [extras, setExtras] = useState<string[]>([]);
  const [promo, setPromo] = useState('');
  const [promoPct, setPromoPct] = useState(0);
  const [customer, setCustomer] = useState<Customer>({ name: '', email: '', phone: '', notes: '' });
  const [method, setMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const days = pickup && dropoff ? Math.max(1, differenceInCalendarDays(dropoff, pickup)) : 0;
  const vehicle: Vehicle | undefined = FLEET.find((v) => v.id === vehicleId);
  const { availability, loading: availabilityLoading } = useFleetAvailability(pickup, days);

  const quote = useMemo(() => {
    if (!vehicle || days <= 0) return null;
    const { perDay, tier } = rateFor(vehicle, days);
    const base = perDay * days;
    const driverCost = driver === 'chauffeur' ? 25 * days : 0;
    const extrasCost = extras.reduce((sum, id) => {
      const e = EXTRAS.find((x) => x.id === id);
      return sum + (e ? e.perDay * days : 0);
    }, 0);
    const subtotal = base + driverCost + extrasCost;
    const discount = Math.round(subtotal * promoPct);
    const vat = Math.round((subtotal - discount) * 0.15);
    const total = subtotal - discount + vat;
    return { perDay, tier, base, driverCost, extrasCost, subtotal, discount, vat, total };
  }, [vehicle, days, driver, extras, promoPct]);

  const availableVehicles = useMemo(
    () =>
      FLEET.map((v) => ({ v, avail: availability[v.id] ?? 'available' })).filter(
        (x) => x.avail === 'available'
      ),
    [availability]
  );

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoPct(PROMO_CODES[code]);
      toast.success(`Promo ${code} applied — ${PROMO_CODES[code] * 100}% off`);
    } else {
      setPromoPct(0);
      toast.error('Invalid promo code');
    }
  }

  async function confirmPayment() {
    if (!method || !quote || !vehicle || !pickup || !dropoff) return;
    setProcessing(true);
    const ref = `NM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      // Simulated payment gateway delay — the real charge/webhook step comes later.
      await new Promise((resolve) => setTimeout(resolve, 1400));

      await createBooking({
        reference: ref,
        vehicleId: vehicle.id,
        pickupLocation: location,
        destination,
        startDate: pickup,
        endDate: dropoff,
        driver,
        extras,
        total: quote.total,
        guestName: customer.name,
        guestEmail: customer.email,
        guestPhone: customer.phone,
      });

      setBookingRef(ref);
      setStep(5);
      const record = {
        ref, vehicle: vehicle.name, location, destination,
        pickup: pickup.toISOString(), dropoff: dropoff.toISOString(),
        days, driver, extras, total: quote.total, method, customer,
        createdAt: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem('nm-bookings') ?? '[]');
      localStorage.setItem('nm-bookings', JSON.stringify([...prev, record]));
      toast.success('Payment confirmed — booking reserved');
    } catch (err) {
      if (err instanceof BookingConflictError) {
        toast.error(err.message);
        setStep(1);
      } else {
        console.error('Booking failed', err);
        toast.error('Something went wrong while confirming your booking. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  }

  const canNext =
    step === 0
      ? Boolean(pickup && dropoff && days > 0 && location)
      : step === 1
        ? Boolean(vehicleId)
        : step === 3
          ? Boolean(customer.name && /.+@.+\..+/.test(customer.email) && customer.phone)
          : step === 4
            ? Boolean(method)
            : true;

  return (
    <div>
      {/* header */}
      <section className="relative overflow-hidden bg-navy pb-14 pt-32">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/hero-savanna.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-navy/70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Online booking</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-5xl">
            {step === 5 ? 'Booking confirmed' : 'Book your vehicle'}
          </h1>
        </div>
      </section>

      {/* stepper */}
      <div className="sticky top-[64px] z-30 border-b border-navy/8 bg-background/90 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                  i === step && 'bg-navy text-white dark:bg-white dark:text-navy',
                  i < step && 'cursor-pointer text-brand-green-dark dark:text-brand-green',
                  i > step && 'text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                    i < step
                      ? 'bg-brand-green text-white'
                      : i === step
                        ? 'bg-brand-orange text-white'
                        : 'bg-navy/10 text-muted-foreground dark:bg-white/10'
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="h-px w-4 bg-navy/15 dark:bg-white/15" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* ---------------- main column ---------------- */}
        <div>
          {/* STEP 0 — dates */}
          {step === 0 && (
            <Reveal>
              <h2 className="font-display text-xl font-bold text-navy dark:text-white">When and where?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <LocationField label="Pickup location" value={location} onChange={setLocation} placeholder="City, address or airport" locate />
                <LocationField label="Destination" value={destination} onChange={setDestination} placeholder="Where to? (optional)" />
                <DateField label="Pickup date" date={pickup} onSelect={setPickup} />
                <DateField label="Return date" date={dropoff} onSelect={setDropoff} min={pickup} />
              </div>
              {days > 0 && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-4 py-2 text-xs font-bold text-brand-green-dark dark:text-brand-green">
                  <CalendarDays className="h-4 w-4" />
                  {days}-day rental {days >= 30 ? '· monthly rates apply' : days >= 7 ? '· weekly rates apply' : ''}
                </p>
              )}
            </Reveal>
          )}

          {/* STEP 1 — vehicle */}
          {step === 1 && (
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy dark:text-white">
                {availabilityLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {availableVehicles.length} vehicles available for your dates
              </h2>
              <div className="mt-6 space-y-4">
                {availableVehicles.map(({ v }, i) => {
                  const r = rateFor(v, days);
                  const selected = vehicleId === v.id;
                  return (
                    <Reveal key={v.id} delay={Math.min(i * 60, 300)}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setVehicleId(v.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setVehicleId(v.id);
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-5 rounded-3xl border-2 bg-card p-4 text-left transition-all',
                          selected
                            ? 'border-brand-orange shadow-xl shadow-brand-orange/10'
                            : 'border-navy/8 hover:border-navy/25 dark:border-white/10'
                        )}
                      >
                        <img src={v.image} alt={v.name} className="hidden h-24 w-36 shrink-0 rounded-2xl object-cover sm:block" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-navy dark:text-white">{v.name}</h3>
                            <span className="rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy dark:bg-white/10 dark:text-white">
                              {v.categoryLabel}
                            </span>
                            <VehicleCalendarPopover vehicleId={v.id} vehicleName={v.name} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {v.seats} seats · {v.transmission} · {v.fuel} · {v.bags} bags
                          </p>
                          <p className="mt-1.5 truncate text-xs text-muted-foreground">{v.features.join(' · ')}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display text-xl font-bold text-navy dark:text-white">
                            {formatUSD(r.perDay * days)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.tier} · {formatUSD(r.perDay)}/day
                          </p>
                          <span
                            className={cn(
                              'mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                              selected ? 'bg-brand-orange text-white' : 'bg-navy/8 text-navy/40 dark:bg-white/10'
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — configure */}
          {step === 2 && vehicle && (
            <Reveal>
              <h2 className="font-display text-xl font-bold text-navy dark:text-white">Configure your rental</h2>

              <h3 className="mt-8 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Driver option</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {DRIVER_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDriver(d.id)}
                    className={cn(
                      'rounded-3xl border-2 p-5 text-left transition-all',
                      driver === d.id ? 'border-brand-orange bg-brand-orange/5' : 'border-navy/8 dark:border-white/10'
                    )}
                  >
                    <p className="font-display text-sm font-bold text-navy dark:text-white">{d.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>
                    <p className="mt-2 text-sm font-bold text-brand-orange">
                      {d.perDay === 0 ? 'Included' : `+${formatUSD(d.perDay)}/day`}
                    </p>
                  </button>
                ))}
              </div>

              <h3 className="mt-8 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Extras</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {EXTRAS.map((e) => {
                  const on = extras.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      onClick={() => setExtras((x) => (on ? x.filter((i) => i !== e.id) : [...x, e.id]))}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                        on ? 'border-brand-green bg-brand-green/5' : 'border-navy/8 dark:border-white/10'
                      )}
                    >
                      <span className="text-sm font-semibold text-navy dark:text-white">{e.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">+{formatUSD(e.perDay)}/day</span>
                        <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', on ? 'bg-brand-green text-white' : 'bg-navy/10 dark:bg-white/10')}>
                          <Check className={cn('h-3 w-3', !on && 'opacity-30')} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 className="mt-8 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Promo code</h3>
              <div className="mt-3 flex max-w-sm gap-2">
                <Input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="e.g. NHANHO10"
                  className={inputCls}
                />
                <button
                  onClick={applyPromo}
                  className="flex shrink-0 items-center gap-2 rounded-2xl bg-navy px-5 text-sm font-bold text-white transition-colors hover:bg-brand-orange"
                >
                  <BadgePercent className="h-4 w-4" /> Apply
                </button>
              </div>
              {promoPct > 0 && (
                <p className="mt-2 text-xs font-bold text-brand-green-dark dark:text-brand-green">
                  {promoPct * 100}% discount applied to your rental
                </p>
              )}
            </Reveal>
          )}

          {/* STEP 3 — details */}
          {step === 3 && (
            <Reveal>
              <h2 className="font-display text-xl font-bold text-navy dark:text-white">Your details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  required
                  placeholder="Full name *"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className={inputCls}
                />
                <Input
                  required
                  type="tel"
                  placeholder="Phone number *"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className={inputCls}
                />
                <Input
                  required
                  type="email"
                  placeholder="Email address *"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className={cn(inputCls, 'sm:col-span-2')}
                />
                <Textarea
                  rows={3}
                  placeholder="Special requests (child seats, flight number for airport pickup, delivery address…)"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className={cn(inputCls, 'sm:col-span-2')}
                />
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                Your details are used only to manage this booking and are protected in line with our privacy policy.
              </p>
            </Reveal>
          )}

          {/* STEP 4 — payment */}
          {step === 4 && quote && (
            <Reveal>
              <h2 className="font-display text-xl font-bold text-navy dark:text-white">Choose payment method</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all',
                      method === m.id ? 'border-brand-orange bg-brand-orange/5' : 'border-navy/8 dark:border-white/10'
                    )}
                  >
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', method === m.id ? 'bg-brand-orange text-white' : 'bg-navy/[0.06] text-navy dark:bg-white/10 dark:text-white')}>
                      <m.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-display text-sm font-bold text-navy dark:text-white">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">{m.desc}</span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={confirmPayment}
                disabled={!method || processing}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-brand-orange py-4 font-display text-base font-bold text-white shadow-xl shadow-brand-orange/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto sm:px-14"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing payment…
                  </>
                ) : (
                  <>
                    Pay {formatUSD(quote.total)} <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                Demo checkout — no real charge is made. Your booking record is stored in this browser only.
              </p>
            </Reveal>
          )}

          {/* STEP 5 — confirmation */}
          {step === 5 && quote && vehicle && (
            <Reveal>
              <div className="rounded-3xl border border-brand-green/30 bg-brand-green/5 p-8 text-center sm:p-12">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-green text-white" style={{ animation: 'pulse-ring 2s infinite' }}>
                  <CheckCircle2 className="h-10 w-10" />
                </span>
                <h2 className="mt-6 font-display text-2xl font-bold text-navy dark:text-white sm:text-3xl">
                  You’re booked, {customer.name.split(' ')[0]}!
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Booking reference
                </p>
                <p className="mt-1 font-display text-3xl font-bold tracking-wide text-brand-orange">{bookingRef}</p>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  A confirmation and invoice have been sent to <span className="font-semibold text-navy dark:text-white">{customer.email}</span>.
                  Present your reference and driver’s licence at pickup.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-3 font-display text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy"
                  >
                    <Printer className="h-4 w-4" /> Print invoice
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-brand-orange"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {/* nav buttons */}
          {step < 5 && (
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-navy transition-colors hover:bg-navy/5 disabled:opacity-0 dark:text-white dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < 4 && (
                <button
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/25 transition-all hover:-translate-y-0.5 hover:bg-brand-orange disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- summary sidebar ---------------- */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <Reveal className="overflow-hidden rounded-3xl border border-navy/8 bg-card shadow-xl shadow-navy/5 dark:border-white/10">
            <div className="bg-navy p-5 text-white">
              <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">Your rental</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-brand-green" /> {location}
                {destination && <span className="text-white/50">→ {destination}</span>}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-brand-green" />
                {pickup && dropoff
                  ? `${format(pickup, 'dd MMM')} → ${format(dropoff, 'dd MMM yyyy')} · ${days} ${days === 1 ? 'day' : 'days'}`
                  : 'Select your dates'}
              </p>
            </div>

            {vehicle ? (
              <div>
                <img src={vehicle.image} alt={vehicle.name} className="aspect-[2/1] w-full object-cover" />
                <div className="p-5">
                  <p className="flex items-center gap-2 font-display text-lg font-bold text-navy dark:text-white">
                    <Car className="h-5 w-5 text-brand-orange" /> {vehicle.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {vehicle.seats} seats · {vehicle.transmission} · {vehicle.fuel}
                  </p>

                  {quote && (
                    <dl className="mt-5 space-y-2.5 border-t border-navy/10 pt-4 text-sm dark:border-white/10">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Vehicle ({quote.tier.toLowerCase()})
                        </dt>
                        <dd className="font-semibold text-navy dark:text-white">{formatUSD(quote.base)}</dd>
                      </div>
                      {quote.driverCost > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Chauffeur</dt>
                          <dd className="font-semibold text-navy dark:text-white">{formatUSD(quote.driverCost)}</dd>
                        </div>
                      )}
                      {quote.extrasCost > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Extras</dt>
                          <dd className="font-semibold text-navy dark:text-white">{formatUSD(quote.extrasCost)}</dd>
                        </div>
                      )}
                      {quote.discount > 0 && (
                        <div className="flex justify-between text-brand-green-dark dark:text-brand-green">
                          <dt>Promo discount</dt>
                          <dd className="font-semibold">−{formatUSD(quote.discount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">VAT (15%)</dt>
                        <dd className="font-semibold text-navy dark:text-white">{formatUSD(quote.vat)}</dd>
                      </div>
                      <div className="flex justify-between border-t border-navy/10 pt-3 dark:border-white/10">
                        <dt className="font-display text-base font-bold text-navy dark:text-white">Total</dt>
                        <dd className="font-display text-xl font-bold text-brand-orange">{formatUSD(quote.total)}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Car className="mx-auto h-10 w-10 text-navy/20 dark:text-white/20" />
                <p className="mt-3">Your vehicle and full price breakdown will appear here.</p>
              </div>
            )}

            <div className="flex items-center gap-2.5 bg-brand-mist px-5 py-4 text-xs text-muted-foreground dark:bg-white/5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-green" />
              Free cancellation up to 48h before pickup · Fully insured options
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
