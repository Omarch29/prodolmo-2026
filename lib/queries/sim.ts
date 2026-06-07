import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { emptyState, type SimState } from "@/lib/sim/wc2026";

export type TeamInfo = { id: string; code: string; name: string; flag: string | null };
export type GroupRoster = { group: string; teams: TeamInfo[] };

/** Rosters por grupo, derivados de los partidos de fase de grupos. */
export async function getGroupsWithTeams(
  supabase: SupabaseClient<Database>,
): Promise<GroupRoster[]> {
  const { data } = await supabase
    .from("matches")
    .select(
      `group:groups(name),
       home_team:teams!matches_home_team_id_fkey(id, code, name, flag_url),
       away_team:teams!matches_away_team_id_fkey(id, code, name, flag_url)`,
    )
    .not("group_id", "is", null);

  const byGroup = new Map<string, Map<string, TeamInfo>>();
  const add = (g: string, t: { id: string; code: string; name: string; flag_url: string | null } | null) => {
    if (!t) return;
    const roster = byGroup.get(g) ?? new Map<string, TeamInfo>();
    roster.set(t.id, { id: t.id, code: t.code, name: t.name, flag: t.flag_url });
    byGroup.set(g, roster);
  };
  for (const m of data ?? []) {
    const g = m.group?.name;
    if (!g) continue;
    add(g, m.home_team);
    add(g, m.away_team);
  }

  return [...byGroup.entries()]
    .map(([group, roster]) => ({
      group,
      teams: [...roster.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

/** Mapa de todas las selecciones por id (para resolver el cuadro en la UI). */
export async function getTeamsMap(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, TeamInfo>> {
  const { data } = await supabase.from("teams").select("id, code, name, flag_url");
  const map: Record<string, TeamInfo> = {};
  for (const t of data ?? []) map[t.id] = { id: t.id, code: t.code, name: t.name, flag: t.flag_url };
  return map;
}

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

/** Estado de la simulación del usuario (o vacío). */
export async function getSimState(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SimState> {
  const sim = await getExistingSimulation(supabase, userId);
  if (!sim) return emptyState();
  const { data } = await supabase.from("simulations").select("state").eq("id", sim.id).single();
  const raw = (data?.state ?? {}) as Partial<SimState>;
  return {
    groupOrder: raw.groupOrder ?? {},
    thirds: raw.thirds ?? [],
    ko: raw.ko ?? {},
  };
}
