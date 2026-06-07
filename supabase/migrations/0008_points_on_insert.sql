-- ============================================================
-- El sync puede INSERTAR un partido ya finalizado (primera corrida tras el
-- partido). El trigger de puntos era solo AFTER UPDATE; lo extendemos a
-- INSERT OR UPDATE para que también calcule en ese caso.
-- ============================================================
create or replace function public.apply_match_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'finished'
     and new.home_score is not null
     and new.away_score is not null
     and (
       tg_op = 'INSERT'
       or old.status     is distinct from new.status
       or old.home_score is distinct from new.home_score
       or old.away_score is distinct from new.away_score
     )
  then
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

  return new;
end;
$$;

drop trigger if exists trg_apply_match_points on public.matches;
create trigger trg_apply_match_points
after insert or update on public.matches
for each row execute function public.apply_match_points();
