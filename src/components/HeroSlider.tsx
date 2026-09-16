import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import BookingWidget from './BookingWidget';
import MagneticLink from './MagneticLink';

const DURATION = 6500;

const SLIDES = [
  {
    image: '/images/hero-savanna.jpg',
    kicker: 'Zimbabwe’s mobility partner',
    title: ['Every', 'journey,', 'engineered.'],
    sub: 'Vehicle rental, airport transfers and corporate transport — booked online in minutes, delivered with care.',
  },
  {
    image: '/images/hero-chauffeur.jpg',
    kicker: 'Executive & chauffeur services',
    title: ['Arrive', 'in', 'command.'],
    sub: 'Vetted professional chauffeurs and executive vehicles for leaders who value time and discretion.',
  },
  {
    image: '/images/corporate.jpg',
    kicker: 'Corporate mobility solutions',
    title: ['Your business,', 'in', 'motion.'],
    sub: 'SLA-backed corporate accounts, staff transport and fleet management that scale with you.',
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = (t - t0) / DURATION;
      if (p >= 1) {
        setIdx((i) => (i + 1) % SLIDES.length);
        setProgress(0);
        return;
      }
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx]);

  const slide = SLIDES[idx];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-navy-deep">
      {/* media */}
      {SLIDES.map((s, i) => (
        <div key={i} className={cn('hero-media absolute inset-0', i === idx && 'is-active')}>
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/45 to-navy-deep/30" />
        </div>
      ))}

      {/* copy */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-48 pt-32 sm:px-6 md:pb-40">
        {SLIDES.map((s, i) => (
          <div key={i} className={cn('hero-copy absolute max-w-3xl px-4 sm:px-0', i === idx && 'is-active')}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-brand-orange sm:text-sm">
              {s.kicker}
            </p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              {s.title.map((w, wi) => (
                <span key={wi} className="inline-block overflow-hidden pb-1 align-bottom">
                  <span className="hero-word" style={{ transitionDelay: `${wi * 90}ms` }}>
                    {w}
                    {wi < s.title.length - 1 ? ' ' : ''}
                  </span>
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{s.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticLink
                to="/booking"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3.5 font-display text-sm font-bold text-white shadow-xl shadow-brand-orange/40 transition-all hover:bg-brand-orange-dark"
              >
                Book a vehicle
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticLink>
              <Link
                to="/corporate"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Corporate solutions <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* booking widget */}
      <div className="absolute inset-x-0 bottom-20 z-10 px-4 sm:px-6 md:bottom-16">
        <div className="mx-auto max-w-5xl">
          <BookingWidget />
        </div>
      </div>

      {/* progress indicators */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2 px-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIdx(i);
              setProgress(0);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1 w-16 overflow-hidden rounded-full bg-white/25 sm:w-24"
          >
            <div
              className="h-full rounded-full bg-brand-orange"
              style={{ width: i === idx ? `${progress * 100}%` : i < idx ? '100%' : '0%' }}
            />
          </button>
        ))}
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-8 right-6 hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50 lg:block" style={{ writingMode: 'vertical-rl' }}>
        {slide.kicker}
      </div>
    </section>
  );
}
