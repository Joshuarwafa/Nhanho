import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { signInAdmin } from '@/lib/auth';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useNoIndex } from '@/hooks/useNoIndex';

const inputCls =
  'w-full rounded-2xl border border-navy/15 bg-navy/[0.03] px-4 py-3 pl-11 text-sm text-navy outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/25 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function AdminLogin() {
  useNoIndex();
  const navigate = useNavigate();
  const { loading, session, isAdmin } = useAdminSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session && isAdmin) return <Navigate to="/admin" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist px-4 dark:bg-navy-deep">
      <div className="w-full max-w-sm rounded-3xl border border-navy/8 bg-card p-8 shadow-xl shadow-navy/5 dark:border-white/10">
        <img src="/images/logo.png" alt="Nhanho Mobility" className="h-12 w-auto" />
        <h1 className="mt-5 font-display text-xl font-bold text-navy dark:text-white">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Staff access only.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="you@nhanhomobility.co.zw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-3 font-display text-sm font-bold text-white transition-colors hover:bg-brand-orange disabled:opacity-60'
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
