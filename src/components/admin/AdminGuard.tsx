import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useNoIndex } from '@/hooks/useNoIndex';
import AdminShell from './AdminShell';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin } = useAdminSession();
  useNoIndex();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-mist dark:bg-navy-deep">
        <Loader2 className="h-6 w-6 animate-spin text-navy dark:text-white" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brand-mist px-4 text-center dark:bg-navy-deep">
        <ShieldAlert className="h-10 w-10 text-brand-orange" />
        <p className="font-display text-lg font-bold text-navy dark:text-white">Not authorized</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This account is signed in but isn't on the Nhanho Mobility admin list. Contact an existing admin to be added.
        </p>
      </div>
    );
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
