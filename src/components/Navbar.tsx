import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { Menu, Moon, Phone, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTACT } from '@/data/content';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/services', label: 'Services' },
  { to: '/corporate', label: 'Corporate' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'glass shadow-lg shadow-navy/5 py-2' : 'bg-transparent py-4'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="Nhanho Mobility home">
          <img src="/images/logo.png" alt="Nhanho Mobility logo" className={cn('w-auto transition-all', scrolled ? 'h-12' : 'h-14 md:h-16')} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-navy text-white dark:bg-white dark:text-navy'
                    : scrolled
                      ? 'text-navy hover:bg-navy/5 dark:text-white/85 dark:hover:bg-white/10'
                      : 'text-navy hover:bg-navy/5 lg:text-white lg:hover:bg-white/10'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${CONTACT.phone1Raw}`}
            className={cn(
              'hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold xl:flex',
              scrolled ? 'text-navy dark:text-white' : 'text-navy lg:text-white'
            )}
          >
            <Phone className="h-4 w-4" />
            {CONTACT.phone1}
          </a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className={cn(
              'rounded-full p-2.5 transition-colors',
              scrolled
                ? 'text-navy hover:bg-navy/5 dark:text-white dark:hover:bg-white/10'
                : 'text-navy hover:bg-navy/5 lg:text-white lg:hover:bg-white/10'
            )}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            to="/booking"
            className="hidden rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark sm:block"
          >
            Book Now
          </Link>
          <button
            className={cn(
              'rounded-full p-2.5 lg:hidden',
              scrolled ? 'text-navy dark:text-white' : 'text-navy'
            )}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={cn(
          'glass overflow-hidden transition-all duration-500 lg:hidden',
          open ? 'mt-2 max-h-[420px] border-t border-navy/10 dark:border-white/10' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3 text-base font-medium',
                  isActive ? 'bg-navy text-white' : 'text-navy dark:text-white'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/booking"
            className="mt-2 rounded-xl bg-brand-orange px-4 py-3 text-center text-base font-semibold text-white"
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
