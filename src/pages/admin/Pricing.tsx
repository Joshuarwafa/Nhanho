import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Input } from '@/components/ui/input';
import { fetchAllVehicles, updateVehiclePrices } from '@/lib/admin';
import { formatUSD } from '@/data/fleet';
import type { VehicleRow } from '@/types/database';

interface Draft {
  daily: string;
  weekly: string;
  monthly: string;
}

function toDraft(v: VehicleRow): Draft {
  return { daily: String(v.daily), weekly: String(v.weekly), monthly: String(v.monthly) };
}

function isDirty(draft: Draft, v: VehicleRow) {
  return Number(draft.daily) !== v.daily || Number(draft.weekly) !== v.weekly || Number(draft.monthly) !== v.monthly;
}

function isValid(draft: Draft) {
  return [draft.daily, draft.weekly, draft.monthly].every((x) => Number(x) > 0 && Number.isFinite(Number(x)));
}

const fieldCls =
  'rounded-xl border-navy/15 bg-navy/[0.03] px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function AdminPricing() {
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    const data = await fetchAllVehicles();
    setVehicles(data);
    setDrafts(Object.fromEntries(data.map((v) => [v.id, toDraft(v)])));
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(id: string, field: keyof Draft, value: string) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function save(v: VehicleRow) {
    const draft = drafts[v.id];
    if (!isValid(draft)) {
      toast.error('Rates must be positive numbers');
      return;
    }
    setSavingId(v.id);
    try {
      await updateVehiclePrices(v.id, { daily: Number(draft.daily), weekly: Number(draft.weekly), monthly: Number(draft.monthly) });
      toast.success(`${v.name} rates updated — now live on the site`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save rates');
    } finally {
      setSavingId(null);
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
        title="Pricing"
        subtitle="Daily, weekly and monthly rates per vehicle — changes apply immediately on the public site."
      />

      <div className="mt-6 overflow-x-auto rounded-3xl border border-navy/8 dark:border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs font-bold uppercase tracking-wider text-muted-foreground dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Daily (USD/day)</th>
              <th className="px-4 py-3">Weekly (USD/day, 7–29 days)</th>
              <th className="px-4 py-3">Monthly (USD/day, 30+ days)</th>
              <th className="px-4 py-3 text-right">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/8 dark:divide-white/10">
            {vehicles.map((v) => {
              const draft = drafts[v.id];
              if (!draft) return null;
              const dirty = isDirty(draft, v);
              return (
                <tr key={v.id} className="transition-colors hover:bg-navy/[0.02] dark:hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={v.image} alt={v.name} className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-navy dark:text-white">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.category_label} · currently {formatUSD(v.daily)}/day</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" min="0" step="1" value={draft.daily} onChange={(e) => updateField(v.id, 'daily', e.target.value)} className={cn(fieldCls, 'w-24')} />
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" min="0" step="1" value={draft.weekly} onChange={(e) => updateField(v.id, 'weekly', e.target.value)} className={cn(fieldCls, 'w-24')} />
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" min="0" step="1" value={draft.monthly} onChange={(e) => updateField(v.id, 'monthly', e.target.value)} className={cn(fieldCls, 'w-24')} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => save(v)}
                      disabled={!dirty || savingId === v.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                        dirty ? 'bg-brand-orange text-white hover:bg-brand-orange-dark' : 'bg-navy/10 text-muted-foreground dark:bg-white/10'
                      )}
                    >
                      {savingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
