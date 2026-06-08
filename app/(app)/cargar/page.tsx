import { createClient } from "@/lib/supabase/server";
import { getCargarMatches } from "@/lib/queries/cargar";
import { isPredictionEditable } from "@/lib/config";
import { CargarList } from "@/components/cargar/CargarList";

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
