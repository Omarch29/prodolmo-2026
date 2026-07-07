import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { resolveFinalMatch, championFromFinal, type FinalMatch } from "@/lib/champion/final";

/** Puntos por acertar el campeón del Mundial. */
export const CHAMPION_BONUS = 20;

export type TeamOption = { id: string; code: string; name: string; flag: string | null };

/** Todas las selecciones, ordenadas por nombre (para el selector de campeón). */
export async function getTeamsList(supabase: SupabaseClient<Database>): Promise<TeamOption[]> {
  const { data } = await supabase
    .from("teams")
    .select("id, code, name, flag_url")
    .order("name", { ascending: true });
  return (data ?? []).map((t) => ({ id: t.id, code: t.code, name: t.name, flag: t.flag_url }));
}

/** Inicio del Mundial = kickoff del primer partido. null si no hay fixture. */
export async function getTournamentStart(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select("kickoff_at")
    .order("kickoff_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.kickoff_at ?? null;
}

/**
 * Campeón real = ganador de LA final (kickoff más tardío de la última etapa),
 * solo si ya terminó. La etapa 6 incluye el 3er puesto: mirar "el último
 * terminado" coronaba mal durante el día entre ambos partidos.
 */
export async function getActualChampion(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select(
      "home_team_id, away_team_id, home_score, away_score, decided_winner_team_id, kickoff_at, status, stage:stages!inner(sort_order)",
    )
    .eq("stage.sort_order", 6);

  const matches: FinalMatch[] = (data ?? []).map((m) => ({
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    homeScore: m.home_score,
    awayScore: m.away_score,
    decidedWinnerTeamId: m.decided_winner_team_id,
    kickoffAt: m.kickoff_at,
    status: m.status,
  }));
  return championFromFinal(resolveFinalMatch(matches));
}

/**
 * ¿Se puede elegir/cambiar el campeón? Sí mientras el Mundial no haya arrancado
 * (kickoff del primer partido). Se puede modificar las veces que se quiera hasta
 * ese momento; una vez arrancado queda fijo.
 */
export function isChampionEditable(
  tournamentStart: string | null,
  now: Date = new Date(),
): boolean {
  if (!tournamentStart) return true;
  return now.getTime() < new Date(tournamentStart).getTime();
}
