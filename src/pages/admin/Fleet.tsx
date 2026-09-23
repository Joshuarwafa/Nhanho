import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { fetchAllVehicles, fetchStatusLog, setVehicleStatus } from '@/lib/admin';
import { useAdminSession } from '@/hooks/useAdminSession';
import type { VehicleRow, VehicleStatus, VehicleStatusLogRow } from '@/types/database';

const STATUS_OPTIONS: VehicleStatus[] = ['available', 'rented', 'reserved', 'maintenance', 'out_of_service'];

const STATUS_STYLE: Record<VehicleStatus, string> = {
  available: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green',
  rented: 'bg-navy/10 text-navy dark:bg-white/15 dark:text-white',
  reserved: 'bg-brand-orange/15 text-brand-orange-dark dark:text-brand-orange',
  maintenance: 'bg-red-500/15 text-red-600 dark:text-red-400',
  out_of_service: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function VehicleHistory({ vehicleId }: { vehicleId: string }) {
  const [log, setLog] = useState<VehicleStatusLogRow[] | null>(null);

  useEffect(() => {
    fetchStatusLog(vehicleId, 10).then(setLog);
  }, [vehicleId]);

  if (!log) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (log.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">No status changes recorded yet for this vehicle.</p>;
  }

  return (
    <ul className="space-y-2.5 py-4">
      {log.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-semibold capitalize text-navy dark:text-white">
              {entry.old_status ? `${entry.old_status.replace('_', ' ')} → ` : ''}
              {entry.new_status.replace('_', ' ')}
            </p>
            {entry.note && <p className="mt-0.5 text-muted-foreground">"{entry.note}"</p>}
          </div>
          <span className="shrink-0 text-muted-foreground">{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminFleet() {
  const { session } = useAdminSession();
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  async function load() {
    setVehicles(await fetchAllVehicles());
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(v: VehicleRow, status: VehicleStatus) {
    if (!session) return;
    if (status === v.status) return;
    setBusyId(v.id);
    try {
      await setVehicleStatus(v, status, notes[v.id] ?? '', session.user.id);
      toast.success(`${v.name} marked ${status.replace('_', ' ')}`);
      setNotes((n) => ({ ...n, [v.id]: '' }));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  if (!vehicles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy dark:text-white" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Fleet status"
        subtitle="Changes here take effect immediately on the public booking site."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {vehicles.map((v) => {
          const historyOpen = openHistory === v.id;
          return (
            <div key={v.id} className="overflow-hidden rounded-3xl border border-navy/8 bg-card dark:border-white/10">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <img src={v.image} alt={v.name} className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-navy dark:text-white">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.category_label}</p>
                    <span className={cn('mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', STATUS_STYLE[v.status])}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional note (service due, accident repair…)"
                    value={notes[v.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [v.id]: e.target.value }))}
                    className="min-w-[160px] flex-1 rounded-full border border-navy/15 bg-navy/[0.03] px-4 py-2 text-xs outline-none focus:border-brand-orange dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                  <select
                    disabled={busyId === v.id}
                    value={v.status}
                    onChange={(e) => changeStatus(v, e.target.value as VehicleStatus)}
                    className="cursor-pointer rounded-full bg-navy/[0.05] px-4 py-2 text-xs font-bold capitalize text-navy outline-none disabled:opacity-50 dark:bg-white/10 dark:text-white [&>option]:text-navy"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {busyId === v.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>

              <button
                onClick={() => setOpenHistory(historyOpen ? null : v.id)}
                className="flex w-full items-center justify-between border-t border-navy/8 px-5 py-2.5 text-xs font-semibold text-navy/70 transition-colors hover:bg-navy/[0.02] dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Status history
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', historyOpen && 'rotate-180')} />
              </button>
              {historyOpen && (
                <div className="border-t border-navy/8 px-5 dark:border-white/10">
                  <VehicleHistory vehicleId={v.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
