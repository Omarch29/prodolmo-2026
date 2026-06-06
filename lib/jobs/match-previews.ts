import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { PreviewInput } from "@/lib/gemini/preview-prompt";

/** Horas hacia adelante para las que se generan previas. */
const HORIZON_HOURS = 48;

export type PreviewsResult = { generated: number };

/**
 * Genera previas (IA) para los partidos programados que arrancan dentro del
 * horizonte y aún no tienen una. Precomputado: el detalle solo lee ai_preview.
 */
export async function generateMatchPreviews(
  supabase: SupabaseClient<Database>,
  generate: (input: PreviewInput) => Promise<string>,
  now: Date = new Date(),
): Promise<PreviewsResult> {
  const horizon = new Date(now.getTime() + HORIZON_HOURS * 3_600_000).toISOString();

  const { data: matches } = await supabase
    .from("matches")
    .select(
      `id,
       stage:stages(name),
       group:groups(name),
       home_team:teams!matches_home_team_id_fkey(name),
       away_team:teams!matches_away_team_id_fkey(name)`,
    )
    .eq("status", "scheduled")
    .is("ai_preview", null)
    .gt("kickoff_at", now.toISOString())
    .lte("kickoff_at", horizon);

  let generated = 0;
  for (const m of matches ?? []) {
    if (!m.home_team || !m.away_team) continue;
    try {
      const text = await generate({
        home: m.home_team.name,
        away: m.away_team.name,
        stage: m.stage?.name ?? "",
        group: m.group?.name ?? null,
      });
      if (text) {
        await supabase.from("matches").update({ ai_preview: text }).eq("id", m.id);
        generated += 1;
      }
    } catch {
      // saltear este partido; se reintenta en la próxima corrida
    }
  }

  return { generated };
}
