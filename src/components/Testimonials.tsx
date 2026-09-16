import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '@/data/content';
import SectionHeading from './SectionHeading';

const AUTO_MS = 5500;

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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number) => {
    setDirection(next > index || (index === TESTIMONIALS.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => go(index + 1), AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  const t = TESTIMONIALS[index];

  // drag-to-dismiss progress ring for the pause/play affordance
  const progress = useMotionValue(0);
  useEffect(() => {
    progress.set(0);
    if (paused) return;
    const controls = animate(progress, 1, { duration: AUTO_MS / 1000, ease: 'linear' });
    return () => controls.stop();
  }, [index, paused, progress]);
  const dash = useTransform(progress, (p) => 100 - p * 100);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-mist to-transparent dark:from-white/[0.03]" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading eyebrow="Client voices" title="Trusted on the road, and off it" sub="Real feedback from the individuals and businesses who move with Nhanho." />

        <div
          className="relative mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[280px] overflow-hidden rounded-[32px] border border-navy/8 bg-card p-8 shadow-xl shadow-navy/5 dark:border-white/10 sm:p-12">
            <Quote className="absolute right-8 top-8 h-16 w-16 text-navy/5 dark:text-white/5" />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: direction * -40, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
                className="relative"
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="mt-6 text-xl font-medium leading-relaxed text-navy dark:text-white sm:text-2xl">
                  “{t.quote}”
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_HUES[index % AVATAR_HUES.length]} font-display text-sm font-bold text-white`}
                  >
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-navy dark:text-white">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-navy"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="relative flex h-8 w-8 items-center justify-center"
                >
                  {i === index ? (
                    <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy/10 dark:text-white/10" />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        style={{ strokeDashoffset: dash, pathLength: 1 }}
                        pathLength={100}
                        className="text-brand-orange"
                      />
                      <circle cx="18" cy="18" r="4" className="fill-brand-orange" />
                    </svg>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-navy/20 dark:bg-white/20" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-navy"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
