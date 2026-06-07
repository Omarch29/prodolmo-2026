"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSimulation, getExistingSimulation } from "@/lib/queries/sim";

export type SimActionState = { error: string | null };

const simStateSchema = z.object({
  groupOrder: z.record(z.string(), z.array(z.string().uuid()).max(4)),
  thirds: z.record(z.string(), z.string().uuid()),
  ko: z.record(z.string(), z.string().uuid()),
});

/** Guarda el estado completo de la simulación del usuario. */
export async function saveSimState(state: unknown): Promise<SimActionState> {
  const parsed = simStateSchema.safeParse(state);
  if (!parsed.success) return { error: "Estado inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const simId = await getOrCreateSimulation(supabase, user.id);
  const { error } = await supabase.from("simulations").update({ state: parsed.data }).eq("id", simId);
  if (error) return { error: "No se pudo guardar." };

  revalidatePath("/sim");
  return { error: null };
}

/** Reinicia la simulación (estado vacío). */
export async function resetSim(): Promise<SimActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const sim = await getExistingSimulation(supabase, user.id);
  if (sim) {
    const { error } = await supabase.from("simulations").update({ state: {} }).eq("id", sim.id);
    if (error) return { error: "No se pudo reiniciar." };
  }
  revalidatePath("/sim");
  return { error: null };
}
