"use client";

import { useState } from "react";
import { ChampionPicker } from "./ChampionPicker";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { TeamOption } from "@/lib/queries/champion";

/**
 * Bloque de campeón en el detalle propio: muestra el campeón elegido y permite
 * cambiarlo mientras el Mundial no arrancó (botón "Modificar"). Una vez arrancado,
 * el botón queda deshabilitado y el campeón fijo.
 */
export function ChampionSection({
  champion,
  teams,
  changeable,
}: {
  champion: { flag: string | null; name: string } | null;
  teams: TeamOption[];
  changeable: boolean;
}) {
  // Si no eligió y todavía puede, abrimos el picker directamente.
  const [editing, setEditing] = useState(!champion && changeable);

  return (
    <div className="flex flex-col gap-2 p-4 border-b-[2px] border-scoreboard-slate">
      <div className="font-display text-[10px] tracking-[1px] text-line-white">🏆 TU CAMPEÓN</div>

      {champion && (
        <div className="flex items-center gap-2">
          <Flag flag={champion.flag} size={22} />
          <span className="font-body text-sm text-line-white flex-1">{champion.name}</span>
          {!editing && (
            <button
              type="button"
              disabled={!changeable}
              onClick={() => setEditing(true)}
              className={cn(
                "font-display text-[8px] tracking-[1px] border-pixel px-2.5 py-2",
                changeable
                  ? "bg-card-yellow text-ink shadow-pixel-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed"
                  : "bg-scoreboard-slate text-grey-500 cursor-not-allowed",
              )}
            >
              ✎ MODIFICAR
            </button>
          )}
        </div>
      )}

      {!champion && !changeable && (
        <p className="font-body text-sm text-grey-400">No elegiste campeón.</p>
      )}

      {editing && changeable && (
        <>
          <p className="font-body text-xs text-grey-300">
            {champion ? "Elegí otro campeón" : "Elegí tu campeón"} · solo hasta que arranque el
            Mundial · <span className="text-card-yellow">+20</span> si acertás.
          </p>
          <ChampionPicker teams={teams} onSuccess={() => setEditing(false)} />
        </>
      )}
    </div>
  );
}
