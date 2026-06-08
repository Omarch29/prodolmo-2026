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
 * RLS permite leer pronósticos ajenos de partidos ya visibles (finalizados).
 */
export async function getStandings(
  supabase: SupabaseClient<Database>,
): Promise<StandingRow[]> {
  const [{ data: profiles }, { data: preds }, { data: ySnaps }, actualChampion] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, es_bot, champion_team_id"),
    supabase
      .from("predictions")
      .select(
        "user_id, points_earned, pred_home_score, pred_away_score, match:matches!inner(home_score, away_score, status)",
      )
      .eq("match.status", "finished"),
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

  for (const row of preds ?? []) {
    const cur = agg.get(row.user_id);
    if (!cur) continue; // pronóstico sin perfil (no debería ocurrir)
    const pts = row.points_earned ?? 0;
    cur.points += pts;
    if (pts > 0) cur.aciertos += 1;
    const match = row.match;
    if (
      match &&
      row.pred_home_score === match.home_score &&
      row.pred_away_score === match.away_score
    ) {
      cur.plenos += 1;
    }
  }

  return rankStandings([...agg.values()], posAyer);
}
