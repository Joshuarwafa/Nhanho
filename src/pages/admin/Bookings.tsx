import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Download, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { bookingsToCSV, fetchAllBookings, setBookingStatus } from '@/lib/admin';
import { FLEET, formatUSD } from '@/data/fleet';
import type { BookingRow, BookingStatus } from '@/types/database';

const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green',
  active: 'bg-navy/10 text-navy dark:bg-white/15 dark:text-white',
  completed: 'bg-navy/[0.06] text-muted-foreground',
  cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function vehicleName(id: string) {
  return FLEET.find((v) => v.id === id)?.name ?? id;
}

export default function AdminBookings() {
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setRows(await fetchAllBookings());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (rows ?? []).filter((b) => filter === 'all' || b.status === filter),
    [rows, filter]
  );

  async function updateStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    try {
      await setBookingStatus(id, status);
      toast.success(`Booking marked ${status}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const blob = new Blob([bookingsToCSV(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhanho-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!rows) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy dark:text-white" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        subtitle={`${filtered.length} of ${rows.length} bookings`}
        actions={
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'confirmed', 'active', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors',
              filter === s ? 'bg-navy text-white dark:bg-white dark:text-navy' : 'bg-navy/[0.05] text-navy dark:bg-white/10 dark:text-white'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-navy/8 dark:border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs font-bold uppercase tracking-wider text-muted-foreground dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/8 dark:divide-white/10">
            {filtered.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-navy/[0.02] dark:hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-navy dark:text-white">{b.reference}</td>
                <td className="px-4 py-3 text-navy dark:text-white">{vehicleName(b.vehicle_id)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy dark:text-white">{b.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{b.guest_email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {format(new Date(b.start_date), 'dd MMM')} → {format(new Date(b.end_date), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-3 font-semibold text-navy dark:text-white">{formatUSD(Number(b.total))}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold capitalize', STATUS_STYLE[b.status])}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => updateStatus(b.id, 'completed')}
                        title="Mark completed"
                        className="rounded-full p-1.5 text-brand-green hover:bg-brand-green/10 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        title="Cancel booking"
                        className="rounded-full p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No bookings match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
