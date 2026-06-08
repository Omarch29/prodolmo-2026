"use client";

import { useState } from "react";
import { ChampionPicker } from "./ChampionPicker";
import type { TeamOption } from "@/lib/queries/champion";

/**
 * Modal para elegir campeón al loguearse. Se puede posponer ("Más tarde") y
 * reaparece en el próximo login mientras el Mundial no haya arrancado.
 * El layout solo lo renderiza si el usuario aún puede elegir.
 */
export function ChampionPrompt({ teams }: { teams: TeamOption[] }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-scoreboard-ink/85 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-4 flex flex-col gap-3">
        <div className="font-display text-line-white text-sm flex items-center gap-2">🏆 ELEGÍ TU CAMPEÓN</div>
        <div className="flex items-start gap-2 bg-scoreboard-slate border-pixel px-3 py-2">
          <span className="text-lg">⚠️</span>
          <p className="font-body text-xs text-grey-300">
            Solo podés elegir campeón <strong className="text-line-white">antes de que arranque el Mundial</strong> y{" "}
            <strong className="text-line-white">una sola vez</strong>. Acertarlo suma{" "}
            <strong className="text-card-yellow">+20 puntos</strong>.
          </p>
        </div>
        <ChampionPicker teams={teams} />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="font-body text-xs text-grey-400 underline self-center"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}
