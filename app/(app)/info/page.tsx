import { createClient } from "@/lib/supabase/server";
import { CHAMPION_BONUS } from "@/lib/queries/champion";
import { PREDICTION_LOCK_HOURS } from "@/lib/config";

export default async function InfoPage() {
  const supabase = await createClient();
  const { data: stages } = await supabase
    .from("stages")
    .select("name, sort_order, points_outcome, points_exact")
    .order("sort_order", { ascending: true });

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <header className="flex items-center gap-2 bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm">ℹ️ INFO · CÓMO SE PUNTÚA</span>
      </header>

      <div className="flex flex-col gap-5 py-5">
        {/* Puntaje base */}
        <section className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-4 flex flex-col gap-3">
          <div className="font-display text-[10px] tracking-[1px] text-line-white">⚽ POR CADA PARTIDO</div>
          <p className="font-body text-sm text-grey-300">
            Pronosticás el marcador. El puntaje base de un partido es{" "}
            <strong className="text-line-white">0, 1 o 3</strong> — nunca se suman entre sí:
          </p>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2 font-body text-sm text-line-white">
              <span className="font-display text-[9px] border-pixel px-2 py-1 bg-scoreboard-slate text-grey-300">0</span>
              Errás el resultado.
            </li>
            <li className="flex items-center gap-2 font-body text-sm text-line-white">
              <span className="font-display text-[9px] border-pixel px-2 py-1 bg-card-yellow text-ink">1</span>
              Acertás quién gana (o el empate), pero no el marcador.
            </li>
            <li className="flex items-center gap-2 font-body text-sm text-line-white">
              <span className="font-display text-[9px] border-pixel px-2 py-1 bg-pitch-green-light text-ink">3</span>
              Acertás el <strong>marcador exacto</strong>.
            </li>
          </ul>
        </section>

        {/* Carga y visibilidad */}
        <section className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm p-4 flex flex-col gap-3">
          <div className="font-display text-[10px] tracking-[1px] text-line-white">🔒 CARGA Y VISIBILIDAD</div>

          {/* Alerta: cierre 1h antes */}
          <div className="flex items-start gap-2 bg-scoreboard-slate border-pixel border-l-[6px] border-l-goal-orange px-3 py-2">
            <span className="text-lg">⏰</span>
            <p className="font-body text-sm text-line-white">
              <strong>Cargá antes de que falte {PREDICTION_LOCK_HOURS} hora</strong> para el partido.
              A partir de ahí la carga se <strong>bloquea</strong>: ya no podés cargar ni editar tu
              pronóstico.
            </p>
          </div>

          <p className="font-body text-sm text-grey-300">
            Para que la competencia sea justa,{" "}
            <strong className="text-line-white">desde Octavos de final</strong> no vas a ver los
            pronósticos de los demás hasta que el partido se{" "}
            <strong className="text-line-white">bloquee</strong> ({PREDICTION_LOCK_HOURS} hora antes
            de empezar). En <strong className="text-line-white">Fase de grupos</strong> y{" "}
            <strong className="text-line-white">Ronda de 32</strong> se ven siempre.
          </p>
        </section>

        {/* Por ronda */}
        <section className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
          <div className="font-display text-[10px] tracking-[1px] text-line-white px-4 py-3 border-b-[3px] border-border">
            📈 CÓMO ESCALA POR RONDA
          </div>
          <p className="font-body text-sm text-grey-300 px-4 pt-3">
            El puntaje base se multiplica según la ronda: la eliminación pesa más y la definición
            queda abierta hasta el final.
          </p>
          <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-px bg-scoreboard-slate m-4 border-pixel">
            <div className="bg-scoreboard-ink font-display text-[7px] tracking-[1px] text-grey-300 px-2 py-2">RONDA</div>
            <div className="bg-scoreboard-ink font-display text-[7px] tracking-[1px] text-card-yellow px-2 py-2 text-center">ACIERTO</div>
            <div className="bg-scoreboard-ink font-display text-[7px] tracking-[1px] text-pitch-green-lighter px-2 py-2 text-center">EXACTO</div>
            {(stages ?? []).map((s) => (
              <FragmentRow
                key={s.sort_order}
                name={s.name}
                mult={s.points_outcome}
                outcome={s.points_outcome}
                exact={s.points_exact}
              />
            ))}
          </div>
          <p className="font-body text-xs text-grey-400 px-4 pb-3">
            El multiplicador va de <strong className="text-line-white">×1</strong> (grupos) a{" "}
            <strong className="text-line-white">×6</strong> (final y 3.º puesto).
          </p>
        </section>

        {/* Campeón */}
        <section className="mx-4 ds-pitch border-pixel-thick shadow-pixel p-4 flex items-center gap-3 outline outline-2 outline-dashed outline-card-yellow -outline-offset-4">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="font-display text-[10px] tracking-[1px] text-line-white">CAMPEÓN DEL MUNDIAL</div>
            <p className="font-body text-sm text-line-white mt-1">
              Si acertás quién sale campeón, sumás{" "}
              <strong className="font-mono text-card-yellow text-base">+{CHAMPION_BONUS}</strong> puntos. Se elige una
              sola vez, antes de que arranque el Mundial.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function FragmentRow({
  name,
  mult,
  outcome,
  exact,
}: {
  name: string;
  mult: number;
  outcome: number;
  exact: number;
}) {
  return (
    <>
      <div className="bg-scoreboard-black font-body text-sm text-line-white px-2 py-2">
        {name} <span className="text-grey-500 text-xs">×{mult}</span>
      </div>
      <div className="bg-scoreboard-black font-mono text-card-yellow text-lg text-center px-2 py-1">{outcome}</div>
      <div className="bg-scoreboard-black font-mono text-pitch-green-lighter text-lg text-center px-2 py-1">{exact}</div>
    </>
  );
}
