-- ============================================================
-- Auto-creación de profiles al crear un usuario en auth.users.
-- Toma display_name/username/timezone de raw_user_meta_data
-- (los pasa scripts/seed-users.ts al crear cada usuario).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, timezone, es_bot)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'timezone', 'America/Argentina/Buenos_Aires'),
    coalesce((new.raw_user_meta_data ->> 'es_bot')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
