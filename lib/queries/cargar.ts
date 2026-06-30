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
  playable: boolean; // ambos equipos definidos (no es un cruce "por definir")
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null; // definición por penales (eliminatorias)
  awayPenalties: number | null;
  myPred: { home: number; away: number } | null;
  myPoints: number | null;
};

const MATCH_SELECT = `id, kickoff_at, status, group_id, matchday, home_score, away_score,
  home_penalties, away_penalties,
  stage:stages(name),
  home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
  away_team:teams!matches_away_team_id_fkey(name, code, flag_url)`;

/** Fixture completo (por jugar, en curso y jugados) con mi pronóstico y puntos. */
export async function getCargarMatches(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CargarMatch[]> {
  const [{ data: matches }, { data: preds }] = await Promise.all([
    supabase.from("matches").select(MATCH_SELECT).order("kickoff_at", { ascending: true }),
    supabase
      .from("predictions")
      .select("match_id, pred_home_score, pred_away_score, points_earned")
      .eq("user_id", userId),
  ]);

  const predMap = new Map(
    (preds ?? []).map((p) => [
      p.match_id,
      { home: p.pred_home_score, away: p.pred_away_score, points: p.points_earned },
    ]),
  );

  return (matches ?? []).map((m) => {
    const pred = predMap.get(m.id);
    return {
      id: m.id,
      kickoffAt: m.kickoff_at,
      status: m.status,
      isKnockout: m.group_id === null,
      stageName: m.stage?.name ?? "",
      matchday: m.matchday,
      home: toTeam(m.home_team),
      away: toTeam(m.away_team),
      playable: !!m.home_team && !!m.away_team,
      homeScore: m.home_score,
      awayScore: m.away_score,
      homePenalties: m.home_penalties,
      awayPenalties: m.away_penalties,
      myPred: pred ? { home: pred.home, away: pred.away } : null,
      myPoints: pred?.points ?? null,
    };
  });
}

export type MatchDetail = {
  id: string;
  kickoffAt: string;
  status: MatchStatus;
  isKnockout: boolean;
  stageName: string;
  stageSortOrder: number;
  matchday: number | null;
  groupName: string | null;
  venue: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  home: TeamLite;
  away: TeamLite;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null; // definición por penales (eliminatorias)
  awayPenalties: number | null;
  decidedWinnerTeamId: string | null; // equipo que avanzó (penales)
  aiPreview: string | null;
  referees: MatchReferee[];
  myPred: { home: number; away: number; winnerTeamId: string | null } | null;
};

export type MatchReferee = { name: string; role: string | null; nationality: string | null };

/** Datos de un partido para cargar/ver el pronóstico propio. */
export async function getMatchForPrediction(
  supabase: SupabaseClient<Database>,
  userId: string,
  matchId: string,
): Promise<MatchDetail | null> {
  const { data: m } = await supabase
    .from("matches")
    .select(
      `id, kickoff_at, status, group_id, matchday, venue, home_team_id, away_team_id, home_score, away_score, home_penalties, away_penalties, decided_winner_team_id, ai_preview, referees,
       stage:stages(name, sort_order),
       group:groups(name),
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
    stageSortOrder: m.stage?.sort_order ?? 99,
    matchday: m.matchday,
    groupName: m.group?.name ?? null,
    venue: m.venue,
    homeTeamId: m.home_team_id,
    awayTeamId: m.away_team_id,
    home: toTeam(m.home_team),
    away: toTeam(m.away_team),
    homeScore: m.home_score,
    awayScore: m.away_score,
    homePenalties: m.home_penalties,
    awayPenalties: m.away_penalties,
    decidedWinnerTeamId: m.decided_winner_team_id,
    aiPreview: m.ai_preview,
    referees: (m.referees ?? []) as MatchReferee[],
    myPred: pred
      ? {
          home: pred.pred_home_score,
          away: pred.pred_away_score,
          winnerTeamId: pred.pred_winner_team_id,
        }
      : null,
  };
}

/**
 * id del partido siguiente por kickoff (para navegar al próximo desde el
 * detalle). Ordena por (kickoff, id) para resolver partidos simultáneos.
 */
export async function getNextMatchId(
  supabase: SupabaseClient<Database>,
  currentKickoffISO: string,
  currentMatchId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select("id, kickoff_at")
    .gte("kickoff_at", currentKickoffISO)
    .order("kickoff_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(16);
  const rows = data ?? [];
  const idx = rows.findIndex((r) => r.id === currentMatchId);
  return (idx === -1 ? rows[0]?.id : rows[idx + 1]?.id) ?? null;
}

/** id del partido anterior por kickoff (espejo de getNextMatchId). */
export async function getPrevMatchId(
  supabase: SupabaseClient<Database>,
  currentKickoffISO: string,
  currentMatchId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("matches")
    .select("id, kickoff_at")
    .lte("kickoff_at", currentKickoffISO)
    .order("kickoff_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(16);
  const rows = data ?? [];
  const idx = rows.findIndex((r) => r.id === currentMatchId);
  return (idx === -1 ? rows[0]?.id : rows[idx + 1]?.id) ?? null;
}

export type FriendPick = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  home: number;
  away: number;
  winnerTeamId: string | null; // quién pasa, si el pronóstico fue empate (eliminatorias)
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
    .select(
      "user_id, pred_home_score, pred_away_score, pred_winner_team_id, points_earned, profile:profiles(display_name, avatar_url)",
    )
    .eq("match_id", matchId)
    .neq("user_id", userId);

  return (data ?? []).map((p) => ({
    userId: p.user_id,
    displayName: p.profile?.display_name ?? "?",
    avatarUrl: p.profile?.avatar_url ?? null,
    home: p.pred_home_score,
    away: p.pred_away_score,
    winnerTeamId: p.pred_winner_team_id,
    points: p.points_earned,
  }));
}
