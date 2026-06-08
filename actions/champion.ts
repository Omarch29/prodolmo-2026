"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTournamentStart, isChampionEditable } from "@/lib/queries/champion";

export type ChampionState = { error: string | null; ok?: boolean };

const schema = z.object({ teamId: z.string().uuid() });

/** Guarda (o cambia) el campeón elegido. Permitido mientras el Mundial no arrancó. */
export async function setChampion(_prev: ChampionState, formData: FormData): Promise<ChampionState> {
  const parsed = schema.safeParse({ teamId: formData.get("teamId") });
  if (!parsed.success) return { error: "Elegí una selección." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  // Revalidar elegibilidad en el backend: solo antes del inicio del Mundial.
  const start = await getTournamentStart(supabase);
  if (!isChampionEditable(start)) {
    return { error: "Ya no se puede cambiar el campeón (el Mundial arrancó)." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ champion_team_id: parsed.data.teamId })
    .eq("id", user.id);
  if (error) return { error: "No se pudo guardar el campeón." };

  revalidatePath("/", "layout");
  return { error: null, ok: true };
}
