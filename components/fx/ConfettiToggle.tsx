"use client";

import { useConfetti, toggleConfetti } from "./useConfetti";
import { cn } from "@/lib/utils";

/** Botón para activar/desactivar los papelitos. */
export function ConfettiToggle() {
  const on = useConfetti();
  return (
    <button
      type="button"
      onClick={toggleConfetti}
      aria-pressed={on}
      title={on ? "Papelitos activados" : "Papelitos desactivados"}
      className={cn(
        "flex items-center gap-2 px-3 py-2 font-display text-[8px] tracking-[1px] border-pixel",
        on ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-grey-400",
      )}
    >
      <span className={on ? "" : "grayscale opacity-60"}>🎉</span>
      CONFETI: {on ? "ON" : "OFF"}
    </button>
  );
}
