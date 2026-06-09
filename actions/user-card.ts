"use server";

import { createClient } from "@/lib/supabase/server";
import { getStandings } from "@/lib/queries/standings";

export type UserCard = {
  displayName: string;
  avatarUrl: string | null;
  points: number;
  rank: number;
  champion: { name: string; flag: string | null } | null;
};

/** Datos para el panel hover de un avatar: puntos, puesto y campeón elegido. */
export async function getUserCard(userId: string): Promise<UserCard | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const standings = await getStandings(supabase);
  const s = standings.find((x) => x.userId === userId);
  if (!s) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("champion:teams!profiles_champion_team_id_fkey(name, flag_url)")
    .eq("id", userId)
    .maybeSingle();

  return {
    displayName: s.displayName,
    avatarUrl: s.avatarUrl ?? null,
    points: s.points,
    rank: s.rank,
    champion: profile?.champion
      ? { name: profile.champion.name, flag: profile.champion.flag_url }
      : null,
  };
}
