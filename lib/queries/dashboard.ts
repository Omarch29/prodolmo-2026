import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type TeamLite = { name: string; code: string; flag: string | null };

export type NextMatch = {
  id: string;
  kickoffAt: string;
  stageName: string;
  matchday: number | null;
  home: TeamLite;
  away: TeamLite;
  alreadyPredicted: boolean;
};

const TBD: TeamLite = { name: "Por definir", code: "TBD", flag: null };

function toTeam(t: { name: string; code: string; flag_url: string | null } | null): TeamLite {
  if (!t) return TBD;
  return { name: t.name, code: t.code, flag: t.flag_url };
}

/**
 * Próximo partido que el usuario todavía no cargó (§5.2.A).
 * Si ya cargó todos los próximos, devuelve igual el más cercano (alreadyPredicted=true).
 */
export async function getNextMatch(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<NextMatch | null> {
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `id, kickoff_at, matchday,
       stage:stages(name),
       home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
       away_team:teams!matches_away_team_id_fkey(name, code, flag_url)`,
    )
    .eq("status", "scheduled")
    .gt("kickoff_at", new Date().toISOString())
    .order("kickoff_at", { ascending: true })
    .limit(20);

  if (!matches || matches.length === 0) return null;

  const { data: myPreds } = await supabase
    .from("predictions")
    .select("match_id")
    .eq("user_id", userId);
  const predicted = new Set((myPreds ?? []).map((p) => p.match_id));

  const next = matches.find((m) => !predicted.has(m.id)) ?? matches[0];
  if (!next) return null;

  return {
    id: next.id,
    kickoffAt: next.kickoff_at,
    stageName: next.stage?.name ?? "",
    matchday: next.matchday,
    home: toTeam(next.home_team),
    away: toTeam(next.away_team),
    alreadyPredicted: predicted.has(next.id),
  };
}

export type DailyMessage = {
  id: string;
  type: Database["public"]["Enums"]["daily_message_type"];
  body: string;
  priority: number;
};

/** Mensajes precomputados del día (§5.2.B / §6). */
export async function getDailyMessages(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DailyMessage[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("daily_messages")
    .select("id, type, body, priority")
    .eq("user_id", userId)
    .eq("message_date", today)
    .order("priority", { ascending: true });
  return data ?? [];
}
