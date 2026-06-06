import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type PlayerKpis = {
  puntos: number;
  plenos: number;
  aciertos: number;
  cargados: number;
};

export type RoundBreakdown = {
  stageName: string;
  sortOrder: number;
  obtenidos: number;
  maximoPosible: number; // puntos si hubiera hecho pleno en cada partido finalizado
  porcentaje: number;
  pending: boolean; // la etapa todavía no tiene partidos finalizados
};

export type PlayerDetail = {
  userId: string;
  displayName: string;
  kpis: PlayerKpis;
  rounds: RoundBreakdown[];
  overallPct: number;
};

type PredRow = {
  points_earned: number | null;
  pred_home_score: number;
  pred_away_score: number;
  match: {
    home_score: number | null;
    away_score: number | null;
    stage: { id: string; name: string; sort_order: number; points_exact: number } | null;
  } | null;
};

/**
 * Detalle de un jugador (§5.5): KPIs + desglose de puntos por etapa.
 * El máximo por etapa = pleno en todos los partidos finalizados de esa etapa.
 */
export async function getPlayerDetail(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PlayerDetail | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null;

  // Todas las etapas (para mostrar también las que aún no se jugaron).
  const { data: stages } = await supabase
    .from("stages")
    .select("id, name, sort_order, points_exact")
    .order("sort_order", { ascending: true });

  // Predicciones del jugador en partidos finalizados.
  const { data: preds } = await supabase
    .from("predictions")
    .select(
      `points_earned, pred_home_score, pred_away_score,
       match:matches!inner(home_score, away_score,
         stage:stages(id, name, sort_order, points_exact))`,
    )
    .eq("user_id", userId)
    .eq("match.status", "finished");

  const rows = (preds ?? []) as PredRow[];

  const kpis: PlayerKpis = {
    puntos: 0,
    plenos: 0,
    aciertos: 0,
    cargados: rows.length,
  };

  // Acumuladores por etapa: puntos obtenidos y máximo posible.
  const byStage = new Map<string, { obtenidos: number; maximo: number }>();

  for (const r of rows) {
    const pts = r.points_earned ?? 0;
    kpis.puntos += pts;
    if (pts > 0) kpis.aciertos += 1;
    const match = r.match;
    const stage = match?.stage;
    if (
      match &&
      r.pred_home_score === match.home_score &&
      r.pred_away_score === match.away_score
    ) {
      kpis.plenos += 1;
    }
    if (stage) {
      const cur = byStage.get(stage.id) ?? { obtenidos: 0, maximo: 0 };
      cur.obtenidos += pts;
      cur.maximo += stage.points_exact;
      byStage.set(stage.id, cur);
    }
  }

  const rounds: RoundBreakdown[] = (stages ?? []).map((s) => {
    const agg = byStage.get(s.id);
    const obtenidos = agg?.obtenidos ?? 0;
    const maximoPosible = agg?.maximo ?? 0;
    const pending = maximoPosible === 0;
    return {
      stageName: s.name,
      sortOrder: s.sort_order,
      obtenidos,
      maximoPosible,
      porcentaje: pending ? 0 : Math.round((obtenidos / maximoPosible) * 100),
      pending,
    };
  });

  const playedRounds = rounds.filter((r) => !r.pending);
  const totalGot = playedRounds.reduce((s, r) => s + r.obtenidos, 0);
  const totalMax = playedRounds.reduce((s, r) => s + r.maximoPosible, 0);

  return {
    userId: profile.id,
    displayName: profile.display_name,
    kpis,
    rounds,
    overallPct: totalMax ? Math.round((totalGot / totalMax) * 100) : 0,
  };
}
