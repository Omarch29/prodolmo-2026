import { createClient } from "@/lib/supabase/server";
import { getCargarMatches } from "@/lib/queries/cargar";
import { isPredictionEditable, PREDICTION_LOCK_HOURS } from "@/lib/config";
import { CargarList } from "@/components/cargar/CargarList";
import { DismissableNote } from "@/components/ui/DismissableNote";

export default async function CargarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const matches = await getCargarMatches(supabase, user.id);
  // Solo cuentan los que realmente se pueden cargar ahora: equipos definidos
  // (excluye 16avos/eliminación con cruces TBD) y aún editables.
  const pendientes = matches.filter(
    (m) =>
      m.playable &&
      m.status === "scheduled" &&
      isPredictionEditable(new Date(m.kickoffAt)) &&
      !m.myPred,
  ).length;

  return (
    <div className="md:max-w-2xl lg:max-w-4xl md:mx-auto">
      <header className="flex items-center justify-between bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm flex items-center gap-2">⚽ CARGAR</span>
        <span className="font-display text-[8px] tracking-[0.5px] border-pixel px-2 py-1 bg-goal-orange text-ink">
          {pendientes} SIN CARGAR
        </span>
      </header>

      <DismissableNote
        id="cargar-lock-rule"
        className="mx-4 mt-4 flex items-start gap-2 bg-scoreboard-slate border-pixel border-l-[6px] border-l-goal-orange px-3 py-2"
      >
        <span className="text-lg">⏰</span>
        <p className="font-body text-xs text-grey-300 flex-1">
          Cargá antes de que falte <strong className="text-line-white">{PREDICTION_LOCK_HOURS} hora</strong> para cada
          partido — después se <strong className="text-line-white">bloquea</strong>. Desde Octavos, los pronósticos del
          resto recién se ven al bloquearse el partido.
        </p>
      </DismissableNote>

      <div className="py-5">
        {matches.length === 0 ? (
          <div className="mx-4 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
            No hay partidos en el fixture. Sincronizá con <code>npm run sync:fixtures</code>.
          </div>
        ) : (
          <CargarList matches={matches} />
        )}
      </div>
    </div>
  );
}
