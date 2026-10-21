import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, History, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createVehicle, deleteVehicle, fetchAllVehicles, fetchStatusLog, setVehicleStatus, uploadVehiclePhoto } from '@/lib/admin';
import { useAdminSession } from '@/hooks/useAdminSession';
import { CATEGORIES } from '@/data/fleet';
import type { VehicleRow, VehicleStatus, VehicleStatusLogRow } from '@/types/database';

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

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

const fieldCls =
  'mt-1 rounded-xl border-navy/15 bg-navy/[0.03] text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';
const selectCls =
  'mt-1 w-full cursor-pointer rounded-xl border border-navy/15 bg-navy/[0.03] px-3 py-2 text-sm text-navy outline-none focus:border-brand-orange dark:border-white/15 dark:bg-white/5 dark:text-white [&>option]:text-navy';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const EMPTY_FORM = {
  name: '',
  categoryId: CATEGORIES[0].id,
  seats: '5',
  bags: '2',
  year: String(new Date().getFullYear()),
  transmission: 'Automatic' as 'Automatic' | 'Manual',
  fuel: 'Petrol' as 'Petrol' | 'Diesel' | 'Hybrid',
  daily: '',
  weekly: '',
  monthly: '',
  features: '',
  popular: false,
};

function AddVehicleDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setForm(EMPTY_FORM);
    setPhoto(null);
    setPhotoPreview(null);
  }

  function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function submit() {
    const name = form.name.trim();
    const daily = Number(form.daily);
    const weekly = Number(form.weekly);
    const monthly = Number(form.monthly);
    const seats = Number(form.seats);
    const bags = Number(form.bags);
    const year = Number(form.year);

    if (!name) return toast.error('Enter a model name');
    if (!photo) return toast.error('Add a photo');
    if (!daily || daily <= 0) return toast.error('Enter a valid daily rate');
    if (!weekly || weekly <= 0) return toast.error('Enter a valid weekly rate');
    if (!monthly || monthly <= 0) return toast.error('Enter a valid monthly rate');

    const id = slugify(name);
    if (!id) return toast.error('That name needs at least one letter or number');

    setSubmitting(true);
    try {
      const image = await uploadVehiclePhoto(photo);
      const category = CATEGORIES.find((c) => c.id === form.categoryId)!;
      await createVehicle({
        id,
        name,
        category: category.id,
        category_label: category.label,
        image,
        seats,
        bags,
        transmission: form.transmission,
        fuel: form.fuel,
        year,
        daily,
        weekly,
        monthly,
        features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
        popular: form.popular,
      });
      toast.success(`${name} added to the fleet`);
      setOpen(false);
      reset();
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add vehicle';
      toast.error(msg.includes('duplicate key') ? 'A vehicle with that name already exists' : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-orange dark:bg-white dark:text-navy"
      >
        <Plus className="h-4 w-4" /> Add vehicle
      </button>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a vehicle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
          {photoPreview ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={photoPreview} alt="" className="aspect-[3/2] w-full object-cover" />
              <button
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 text-muted-foreground transition-colors hover:border-brand-orange hover:text-brand-orange dark:border-white/20"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">Click to add a photo</span>
            </button>
          )}

          <Field label="Model name">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Toyota Hilux" className={fieldCls} />
          </Field>

          <Field label="Category">
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className={selectCls}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Seats">
              <Input type="number" min="1" value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))} className={fieldCls} />
            </Field>
            <Field label="Bags">
              <Input type="number" min="0" value={form.bags} onChange={(e) => setForm((f) => ({ ...f, bags: e.target.value }))} className={fieldCls} />
            </Field>
            <Field label="Year">
              <Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={fieldCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Transmission">
              <select value={form.transmission} onChange={(e) => setForm((f) => ({ ...f, transmission: e.target.value as typeof f.transmission }))} className={selectCls}>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </Field>
            <Field label="Fuel">
              <select value={form.fuel} onChange={(e) => setForm((f) => ({ ...f, fuel: e.target.value as typeof f.fuel }))} className={selectCls}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Daily (USD)">
              <Input type="number" min="0" step="0.01" value={form.daily} onChange={(e) => setForm((f) => ({ ...f, daily: e.target.value }))} className={fieldCls} />
            </Field>
            <Field label="Weekly/day">
              <Input type="number" min="0" step="0.01" value={form.weekly} onChange={(e) => setForm((f) => ({ ...f, weekly: e.target.value }))} className={fieldCls} />
            </Field>
            <Field label="Monthly/day">
              <Input type="number" min="0" step="0.01" value={form.monthly} onChange={(e) => setForm((f) => ({ ...f, monthly: e.target.value }))} className={fieldCls} />
            </Field>
          </div>

          <Field label="Features (comma-separated)">
            <Input value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} placeholder="Air conditioning, Bluetooth audio, …" className={fieldCls} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-navy dark:text-white">
            <input type="checkbox" checked={form.popular} onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))} className="h-4 w-4 rounded accent-brand-orange" />
            Mark as popular
          </label>
        </div>

        <DialogFooter>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-orange disabled:opacity-60 dark:bg-white dark:text-navy"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add vehicle
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFleet() {
  const { session } = useAdminSession();
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  async function removeVehicle(v: VehicleRow) {
    setBusyId(v.id);
    try {
      await deleteVehicle(v.id);
      toast.success(`${v.name} removed from the fleet`);
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not remove vehicle';
      toast.error(
        msg.toLowerCase().includes('foreign key')
          ? `${v.name} has existing bookings and can't be deleted — mark it "out of service" instead`
          : msg
      );
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
        actions={<AddVehicleDialog onCreated={load} />}
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
                  <button
                    onClick={() => setConfirmDeleteId(v.id)}
                    className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>

                {confirmDeleteId === v.id && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-red-500/10 px-4 py-2.5">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">Remove {v.name} permanently?</p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-full px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-navy/5 dark:hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => removeVehicle(v)}
                        disabled={busyId === v.id}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Yes, remove
                      </button>
                    </div>
                  </div>
                )}
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
