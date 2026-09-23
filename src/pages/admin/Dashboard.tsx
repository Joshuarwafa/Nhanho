import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { CalendarClock, CarFront, Loader2, TrendingUp, Wrench } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { fetchAllBookings, fetchAllVehicles, fetchStatusLog } from '@/lib/admin';
import { FLEET, formatUSD } from '@/data/fleet';
import type { BookingRow, VehicleRow, VehicleStatusLogRow } from '@/types/database';

function isWithinNextDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const now = new Date();
  const end = new Date(now.getTime() + days * 86400000);
  return d >= now && d <= end;
}

function vehicleName(id: string) {
  return FLEET.find((v) => v.id === id)?.name ?? id;
}

const STATUS_DOT: Record<string, string> = {
  available: 'bg-brand-green',
  rented: 'bg-navy dark:bg-white',
  reserved: 'bg-brand-orange',
  maintenance: 'bg-red-500',
  out_of_service: 'bg-red-500',
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [log, setLog] = useState<VehicleStatusLogRow[] | null>(null);

  useEffect(() => {
    Promise.all([fetchAllBookings(), fetchAllVehicles(), fetchStatusLog(undefined, 8)]).then(([b, v, l]) => {
      setBookings(b);
      setVehicles(v);
      setLog(l);
    });
  }, []);

  if (!bookings || !vehicles || !log) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy dark:text-white" />
      </div>
    );
  }

  const active = bookings.filter((b) => b.status === 'confirmed' || b.status === 'active');
  const upcomingPickups = active.filter((b) => isWithinNextDays(b.start_date, 7));
  const upcomingReturns = active.filter((b) => isWithinNextDays(b.end_date, 7));
  const inMaintenance = vehicles.filter((v) => v.status === 'maintenance' || v.status === 'out_of_service');
  const thisMonthRevenue = bookings
    .filter((b) => b.status !== 'cancelled' && new Date(b.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + Number(b.total), 0);

  const cards = [
    { label: 'Active bookings', value: active.length, icon: CalendarClock, to: '/admin/bookings' },
    { label: 'Pickups next 7 days', value: upcomingPickups.length, icon: TrendingUp, to: '/admin/bookings' },
    { label: 'Returns next 7 days', value: upcomingReturns.length, icon: TrendingUp, to: '/admin/bookings' },
    { label: 'In maintenance', value: inMaintenance.length, icon: Wrench, to: '/admin/fleet' },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Live snapshot of bookings and fleet status." />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="lift rounded-3xl border border-navy/8 bg-card p-5 dark:border-white/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-navy dark:text-white">{c.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-brand-green" /> Revenue this month
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-navy dark:text-white">{formatUSD(thisMonthRevenue)}</p>
          </div>
          <div className="rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <CarFront className="h-4 w-4 text-brand-green" /> Fleet size
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-navy dark:text-white">{vehicles.length}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent fleet activity</p>
          {log.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No status changes yet — actions taken on the Fleet page will appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {log.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[entry.new_status]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-navy dark:text-white">
                      <span className="font-semibold">{vehicleName(entry.vehicle_id)}</span> marked{' '}
                      <span className="font-semibold capitalize">{entry.new_status.replace('_', ' ')}</span>
                      {entry.old_status && <span className="text-muted-foreground"> (was {entry.old_status.replace('_', ' ')})</span>}
                    </p>
                    {entry.note && <p className="mt-0.5 truncate text-xs text-muted-foreground">"{entry.note}"</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
