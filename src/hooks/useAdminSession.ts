import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/auth';

interface AdminSessionState {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
}

export function useAdminSession() {
  const [state, setState] = useState<AdminSessionState>({ loading: true, session: null, isAdmin: false });

  useEffect(() => {
    let cancelled = false;

    async function resolve(session: Session | null) {
      if (!session) {
        if (!cancelled) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const admin = await checkIsAdmin(session.user.id);
      if (!cancelled) setState({ loading: false, session, isAdmin: admin });
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
