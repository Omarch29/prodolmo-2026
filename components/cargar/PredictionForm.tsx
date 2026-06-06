"use client";

import { useActionState, useState } from "react";
import { savePrediction, type SavePredictionState } from "@/actions/predictions";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TeamLite } from "@/lib/queries/dashboard";

const initialState: SavePredictionState = { error: null };

export function PredictionForm({
  matchId,
  home,
  away,
  homeTeamId,
  awayTeamId,
  isKnockout,
  initial,
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  homeTeamId: string | null;
  awayTeamId: string | null;
  isKnockout: boolean;
  initial: { home: number; away: number; winnerTeamId: string | null } | null;
}) {
  const [h, setH] = useState(initial?.home ?? 0);
  const [a, setA] = useState(initial?.away ?? 0);
  const [winner, setWinner] = useState(initial?.winnerTeamId ?? "");
  const [state, action, pending] = useActionState(savePrediction, initialState);

  const tie = isKnockout && h === a;

  return (
    <form action={action} className="flex flex-col gap-4 px-4">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="predHome" value={h} />
      <input type="hidden" name="predAway" value={a} />
      {tie && <input type="hidden" name="winnerTeamId" value={winner} />}

      <div className="flex items-center justify-center gap-4">
        <Stepper value={h} onChange={setH} />
        <span className="font-display text-line-white text-xl">-</span>
        <Stepper value={a} onChange={setA} />
      </div>

      {tie && (
        <div className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-3">
          <div className="font-display text-[8px] tracking-[1px] text-goal-orange mb-2">
            ⚠ EMPATE — ¿QUIÉN PASA DE RONDA?
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: homeTeamId, t: home },
              { id: awayTeamId, t: away },
            ].map(({ id, t }) => (
              <button
                key={t.code}
                type="button"
                onClick={() => id && setWinner(id)}
                className={cn(
                  "font-display text-[9px] border-pixel px-2 py-2 flex items-center justify-center gap-1.5",
                  winner && winner === id
                    ? "bg-pitch-green text-ink"
                    : "bg-scoreboard-slate text-line-white",
                )}
              >
                <span className="text-base">{t.flag ?? "⚽"}</span> {t.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.error && (
        <p className="font-body text-sm text-card-red bg-scoreboard-slate border-pixel px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" block disabled={pending}>
        {pending ? "Guardando..." : "⚽ Guardar pronóstico"}
      </Button>
    </form>
  );
}
