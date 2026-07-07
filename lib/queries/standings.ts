import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { rankStandings, type StandingAggregate, type RankedStanding } from "@/lib/standings/rank";
import { getActualChampion, CHAMPION_BONUS } from "@/lib/queries/champion";

export type StandingRow = RankedStanding;

const APP_TZ = "America/Argentina/Buenos_Aires";

function yesterdayInTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(
    new Date(now.getTime() - 86_400_000),
  );
}

/**
 * Tabla de posiciones del grupo (§5.6).
 * Suma points_earned de partidos finalizados; desempata por plenos.
 * La agregación vive en la BD (RPC standings_aggregate): traer las
 * predicciones fila por fila chocaba con el max-rows=1000 de PostgREST,
 * que trunca en silencio y comía puntos.
 */
export async function getStandings(
  supabase: SupabaseClient<Database>,
): Promise<StandingRow[]> {
  const [{ data: profiles }, { data: totals }, { data: ySnaps }, actualChampion] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, es_bot, champion_team_id"),
    supabase.rpc("standings_aggregate"),
    supabase.from("standings_snapshots").select("user_id, posicion").eq("date", yesterdayInTz()),
    getActualChampion(supabase),
  ]);

  const posAyer = new Map((ySnaps ?? []).map((s) => [s.user_id, s.posicion]));

  // Acumular puntos/plenos/aciertos por usuario (+20 si acertó el campeón).
  const agg = new Map<string, StandingAggregate>();
  for (const p of profiles ?? []) {
    const championBonus = actualChampion && p.champion_team_id === actualChampion ? CHAMPION_BONUS : 0;
    agg.set(p.id, {
      userId: p.id,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      esBot: p.es_bot,
      points: championBonus,
      plenos: 0,
      aciertos: 0,
    });
  }

  for (const row of totals ?? []) {
    const cur = agg.get(row.user_id);
    if (!cur) continue; // pronóstico sin perfil (no debería ocurrir)
    cur.points += row.points;
    cur.aciertos = row.aciertos;
    cur.plenos = row.plenos;
  }

  return rankStandings([...agg.values()], posAyer);
}
