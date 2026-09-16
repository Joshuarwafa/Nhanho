import { useState } from 'react';
import { Link } from 'react-router';
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react';
import { CONTACT } from '@/data/content';
import { toast } from 'sonner';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      {/* faint road silhouette */}
      <svg viewBox="0 0 1440 120" className="absolute top-0 h-16 w-full text-white/5" preserveAspectRatio="none" fill="none">
        <path d="M-20 110 C 300 110 380 30 640 30 C 900 30 960 95 1220 85 C 1360 80 1420 50 1460 40" stroke="currentColor" strokeWidth="40" strokeLinecap="round" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <img src="/images/logo.png" alt="Nhanho Mobility" className="h-16 w-auto rounded-xl bg-white/95 p-1.5" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Safe, reliable, affordable and technology-driven mobility solutions for individuals,
              businesses and institutions across Zimbabwe.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media"
                  className="rounded-full bg-white/10 p-2.5 transition-all hover:-translate-y-1 hover:bg-brand-orange"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-brand-orange">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {[
                ['/', 'Home'],
                ['/fleet', 'Our Fleet'],
                ['/services', 'Services'],
                ['/corporate', 'Corporate Solutions'],
                ['/about', 'About Us'],
                ['/booking', 'Book Online'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-brand-orange">Services</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {['Vehicle Rental', 'Corporate Transport', 'Airport Transfers', 'Chauffeur Services', 'Staff Transport', 'Fleet Management'].map((s) => (
                <li key={s}>
                  <Link to="/services" className="transition-colors hover:text-white">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-brand-orange">Stay in the loop</h4>
            <p className="mt-5 text-sm text-white/70">Promotions, fleet news and travel tips — once a month, no spam.</p>
            <form
              className="mt-4 flex overflow-hidden rounded-full bg-white/10 p-1 focus-within:ring-2 focus-within:ring-brand-orange"
              onSubmit={(e) => {
                e.preventDefault();
                if (email) {
                  toast.success('Subscribed! Welcome to the Nhanho journey.');
                  setEmail('');
                }
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-transparent px-4 text-sm outline-none placeholder:text-white/40"
              />
              <button className="rounded-full bg-brand-orange p-3 transition-colors hover:bg-brand-orange-dark" aria-label="Subscribe">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-green" /> {CONTACT.phone1} · {CONTACT.phone2}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-green" /> {CONTACT.email}
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-brand-green" /> {CONTACT.address}
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-brand-green" /> Airport & emergency line: 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Nhanho Mobility (Private Limited). All rights reserved.</p>
          <p className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Rental Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
