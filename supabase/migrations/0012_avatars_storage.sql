-- ============================================================
-- Storage para avatares de perfil.
-- Bucket público (lectura por CDN). Cada usuario solo puede escribir su propia
-- carpeta: avatars/<user_id>/...
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars lectura pública" on storage.objects;
create policy "avatars lectura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars subir propio" on storage.objects;
create policy "avatars subir propio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars actualizar propio" on storage.objects;
create policy "avatars actualizar propio"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars borrar propio" on storage.objects;
create policy "avatars borrar propio"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
