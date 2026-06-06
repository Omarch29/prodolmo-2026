import { cn } from "@/lib/utils";
import type { RoundBreakdown } from "@/lib/queries/player";

function toneClass(pct: number): string {
  if (pct >= 60) return "bg-pitch-green-light";
  if (pct >= 35) return "bg-card-yellow";
  return "bg-card-red";
}

export function RoundBar({ r }: { r: RoundBreakdown }) {
  return (
    <div className="mx-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-display text-[8px] tracking-[1px] text-line-white">
          {r.stageName.toUpperCase()}
        </span>
        {r.pending ? (
          <span className="font-body text-xs text-grey-400">—</span>
        ) : (
          <span className="font-body text-xs text-line-white">
            {r.porcentaje}% <span className="text-grey-400">({r.obtenidos} pts)</span>
          </span>
        )}
      </div>

      <div className="relative h-5 bg-scoreboard-ink border-pixel overflow-hidden">
        {r.pending ? (
          <div className="absolute inset-0 flex items-center px-2 font-display text-[7px] tracking-[1px] text-grey-400 ds-net">
            POR JUGARSE
          </div>
        ) : (
          <>
            <div className={cn("h-full", toneClass(r.porcentaje))} style={{ width: `${r.porcentaje}%` }} />
            {r.porcentaje > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-line-white">
                {r.obtenidos}/{r.maximoPosible}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
