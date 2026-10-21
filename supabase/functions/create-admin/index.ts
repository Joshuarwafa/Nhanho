// Edge Function: create-admin
//
// Lets an existing admin create another admin account (email + password) without
// losing their own signed-in session — the client SDK's normal signUp() would log
// the caller out and into the new account instead. This runs server-side with the
// service-role key (never exposed to the browser) and uses the Supabase Admin API
// to create the user directly, then adds them to the `admins` allow-list.
//
// Deploy via the Supabase Dashboard: Edge Functions -> Create a new function ->
// name it "create-admin" -> paste this file -> Deploy. Then add the secret
// SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API -> service_role) under
// Edge Functions -> Secrets. SUPABASE_URL and SUPABASE_ANON_KEY are provided
// automatically and don't need to be set.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Not signed in' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Scoped to the caller's own JWT — only used to find out who's calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Not signed in' }, 401);

    // Privileged client — only this function ever holds the service-role key.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerAdminRow } = await adminClient
      .from('admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (!callerAdminRow) return json({ error: 'Admins only' }, 403);

    const body = await req.json().catch(() => ({}));

    if (body.action === 'list') {
      const { data: admins, error } = await adminClient
        .from('admins')
        .select('user_id, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;

      const withEmails = await Promise.all(
        (admins ?? []).map(async (a: { user_id: string; created_at: string }) => {
          const { data } = await adminClient.auth.admin.getUserById(a.user_id);
          return { user_id: a.user_id, email: data.user?.email ?? 'unknown', created_at: a.created_at };
        })
      );
      return json({ admins: withEmails });
    }

    if (body.action === 'create') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      if (!email) return json({ error: 'Enter an email address' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr) return json({ error: createErr.message }, 400);

      const { error: insertErr } = await adminClient.from('admins').insert({ user_id: created.user.id });
      if (insertErr) {
        // don't leave an orphaned auth account with no admin access
        await adminClient.auth.admin.deleteUser(created.user.id);
        return json({ error: insertErr.message }, 400);
      }

      return json({ ok: true, user_id: created.user.id, email });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
