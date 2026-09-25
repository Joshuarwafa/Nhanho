import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT } from '@/data/content';

const inputCls =
  'rounded-2xl border-navy/15 bg-navy/[0.03] px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function Contact() {
  const [sent, setSent] = useState(false);

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
            eyebrow="Contact"
            title="Talk to a human, any time"
            sub="Phone, WhatsApp, email or the form below — whichever road suits you."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          {/* info */}
          <div className="space-y-5">
            <Reveal>
              <div className="grid gap-5 sm:grid-cols-2">
                <a href={`tel:${CONTACT.phone1Raw}`} className="lift rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
                  <Phone className="h-6 w-6 text-brand-orange" />
                  <h3 className="mt-4 font-display text-sm font-bold text-navy dark:text-white">Call us</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{CONTACT.phone1}</p>
                </a>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="lift rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10"
                >
                  <MessageCircle className="h-6 w-6 text-brand-green" />
                  <h3 className="mt-4 font-display text-sm font-bold text-navy dark:text-white">WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Fast replies, booking support</p>
                  <p className="text-sm text-muted-foreground">{CONTACT.phone1}</p>
                </a>
                <a href={`mailto:${CONTACT.email}`} className="lift rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
                  <Mail className="h-6 w-6 text-brand-orange" />
                  <h3 className="mt-4 font-display text-sm font-bold text-navy dark:text-white">Email</h3>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{CONTACT.email}</p>
                </a>
                <div className="lift rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
                  <Clock className="h-6 w-6 text-brand-orange" />
                  <h3 className="mt-4 font-display text-sm font-bold text-navy dark:text-white">Business hours</h3>
                  {CONTACT.hours.map((h) => (
                    <p key={h.d} className="mt-1 flex justify-between gap-2 text-sm text-muted-foreground">
                      <span>{h.d}</span>
                      <span className="font-semibold text-navy dark:text-white">{h.h}</span>
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* map */}
            <Reveal delay={100}>
              <div className="overflow-hidden rounded-3xl border border-navy/8 dark:border-white/10">
                <iframe
                  title="Nhanho Mobility — Harare, Zimbabwe"
                  src="https://www.google.com/maps?q=Harare,+Zimbabwe&output=embed"
                  className="h-72 w-full border-0"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-orange" /> {CONTACT.address} — nationwide delivery & collection
              </p>
            </Reveal>
          </div>

          {/* form */}
          <Reveal delay={150}>
            {sent ? (
              <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-3xl border border-brand-green/30 bg-brand-green/5 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-navy dark:text-white">Message sent</h3>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                  Thanks for reaching out — we reply within business hours, and the airport line never sleeps.
                </p>
              </div>
            ) : (
              <form
                className="grid gap-4 rounded-3xl border border-navy/8 bg-card p-7 shadow-xl shadow-navy/5 dark:border-white/10"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast.success('Message sent');
                }}
              >
                <h3 className="font-display text-xl font-bold text-navy dark:text-white">Send us a message</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input required placeholder="Full name *" className={inputCls} />
                  <Input required type="email" placeholder="Email address *" className={inputCls} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input type="tel" placeholder="Phone (optional)" className={inputCls} />
                  <select defaultValue="General enquiry" className={inputCls}>
                    {['General enquiry', 'Vehicle rental', 'Corporate services', 'Airport transfer', 'Feedback'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <Textarea required rows={6} placeholder="How can we help? *" className={inputCls} />
                <button className="rounded-full bg-brand-orange py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark">
                  Send message
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
