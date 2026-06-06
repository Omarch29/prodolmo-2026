"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSimulation, getExistingSimulation } from "@/lib/queries/sim";

export type SimActionState = { error: string | null };

const savePickSchema = z.object({
  slot: z.string().min(1).max(20),
  teamId: z.string().uuid(),
});

/** Guarda el ganador elegido para un slot del cuadro (upsert por slot). */
export async function saveSimPick(input: {
  slot: string;
  teamId: string;
}): Promise<SimActionState> {
  const parsed = savePickSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const simId = await getOrCreateSimulation(supabase, user.id);

  const { error } = await supabase.from("simulation_picks").upsert(
    {
      simulation_id: simId,
      bracket_slot: parsed.data.slot,
      winner_team_id: parsed.data.teamId,
    },
    { onConflict: "simulation_id,bracket_slot" },
  );
  if (error) return { error: "No se pudo guardar." };

  revalidatePath("/sim");
  return { error: null };
}

/** Reinicia la simulación (borra todos los picks). */
export async function resetSim(): Promise<SimActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const sim = await getExistingSimulation(supabase, user.id);
  if (sim) {
    const { error } = await supabase
      .from("simulation_picks")
      .delete()
      .eq("simulation_id", sim.id);
    if (error) return { error: "No se pudo reiniciar." };
  }

  revalidatePath("/sim");
  return { error: null };
}
