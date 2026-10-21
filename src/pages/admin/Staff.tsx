import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Input } from '@/components/ui/input';
import { createAdminUser, listAdmins, type AdminUser } from '@/lib/admin';
import { useAdminSession } from '@/hooks/useAdminSession';

const fieldCls =
  'mt-1 rounded-xl border-navy/15 bg-navy/[0.03] text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function AdminStaff() {
  const { session } = useAdminSession();
  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const result = await listAdmins();
      setAdmins(Array.isArray(result) ? result : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load admin list');
      setAdmins([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return toast.error('Enter an email address');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords don’t match');

    setSubmitting(true);
    try {
      await createAdminUser(trimmedEmail, password);
      toast.success(`${trimmedEmail} can now sign in to the admin console`);
      setEmail('');
      setPassword('');
      setConfirm('');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create admin');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Staff" subtitle="Admin accounts that can sign in to this console." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-navy/8 bg-card p-6 dark:border-white/10">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-navy dark:text-white">
            <UserPlus className="h-4 w-4" /> Add an admin
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            They can sign in immediately at /admin/login with the email and password you set here.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nhanho.co.zw" className={fieldCls} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={fieldCls} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Confirm password</span>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldCls} />
            </label>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-orange disabled:opacity-60 dark:bg-white dark:text-navy"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create admin account
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-navy/8 bg-card dark:border-white/10">
          <div className="border-b border-navy/8 px-6 py-4 dark:border-white/10">
            <h2 className="font-display text-sm font-bold text-navy dark:text-white">Current admins</h2>
          </div>
          {admins === null ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted-foreground">No admins found.</p>
          ) : (
            <ul className="divide-y divide-navy/8 dark:divide-white/10">
              {admins.map((a) => (
                <li key={a.user_id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy dark:text-white">{a.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        {a.user_id === session?.user.id && ' · you'}
                      </p>
                    </div>
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
