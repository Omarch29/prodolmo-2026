"use client";

import { useConfirmSave, toggleConfirmSave } from "./useConfirmSave";
import { cn } from "@/lib/utils";

/**
 * Toggle discreto "Confirmar guardar". ON = pide confirmación al guardar un
 * pronóstico; OFF = guarda directo. (En la rama fun, ese paso es el modal de
 * los personajes; el nombre es a propósito poco evidente.)
 */
export function ConfirmSaveToggle() {
  const on = useConfirmSave();
  return (
    <button
      type="button"
      onClick={toggleConfirmSave}
      aria-pressed={on}
      title={on ? "Confirmar antes de guardar" : "Guardar sin confirmar"}
      className={cn(
        "flex items-center gap-2 px-3 py-2 font-display text-[8px] tracking-[1px] border-pixel",
        on ? "bg-card-yellow text-ink" : "bg-scoreboard-slate text-grey-400",
      )}
    >
      <span className={on ? "" : "grayscale opacity-60"}>💾</span>
      CONFIRMAR GUARDAR: {on ? "ON" : "OFF"}
    </button>
  );
}
