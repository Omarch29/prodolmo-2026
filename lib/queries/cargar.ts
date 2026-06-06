import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { toTeam, type TeamLite } from "@/lib/queries/dashboard";

type MatchStatus = Database["public"]["Enums"]["match_status"];

export type CargarMatch = {
  id: string;
  kickoffAt: string;
  status: MatchStatus;
  isKnockout: boolean;
  stageName: string;
  matchday: number | null;
  home: TeamLite;
  away: TeamLite;
  myPred: { home: number; away: number } | null;
};

const MATCH_SELECT = `id, kickoff_at, status, group_id, matchday,
  stage:stages(name),
  home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
  away_team:teams!matches_away_team_id_fkey(name, code, flag_url)`;

/** Fixture cargable: partidos por jugar / en curso, con mi pronóstico. */
export async function getCargarMatches(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CargarMatch[]> {
  const [{ data: matches }, { data: preds }] = await Promise.all([
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .in("status", ["scheduled", "in_progress"])
      .order("kickoff_at", { ascending: true }),
    supabase
      .from("predictions")
      .select("match_id, pred_home_score, pred_away_score")
      .eq("user_id", userId),
  ]);

  const predMap = new Map(
    (preds ?? []).map((p) => [p.match_id, { home: p.pred_home_score, away: p.pred_away_score }]),
  );

  return (matches ?? []).map((m) => ({
    id: m.id,
    kickoffAt: m.kickoff_at,
    status: m.status,
    isKnockout: m.group_id === null,
    stageName: m.stage?.name ?? "",
    matchday: m.matchday,
    home: toTeam(m.home_team),
    away: toTeam(m.away_team),
    myPred: predMap.get(m.id) ?? null,
  }));
}

export type MatchDetail = {
  id: string;
  kickoffAt: string;
  status: MatchStatus;
  isKnockout: boolean;
  stageName: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  home: TeamLite;
  away: TeamLite;
  homeScore: number | null;
  awayScore: number | null;
  aiPreview: string | null;
  myPred: { home: number; away: number; winnerTeamId: string | null } | null;
};

/** Datos de un partido para cargar/ver el pronóstico propio. */
export async function getMatchForPrediction(
  supabase: SupabaseClient<Database>,
  userId: string,
  matchId: string,
): Promise<MatchDetail | null> {
  const { data: m } = await supabase
    .from("matches")
    .select(
      `id, kickoff_at, status, group_id, home_team_id, away_team_id, home_score, away_score, ai_preview,
       stage:stages(name),
       home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
       away_team:teams!matches_away_team_id_fkey(name, code, flag_url)`,
    )
    .eq("id", matchId)
    .single();
  if (!m) return null;

  const { data: pred } = await supabase
    .from("predictions")
    .select("pred_home_score, pred_away_score, pred_winner_team_id")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();

  return {
    id: m.id,
    kickoffAt: m.kickoff_at,
    status: m.status,
    isKnockout: m.group_id === null,
    stageName: m.stage?.name ?? "",
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    home: toTeam(m.home_team),
    away: toTeam(m.away_team),
    homeScore: m.home_score,
    awayScore: m.away_score,
    aiPreview: m.ai_preview,
    myPred: pred
      ? {
          home: pred.pred_home_score,
          away: pred.pred_away_score,
          winnerTeamId: pred.pred_winner_team_id,
        }
      : null,
  };
}

export type FriendPick = {
  displayName: string;
  home: number;
  away: number;
  points: number | null;
};

/**
 * Pronósticos del resto del grupo para un partido.
 * RLS solo los devuelve si el partido ya es visible (kickoff − 1h); por eso se
 * llama únicamente cuando corresponde.
 */
export async function getFriendPicks(
  supabase: SupabaseClient<Database>,
  userId: string,
  matchId: string,
): Promise<FriendPick[]> {
  const { data } = await supabase
    .from("predictions")
    .select("pred_home_score, pred_away_score, points_earned, profile:profiles(display_name)")
    .eq("match_id", matchId)
    .neq("user_id", userId);

  return (data ?? []).map((p) => ({
    displayName: p.profile?.display_name ?? "?",
    home: p.pred_home_score,
    away: p.pred_away_score,
    points: p.points_earned,
  }));
}
