import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

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

/** Campeón real = ganador de la final (último partido finalizado de la última etapa). */
export async function getActualChampion(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score, decided_winner_team_id, kickoff_at, stage:stages(sort_order)")
    .eq("status", "finished");

  const finals = (data ?? [])
    .filter((m) => m.stage?.sort_order === 6)
    .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime());
  const f = finals[0];
  if (!f) return null;
  if (f.home_score == null || f.away_score == null) return f.decided_winner_team_id ?? null;
  if (f.home_score > f.away_score) return f.home_team_id;
  if (f.away_score > f.home_score) return f.away_team_id;
  return f.decided_winner_team_id ?? null;
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
