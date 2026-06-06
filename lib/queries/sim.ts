import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type BracketSlot = {
  slot: string;
  stageName: string;
  sortOrder: number;
  feedsSlot: string | null;
  feedsSide: "home" | "away" | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
};

export type TeamInfo = { id: string; code: string; name: string; flag: string | null };

function asSide(v: string | null): "home" | "away" | null {
  return v === "home" || v === "away" ? v : null;
}

/** Estructura del cuadro de eliminación (config data-driven). */
export async function getBracket(
  supabase: SupabaseClient<Database>,
): Promise<BracketSlot[]> {
  const { data } = await supabase
    .from("bracket_slots")
    .select("slot, sort_order, feeds_slot, feeds_side, home_team_id, away_team_id, stage:stages(name)")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((s) => ({
    slot: s.slot,
    stageName: s.stage?.name ?? "",
    sortOrder: s.sort_order,
    feedsSlot: s.feeds_slot,
    feedsSide: asSide(s.feeds_side),
    homeTeamId: s.home_team_id,
    awayTeamId: s.away_team_id,
  }));
}

/** Todas las selecciones, como mapa por id (para resolver los slots). */
export async function getTeamsMap(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, TeamInfo>> {
  const { data } = await supabase.from("teams").select("id, code, name, flag_url");
  const map: Record<string, TeamInfo> = {};
  for (const t of data ?? []) {
    map[t.id] = { id: t.id, code: t.code, name: t.name, flag: t.flag_url };
  }
  return map;
}

/** Simulación existente del usuario (la primera), o null. */
export async function getExistingSimulation(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from("simulations")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Igual que la anterior, pero crea una si no existe. */
export async function getOrCreateSimulation(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const existing = await getExistingSimulation(supabase, userId);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("simulations")
    .insert({ user_id: userId, name: "Mi simulación" })
    .select("id")
    .single();
  if (error || !data) throw new Error("No se pudo crear la simulación.");
  return data.id;
}

/** Picks de una simulación, como mapa slot -> teamId ganador. */
export async function getSimPicks(
  supabase: SupabaseClient<Database>,
  simId: string,
): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("simulation_picks")
    .select("bracket_slot, winner_team_id")
    .eq("simulation_id", simId);

  const map: Record<string, string> = {};
  for (const p of data ?? []) {
    if (p.bracket_slot) map[p.bracket_slot] = p.winner_team_id;
  }
  return map;
}
