import { type ReactNode } from 'react';
import { NavLink } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { CalendarClock, Car, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOutAdmin } from '@/lib/auth';
import { useNoIndex } from '@/hooks/useNoIndex';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarClock, end: false },
  { to: '/admin/fleet', label: 'Fleet', icon: Car, end: false },
];

export default function AdminShell({ children, session }: { children: ReactNode; session: Session | null }) {
  useNoIndex();

  return (
    <div className="flex min-h-screen bg-brand-mist dark:bg-navy-deep">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy/8 bg-white dark:border-white/10 dark:bg-navy sm:flex">
        <div className="flex items-center gap-2.5 border-b border-navy/8 px-6 py-5 dark:border-white/10">
          <img src="/images/logo.png" alt="Nhanho Mobility" className="h-9 w-auto rounded-md" />
          <div>
            <p className="font-display text-sm font-bold leading-tight text-navy dark:text-white">Nhanho</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">Admin portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Manage</p>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-navy text-white shadow-sm dark:bg-white dark:text-navy'
                    : 'text-navy/70 hover:bg-navy/5 dark:text-white/70 dark:hover:bg-white/10'
                )
              }
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy/8 px-3 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5 rounded-xl bg-navy/[0.03] px-3 py-2.5 dark:bg-white/5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p className="min-w-0 truncate text-xs font-semibold text-navy dark:text-white" title={session?.user.email ?? ''}>
              {session?.user.email}
            </p>
          </div>
          <button
            onClick={() => signOutAdmin()}
            className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-navy sm:hidden">
          <img src="/images/logo.png" alt="Nhanho Mobility" className="h-8 w-auto rounded-md" />
          <button onClick={() => signOutAdmin()} className="text-sm font-semibold text-red-600 dark:text-red-400">
            Sign out
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-navy/8 bg-white px-3 py-2 dark:border-white/10 dark:bg-navy sm:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold',
                  isActive ? 'bg-navy text-white dark:bg-white dark:text-navy' : 'text-navy/70 dark:text-white/70'
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
