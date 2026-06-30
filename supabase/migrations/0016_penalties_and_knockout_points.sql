-- ============================================================
-- Penales y puntaje de eliminación.
--
-- Problema: en eliminación, un partido que termina empatado en los 90'+alargue
-- se define por penales. football-data reporta `fullTime` INCLUYENDO los penales
-- (ej. Alemania-Paraguay: regularTime 1-1, fullTime 5-6), así que guardábamos
-- 5-6 como marcador y el puntaje salía mal.
--
-- Ahora:
--  - home_score/away_score guardan el marcador REAL de fútbol (90'+alargue), 1-1.
--  - home_penalties/away_penalties guardan la definición por penales (para mostrar).
--  - decided_winner_team_id (ya existía) = equipo que avanza.
--
-- Y el cálculo de puntos distingue grupos vs eliminación:
--  - Grupos: 1/X/2 por marcador (sign), como siempre.
--  - Eliminación: el "resultado" es QUIÉN AVANZA. Acertar quién avanza = acierto
--    de resultado; acertar quién avanza + marcador exacto = pleno; si no, 0.
-- ============================================================

alter table public.matches
  add column if not exists home_penalties int,
  add column if not exists away_penalties int;

create or replace function public.apply_match_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_winner uuid; -- equipo que avanza (solo eliminación)
begin
  if new.status = 'finished'
     and new.home_score is not null
     and new.away_score is not null
     and (
       tg_op = 'INSERT'
       or old.status     is distinct from new.status
       or old.home_score is distinct from new.home_score
       or old.away_score is distinct from new.away_score
       or old.decided_winner_team_id is distinct from new.decided_winner_team_id
     )
  then
    if new.group_id is null then
      -- ---- Eliminación: puntúa quién avanza ----
      actual_winner := case
        when new.home_score > new.away_score then new.home_team_id
        when new.away_score > new.home_score then new.away_team_id
        else new.decided_winner_team_id        -- empate definido por penales
      end;

      update public.predictions p
      set points_earned = case
        -- avance correcto + marcador exacto (90'+alargue) = PLENO
        when (case
                when p.pred_home_score > p.pred_away_score then new.home_team_id
                when p.pred_away_score > p.pred_home_score then new.away_team_id
                else p.pred_winner_team_id
              end) = actual_winner
         and p.pred_home_score = new.home_score
         and p.pred_away_score = new.away_score
          then s.points_exact
        -- avance correcto (pero no el marcador) = acierto de resultado
        when (case
                when p.pred_home_score > p.pred_away_score then new.home_team_id
                when p.pred_away_score > p.pred_home_score then new.away_team_id
                else p.pred_winner_team_id
              end) = actual_winner
          then s.points_outcome
        else 0
      end
      from public.stages s
      where p.match_id = new.id
        and s.id = new.stage_id;
    else
      -- ---- Grupos: 1/X/2 por marcador (sin cambios) ----
      update public.predictions p
      set points_earned = case
        when p.pred_home_score = new.home_score
         and p.pred_away_score = new.away_score
          then s.points_exact
        when sign(p.pred_home_score - p.pred_away_score)
           = sign(new.home_score - new.away_score)
          then s.points_outcome
        else 0
      end
      from public.stages s
      where p.match_id = new.id
        and s.id = new.stage_id;
    end if;
  end if;

  return new;
end;
$$;

-- El trigger (after insert or update) ya existe desde 0008; solo se reemplaza la función.

-- ============================================================
-- Recálculo único de los partidos YA finalizados con la lógica nueva.
-- (El trigger solo dispara al cambiar la fila; esto deja consistente lo
-- histórico al aplicar la migración.) Los partidos por penales recién tendrán
-- el marcador correcto tras el próximo sync, que los recalcula de nuevo.
-- ============================================================

-- Eliminación (group_id null): puntúa quién avanza.
update public.predictions p
set points_earned = case
  when (case
          when p.pred_home_score > p.pred_away_score then m.home_team_id
          when p.pred_away_score > p.pred_home_score then m.away_team_id
          else p.pred_winner_team_id
        end)
     = (case
          when m.home_score > m.away_score then m.home_team_id
          when m.away_score > m.home_score then m.away_team_id
          else m.decided_winner_team_id
        end)
   and p.pred_home_score = m.home_score
   and p.pred_away_score = m.away_score
    then s.points_exact
  when (case
          when p.pred_home_score > p.pred_away_score then m.home_team_id
          when p.pred_away_score > p.pred_home_score then m.away_team_id
          else p.pred_winner_team_id
        end)
     = (case
          when m.home_score > m.away_score then m.home_team_id
          when m.away_score > m.home_score then m.away_team_id
          else m.decided_winner_team_id
        end)
    then s.points_outcome
  else 0
end
from public.matches m
join public.stages s on s.id = m.stage_id
where p.match_id = m.id
  and m.status = 'finished'
  and m.home_score is not null
  and m.away_score is not null
  and m.group_id is null;

-- Grupos: 1/X/2 por marcador.
update public.predictions p
set points_earned = case
  when p.pred_home_score = m.home_score
   and p.pred_away_score = m.away_score
    then s.points_exact
  when sign(p.pred_home_score - p.pred_away_score)
     = sign(m.home_score - m.away_score)
    then s.points_outcome
  else 0
end
from public.matches m
join public.stages s on s.id = m.stage_id
where p.match_id = m.id
  and m.status = 'finished'
  and m.home_score is not null
  and m.away_score is not null
  and m.group_id is not null;
