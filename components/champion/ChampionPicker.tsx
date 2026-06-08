"use client";

import { useActionState, useState } from "react";
import { setChampion, type ChampionState } from "@/actions/champion";
import { Flag } from "@/components/ui/Flag";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TeamOption } from "@/lib/queries/champion";

const initialState: ChampionState = { error: null };

/** Selector de campeón: grilla de selecciones (bandera + código) + confirmar. */
export function ChampionPicker({
  teams,
  onSuccess,
}: {
  teams: TeamOption[];
  onSuccess?: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    async (prev: ChampionState, formData: FormData) => {
      const result = await setChampion(prev, formData);
      if (result.ok) onSuccess?.();
      return result;
    },
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-3 min-h-0">
      <input type="hidden" name="teamId" value={selected ?? ""} />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto p-1 min-h-0">
        {teams.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2 border-pixel",
              selected === t.id ? "bg-pitch-green text-ink" : "bg-scoreboard-black text-grey-300",
            )}
            title={t.name}
          >
            <Flag flag={t.flag} size={28} />
            <span className="font-display text-[7px] truncate w-full text-center">{t.code}</span>
          </button>
        ))}
      </div>
      {state.error && <p className="font-body text-sm text-card-red">{state.error}</p>}
      <Button type="submit" block disabled={!selected || pending}>
        {pending ? "Guardando..." : "🏆 Confirmar campeón"}
      </Button>
    </form>
  );
}
