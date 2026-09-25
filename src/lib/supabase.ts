import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Deliberately not thrown here: a top-level throw in this module would crash the
  // entire app before React even mounts (no error boundary can catch it), producing a
  // blank white screen with no clue why. main.tsx checks isSupabaseConfigured up front
  // and shows a real diagnostic message instead of rendering the app in that case.
  console.error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (locally in .env.local, or in your host\'s project environment variables for a deployed build).'
  );
}

export const supabase = createClient<Database>(url || 'https://placeholder.supabase.co', anonKey || 'placeholder');
