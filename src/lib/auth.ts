import { supabase } from '@/lib/supabase';

export async function signInAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

/**
 * True only if this user id is in the `admins` allow-list. Relies on the
 * "admins_select_admin_only" RLS policy: a genuine admin can read the table
 * (the policy's is_admin() check passes for them), anyone else gets zero
 * rows back rather than an error.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return Boolean(data);
}
