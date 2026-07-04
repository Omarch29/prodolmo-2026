-- ============================================================
-- Quién ya cargó (sin revelar el pronóstico).
-- Desde Octavos los pronósticos ajenos son secretos hasta el cierre (RLS de
-- 0015), así que esta función security definer expone SOLO la existencia
-- (user_id + perfil) de quienes ya cargaron un partido. Nunca devuelve el
-- resultado ni el ganador elegido. Todas las columnas van calificadas y el
-- search_path vacío evita resolver nombres fuera de lo esperado.
-- ============================================================
create or replace function public.match_predictors(p_match_id uuid)
returns table (user_id uuid, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id, pr.display_name, pr.avatar_url
  from public.predictions p
  join public.profiles pr on pr.id = p.user_id
  where p.match_id = p_match_id
  order by pr.display_name;
$$;

revoke execute on function public.match_predictors(uuid) from public, anon;
grant execute on function public.match_predictors(uuid) to authenticated;
