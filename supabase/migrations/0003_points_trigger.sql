-- ============================================================
-- Cálculo de puntos (ver docs/Prode-Mundial-2026-Spec.md §3).
-- Al pasar un partido a 'finished' (con marcador cargado), se calculan
-- los puntos de TODOS los pronósticos de ese partido.
--
-- Puntaje base por partido: 0 / 1 / 3, multiplicado por la ronda
-- (ya viene resuelto en stages.points_outcome y stages.points_exact).
-- El CASE devuelve exact O outcome O 0 — nunca la suma.
-- ============================================================
create or replace function public.apply_match_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo recalcular cuando el partido queda finalizado con marcador,
  -- y algo relevante cambió (status o el marcador).
  if new.status = 'finished'
     and new.home_score is not null
     and new.away_score is not null
     and (
       old.status     is distinct from new.status
       or old.home_score is distinct from new.home_score
       or old.away_score is distinct from new.away_score
     )
  then
    update public.predictions p
    set points_earned = case
      when p.pred_home_score = new.home_score
       and p.pred_away_score = new.away_score
        then s.points_exact                                        -- PLENO
      when sign(p.pred_home_score - p.pred_away_score)
         = sign(new.home_score - new.away_score)
        then s.points_outcome                                      -- acertó resultado 1/X/2
      else 0
    end
    from public.stages s
    where p.match_id = new.id
      and s.id = new.stage_id;
  end if;

  return new;
end;
$$;

create trigger trg_apply_match_points
after update on public.matches
for each row execute function public.apply_match_points();
