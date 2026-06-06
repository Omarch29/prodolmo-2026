import { createClient } from "@/lib/supabase/server";
import { getCargarMatches } from "@/lib/queries/cargar";
import { isPredictionEditable } from "@/lib/config";
import { MatchListRow } from "@/components/cargar/MatchListRow";

export default async function CargarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const matches = await getCargarMatches(supabase, user.id);
  const pendientes = matches.filter(
    (m) => m.status === "scheduled" && isPredictionEditable(new Date(m.kickoffAt)) && !m.myPred,
  ).length;

  return (
    <div>
      <header className="flex items-center justify-between bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm flex items-center gap-2">⚽ CARGAR</span>
        <span className="font-display text-[8px] tracking-[0.5px] border-pixel px-2 py-1 bg-goal-orange text-ink">
          {pendientes} SIN CARGAR
        </span>
      </header>

      <div className="flex flex-col gap-3 py-5">
        <div className="px-4 font-display text-[10px] tracking-[1px] text-line-white flex items-center justify-between">
          <span>🗓 PARTIDOS</span>
          <span className="text-grey-400 text-[8px]">{matches.length} EN TOTAL</span>
        </div>

        {matches.length === 0 ? (
          <div className="mx-4 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
            No hay partidos por jugar en el fixture.
          </div>
        ) : (
          matches.map((m) => <MatchListRow key={m.id} m={m} />)
        )}

        <p className="px-4 text-center font-body text-xs text-grey-400">
          Tocá un partido para cargar o editar tu pronóstico ▸
        </p>
      </div>
    </div>
  );
}
