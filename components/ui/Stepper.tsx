"use client";

import { cn } from "@/lib/utils";

/** Selector numérico pixel para cargar marcadores. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div className={cn("inline-flex border-pixel bg-line-white shadow-pixel-xs", disabled && "opacity-60")}>
      <button
        type="button"
        disabled={disabled}
        aria-label="restar"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-12 font-display text-ink text-lg active:bg-grey-200 disabled:cursor-not-allowed"
      >
        –
      </button>
      <div className="w-12 h-12 flex items-center justify-center font-mono text-ink text-3xl border-x-[3px] border-border">
        {value}
      </div>
      <button
        type="button"
        disabled={disabled}
        aria-label="sumar"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-12 font-display text-ink text-lg active:bg-grey-200 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
