import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { htmlToText } from "@/lib/sanitize";

export type TeamMini = { code: string; flag: string | null };

export type PredictionActivity = {
  matchId: string;
  kickoffAt: string;
  stageSortOrder: number;
  home: TeamMini;
  away: TeamMini;
  predHome: number;
  predAway: number;
  homeScore: number | null;
  awayScore: number | null;
  points: number | null;
  finished: boolean;
};

export type CommentActivity = {
  id: string;
  body: string;
  createdAt: string;
  matchId: string;
  home: TeamMini;
  away: TeamMini;
};

const team = (t: { code: string; flag_url: string | null } | null): TeamMini => ({
  code: t?.code ?? "?",
  flag: t?.flag_url ?? null,
});

/** Todos los pronósticos de un jugador, del partido más reciente al más viejo. */
export async function getPlayerPredictions(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PredictionActivity[]> {
  const { data } = await supabase
    .from("predictions")
    .select(
      `pred_home_score, pred_away_score, points_earned,
       match:matches!inner(id, kickoff_at, status, home_score, away_score,
         stage:stages(sort_order),
         home_team:teams!matches_home_team_id_fkey(code, flag_url),
         away_team:teams!matches_away_team_id_fkey(code, flag_url))`,
    )
    .eq("user_id", userId);

  return (data ?? [])
    .filter((p) => p.match)
    .map((p) => {
      const m = p.match!;
      return {
        matchId: m.id,
        kickoffAt: m.kickoff_at,
        stageSortOrder: m.stage?.sort_order ?? 99,
        home: team(m.home_team),
        away: team(m.away_team),
        predHome: p.pred_home_score,
        predAway: p.pred_away_score,
        homeScore: m.home_score,
        awayScore: m.away_score,
        points: p.points_earned,
        finished: m.status === "finished",
      };
    })
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());
}

/** Últimos comentarios de un jugador, con el partido al que pertenecen. */
export async function getPlayerComments(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 8,
): Promise<CommentActivity[]> {
  const { data } = await supabase
    .from("comments")
    .select(
      `id, body, created_at,
       match:matches(id,
         home_team:teams!matches_home_team_id_fkey(code, flag_url),
         away_team:teams!matches_away_team_id_fkey(code, flag_url))`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? [])
    .filter((c) => c.match)
    .map((c) => ({
      id: c.id,
      body: htmlToText(c.body), // preview en texto plano (el body es HTML)
      createdAt: c.created_at,
      matchId: c.match!.id,
      home: team(c.match!.home_team),
      away: team(c.match!.away_team),
    }));
}

export type RecentComment = {
  id: string;
  body: string;
  createdAt: string;
  matchId: string;
  authorId: string;
  author: string;
  avatarUrl: string | null;
  home: TeamMini;
  away: TeamMini;
};

/** Últimos comentarios de todo el grupo (para el feed del inicio). */
export async function getRecentComments(
  supabase: SupabaseClient<Database>,
  limit = 6,
): Promise<RecentComment[]> {
  const { data } = await supabase
    .from("comments")
    .select(
      `id, body, created_at, user_id,
       profile:profiles(display_name, avatar_url),
       match:matches(id,
         home_team:teams!matches_home_team_id_fkey(code, flag_url),
         away_team:teams!matches_away_team_id_fkey(code, flag_url))`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? [])
    .filter((c) => c.match)
    .map((c) => ({
      id: c.id,
      body: htmlToText(c.body),
      createdAt: c.created_at,
      matchId: c.match!.id,
      authorId: c.user_id,
      author: c.profile?.display_name ?? "?",
      avatarUrl: c.profile?.avatar_url ?? null,
      home: team(c.match!.home_team),
      away: team(c.match!.away_team),
    }));
}
