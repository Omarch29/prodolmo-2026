-- ============================================================
-- Agregado de la tabla de posiciones en la BD.
-- getStandings traía TODAS las predicciones de partidos finalizados para
-- sumarlas en la app; al superar las 1000 filas (11 usuarios × ~94 partidos),
-- PostgREST corta en max-rows=1000 en silencio y la tabla pierde puntos
-- (Fernando 120 en vez de 126). Esta función devuelve una fila por usuario
-- ya agregada — inmune al tope y menos datos por render.
-- Mismas reglas que la app: puntos = sum(points_earned); pleno = marcador
-- exacto (los penales van aparte, no cuentan); acierto = fila con puntos.
-- ============================================================
create or replace function public.standings_aggregate()
returns table (user_id uuid, points bigint, plenos bigint, aciertos bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id,
         coalesce(sum(p.points_earned), 0)::bigint as points,
         (count(*) filter (
           where p.pred_home_score = m.home_score
             and p.pred_away_score = m.away_score
         ))::bigint as plenos,
         (count(*) filter (where coalesce(p.points_earned, 0) > 0))::bigint as aciertos
  from public.predictions p
  join public.matches m on m.id = p.match_id
  where m.status = 'finished'
  group by p.user_id;
$$;

revoke execute on function public.standings_aggregate() from public, anon;
grant execute on function public.standings_aggregate() to authenticated;
