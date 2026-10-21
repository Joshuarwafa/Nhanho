-- ============================================================================
-- Storage bucket for admin-uploaded vehicle photos (adding/editing fleet
-- vehicles from the admin UI). Existing vehicles keep using their bundled
-- /images/*.jpg paths — this is only for new uploads going forward.
-- Run this after 004_update_fleet_photos.sql.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

-- anyone can view vehicle photos (the public fleet catalogue needs this)
drop policy if exists "vehicle_photos_read_all" on storage.objects;
create policy "vehicle_photos_read_all" on storage.objects for select
  using (bucket_id = 'vehicle-photos');

-- only admins can upload/replace/remove vehicle photos
drop policy if exists "vehicle_photos_insert_admin" on storage.objects;
create policy "vehicle_photos_insert_admin" on storage.objects for insert
  with check (bucket_id = 'vehicle-photos' and is_admin());

drop policy if exists "vehicle_photos_update_admin" on storage.objects;
create policy "vehicle_photos_update_admin" on storage.objects for update
  using (bucket_id = 'vehicle-photos' and is_admin())
  with check (bucket_id = 'vehicle-photos' and is_admin());

drop policy if exists "vehicle_photos_delete_admin" on storage.objects;
create policy "vehicle_photos_delete_admin" on storage.objects for delete
  using (bucket_id = 'vehicle-photos' and is_admin());
