"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { savePredictionSchema } from "@/lib/validation/prediction";
import { isPredictionEditable } from "@/lib/config";

export type SavePredictionState = { error: string | null };

/**
 * Guarda (o edita) el pronóstico del usuario para un partido.
 * Valida con Zod y, sobre todo, **revalida el cierre en el backend** (no se
 * confía en el front; RLS es la barrera final en la BD).
 */
export async function savePrediction(
  _prev: SavePredictionState,
  formData: FormData,
): Promise<SavePredictionState> {
  const parsed = savePredictionSchema.safeParse({
    matchId: formData.get("matchId"),
    predHome: formData.get("predHome"),
    predAway: formData.get("predAway"),
    winnerTeamId: formData.get("winnerTeamId"),
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const { matchId, predHome, predAway, winnerTeamId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada. Volvé a ingresar." };

  const { data: match } = await supabase
    .from("matches")
    .select("id, kickoff_at, status, group_id, home_team_id, away_team_id")
    .eq("id", matchId)
    .single();
  if (!match) return { error: "Partido no encontrado." };

  if (!match.home_team_id || !match.away_team_id) {
    return { error: "Todavía no están definidos los equipos de este partido." };
  }

  if (match.status !== "scheduled" || !isPredictionEditable(new Date(match.kickoff_at))) {
    return { error: "La carga de este partido está cerrada." };
  }

  // En eliminación (sin grupo) y empate, exigir quién pasa.
  const isKnockout = match.group_id === null;
  let winner: string | null = null;
  if (isKnockout && predHome === predAway) {
    if (
      !winnerTeamId ||
      (winnerTeamId !== match.home_team_id && winnerTeamId !== match.away_team_id)
    ) {
      return { error: "En eliminación, elegí quién pasa en caso de empate." };
    }
    winner = winnerTeamId;
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      pred_home_score: predHome,
      pred_away_score: predAway,
      pred_winner_team_id: winner,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,match_id" },
  );

  if (error) return { error: "No se pudo guardar el pronóstico." };

  revalidatePath("/cargar");
  redirect("/cargar");
}
