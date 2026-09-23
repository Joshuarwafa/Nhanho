# Database setup

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
   - Creates `vehicles`, `bookings`, `customers`, `vehicle_status_log`, `admins`.
   - Turns on Row Level Security with policies for guest checkout, own-booking access, and an admin allow-list.
   - Seeds `vehicles` with the current fleet.
3. Re-running the script later is safe — every statement is idempotent.

## Making yourself an admin

The `admins` table is an allow-list — being in it is what unlocks the future admin dashboard (approve/decline bookings, fleet status, exports).

1. In the Supabase dashboard: **Authentication → Users → Add user**, create an account with your own email (this is separate from the site's future customer login).
2. Copy that user's **UID** from the Users table.
3. In the SQL Editor, run:
   ```sql
   insert into public.admins (user_id) values ('paste-your-uid-here');
   ```

No admin UI exists yet — this just reserves your account for when it does.
