import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type StandingRow = {
  userId: string;
  displayName: string;
  points: number;
  plenos: number;
  aciertos: number;
  rank: number;
};

/**
 * Tabla de posiciones del grupo (§5.6).
 * Suma points_earned de partidos finalizados; desempata por plenos.
 * RLS permite leer pronósticos ajenos de partidos ya visibles (finalizados).
 */
export async function getStandings(
  supabase: SupabaseClient<Database>,
): Promise<StandingRow[]> {
  const [{ data: profiles }, { data: preds }] = await Promise.all([
    supabase.from("profiles").select("id, display_name"),
    supabase
      .from("predictions")
      .select(
        "user_id, points_earned, pred_home_score, pred_away_score, match:matches!inner(home_score, away_score, status)",
      )
      .eq("match.status", "finished"),
  ]);

  type Agg = { points: number; plenos: number; aciertos: number };
  const agg = new Map<string, Agg>();
  for (const p of profiles ?? []) {
    agg.set(p.id, { points: 0, plenos: 0, aciertos: 0 });
  }

  for (const row of preds ?? []) {
    const cur = agg.get(row.user_id) ?? { points: 0, plenos: 0, aciertos: 0 };
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
    agg.set(row.user_id, cur);
  }

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const rows = [...agg.entries()].map(([userId, v]) => ({
    userId,
    displayName: nameById.get(userId) ?? "?",
    ...v,
  }));

  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.plenos - a.plenos ||
      a.displayName.localeCompare(b.displayName),
  );

  // rank con empates (mismo puntos+plenos = misma posición)
  let rank = 0;
  let prevKey = "";
  return rows.map((r, i) => {
    const key = `${r.points}-${r.plenos}`;
    if (key !== prevKey) {
      rank = i + 1;
      prevKey = key;
    }
    return { ...r, rank };
  });
}
