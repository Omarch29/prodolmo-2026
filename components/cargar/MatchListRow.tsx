import Link from "next/link";
import { Countdown } from "@/components/ui/Countdown";
import { Flag } from "@/components/ui/Flag";
import { buttonClassName } from "@/components/ui/Button";
import { isPredictionEditable } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { CargarMatch } from "@/lib/queries/cargar";

type RowState = "tbd" | "pend" | "done" | "locked" | "live";

function resolveState(m: CargarMatch): RowState {
  if (!m.playable) return "tbd";
  if (m.status === "in_progress") return "live";
  if (!isPredictionEditable(new Date(m.kickoffAt))) return "locked";
  return m.myPred ? "done" : "pend";
}

const STATE_META: Record<RowState, { chip: string; chipClass: string; cta: string }> = {
  tbd: { chip: "● POR DEFINIR", chipClass: "bg-scoreboard-slate text-grey-300", cta: "" },
  pend: { chip: "● SIN CARGAR", chipClass: "bg-goal-orange text-ink", cta: "Cargar" },
  done: { chip: "✓ CARGADO", chipClass: "bg-pitch-green-light text-ink", cta: "Editar" },
  locked: { chip: "🔒 CERRADO", chipClass: "bg-grey-300 text-ink", cta: "Ver" },
  live: { chip: "🔒 EN JUEGO", chipClass: "bg-card-red text-line-white", cta: "Ver" },
};

const TeamSide = ({
  code,
  flag,
  align,
}: {
  code: string;
  flag: string | null;
  align: "start" | "end";
}) => (
  <span
    className={cn(
      "flex items-center gap-1.5 font-display text-[10px] text-line-white w-24",
      align === "end" && "justify-end",
    )}
  >
    {align === "start" ? (
      <>
        <Flag flag={flag} size={20} />
        {code}
      </>
    ) : (
      <>
        {code}
        <Flag flag={flag} size={20} />
      </>
    )}
  </span>
);

export function MatchListRow({ m }: { m: CargarMatch }) {
  // ---- Jugado (finalizado): resultado real + mi pronóstico + puntos ----
  if (m.status === "finished") {
    const hit = (m.myPoints ?? 0) > 0;
    return (
      <div className="ds-pitch border-pixel-thick shadow-pixel-sm p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-display text-[7px] tracking-[1px] text-line-white">
            {m.stageName}
            {m.matchday ? ` · FECHA ${m.matchday}` : ""}
          </span>
          <span className="font-display text-[7px] tracking-[0.5px] border-pixel px-1.5 py-1 bg-pitch-green-light text-ink">
            ✓ JUGADO
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <TeamSide code={m.home.code} flag={m.home.flag} align="start" />
          <span className="font-mono text-card-yellow text-2xl whitespace-nowrap bg-scoreboard-ink border-pixel px-2">
            {m.homeScore}-{m.awayScore}
          </span>
          <TeamSide code={m.away.code} flag={m.away.flag} align="end" />
        </div>

        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="font-body text-xs text-line-white">
            {m.myPred ? (
              <>
                Vos: <span className="font-mono text-base">{m.myPred.home}-{m.myPred.away}</span>
              </>
            ) : (
              <span className="text-line-white/70">No cargaste</span>
            )}
          </span>
          <span className="flex items-center gap-2">
            {m.myPred && (
              <span
                className={cn(
                  "font-display text-[8px] border-pixel px-1.5 py-1",
                  hit ? "bg-pitch-green-light text-ink" : "bg-scoreboard-slate text-grey-300",
                )}
              >
                {m.myPoints && m.myPoints > 0 ? `+${m.myPoints}` : "0"}
              </span>
            )}
            <Link href={`/cargar/${m.id}`} className={buttonClassName({ size: "sm", variant: "ghost" })}>
              Ver
            </Link>
          </span>
        </div>
      </div>
    );
  }

  // ---- Por jugar / en curso / por definir ----
  const state = resolveState(m);
  const meta = STATE_META[state];
  const ctaVariant = state === "pend" ? "primary" : state === "done" ? "secondary" : "ghost";

  return (
    <div className="ds-pitch border-pixel-thick shadow-pixel-sm p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-display text-[7px] tracking-[1px] text-line-white">
          {m.stageName}
          {m.matchday ? ` · FECHA ${m.matchday}` : ""}
        </span>
        <span className={cn("font-display text-[7px] tracking-[0.5px] border-pixel px-1.5 py-1", meta.chipClass)}>
          {meta.chip}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamSide code={m.home.code} flag={m.home.flag} align="start" />
        <span className="font-mono text-card-yellow text-2xl whitespace-nowrap">
          {m.myPred ? `${m.myPred.home} - ${m.myPred.away}` : "+ / +"}
        </span>
        <TeamSide code={m.away.code} flag={m.away.flag} align="end" />
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <Countdown target={m.kickoffAt} />
        {meta.cta && (
          <Link href={`/cargar/${m.id}`} className={buttonClassName({ size: "sm", variant: ctaVariant })}>
            {meta.cta}
          </Link>
        )}
      </div>
    </div>
  );
}
