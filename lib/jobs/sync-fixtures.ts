import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { FootballDataClient } from "@/lib/integrations/football-data/client-core";
import {
  normalizeTeam,
  normalizeMatch,
  resolveMatchResult,
  resolveTeamId,
  type MatchResultState,
} from "@/lib/integrations/football-data/map";

export type SyncResult = { teams: number; matches: number; skipped: number };

type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];

/**
 * Sincroniza selecciones y fixture/resultados desde football-data.org hacia
 * nuestro esquema. Idempotente (upsert por external_id / code). Al pasar un
 * partido a finished con marcador, el trigger recalcula los puntos.
 *
 * `client` se inyecta para poder testear/mockear sin red.
 */
export async function syncFixtures(
  supabase: SupabaseClient<Database>,
  client: FootballDataClient,
): Promise<SyncResult> {
  // ---- 1. Selecciones ----
  const { teams } = await client.fetchTeams();
  const normTeams = teams.map(normalizeTeam);
  if (normTeams.length > 0) {
    await supabase.from("teams").upsert(
      normTeams.map((t) => ({
        external_id: t.externalId,
        name: t.name,
        code: t.code,
        flag_url: t.flagUrl,
      })),
      { onConflict: "code" }, // code es único: rellena external_id en los del seed
    );
  }

  // Mapas para resolver ids de nuestra BD + estado actual de los partidos.
  const [{ data: teamRows }, { data: stageRows }, { data: groupRows }, { data: matchRows }] =
    await Promise.all([
      supabase.from("teams").select("id, external_id"),
      supabase.from("stages").select("id, sort_order"),
      supabase.from("groups").select("id, name"),
      supabase
        .from("matches")
        .select("external_id, status, home_score, away_score, home_team_id, away_team_id"),
    ]);

  const teamByExternal = new Map<number, string>();
  for (const r of teamRows ?? []) if (r.external_id != null) teamByExternal.set(r.external_id, r.id);
  const stageBySort = new Map((stageRows ?? []).map((s) => [s.sort_order, s.id]));
  const groupByName = new Map((groupRows ?? []).map((g) => [g.name, g.id]));

  // Resultado ya guardado (para no pisar un marcador cargado a mano).
  const resultByExternal = new Map<number, MatchResultState>();
  // Equipos ya resueltos (para no degradar un cruce a "por definir" si la API
  // lo revierte a null mientras recalcula el cuadro).
  const teamsByExternal = new Map<number, { home: string | null; away: string | null }>();
  for (const r of matchRows ?? [])
    if (r.external_id != null) {
      resultByExternal.set(r.external_id, {
        status: r.status,
        homeScore: r.home_score,
        awayScore: r.away_score,
      });
      teamsByExternal.set(r.external_id, { home: r.home_team_id, away: r.away_team_id });
    }

  // ---- 2. Partidos ----
  const { matches } = await client.fetchMatches();
  let skipped = 0;
  const rows: MatchInsert[] = [];

  for (const m of matches) {
    const n = normalizeMatch(m);
    const stageId = n.stageSort != null ? stageBySort.get(n.stageSort) : undefined;
    if (!stageId) {
      skipped += 1; // etapa desconocida: no la cargamos
      continue;
    }
    // Guard: no degradar un partido ya finalizado con marcador (p. ej. cargado a mano).
    const result = resolveMatchResult(resultByExternal.get(n.externalId), {
      status: n.status,
      homeScore: n.homeScore,
      awayScore: n.awayScore,
    });
    // Guard: no degradar un cruce ya resuelto si la API lo revierte a "por definir".
    const existingTeams = teamsByExternal.get(n.externalId);
    const incomingHome =
      n.homeExternalId != null ? teamByExternal.get(n.homeExternalId) ?? null : null;
    const incomingAway =
      n.awayExternalId != null ? teamByExternal.get(n.awayExternalId) ?? null : null;
    rows.push({
      external_id: n.externalId,
      stage_id: stageId,
      matchday: n.matchday,
      group_id: n.groupLetter ? groupByName.get(n.groupLetter) ?? null : null,
      home_team_id: resolveTeamId(existingTeams?.home, incomingHome),
      away_team_id: resolveTeamId(existingTeams?.away, incomingAway),
      kickoff_at: n.kickoffAt,
      status: result.status,
      home_score: result.homeScore,
      away_score: result.awayScore,
      referees: n.referees,
    });
  }

  if (rows.length > 0) {
    await supabase.from("matches").upsert(rows, { onConflict: "external_id" });
  }

  return { teams: normTeams.length, matches: rows.length, skipped };
}
