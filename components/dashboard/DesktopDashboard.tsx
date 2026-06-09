import Link from "next/link";
import { AvatarHoverCard } from "@/components/ui/AvatarHoverCard";
import { NextMatchCard } from "@/components/dashboard/NextMatchCard";
import { DailyMessages } from "@/components/dashboard/DailyMessages";
import { cn } from "@/lib/utils";
import type { NextMatch, DailyMessage } from "@/lib/queries/dashboard";
import type { StandingRow } from "@/lib/queries/standings";

const STRIPES = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 60px, rgba(255,255,255,0.06) 60px 120px)",
};

function StatChip({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex flex-col items-center bg-scoreboard-ink border-pixel shadow-pixel-xs px-3 py-1.5">
      <span className="font-display text-[7px] tracking-[1px] text-card-yellow">{label}</span>
      <span className={cn("font-mono text-3xl leading-none mt-0.5", valueClass)}>{value}</span>
    </div>
  );
}

function MiniStanding({
  standings,
  currentUserId,
}: {
  standings: StandingRow[];
  currentUserId: string;
}) {
  return (
    <div className="border-pixel-thick shadow-pixel">
      <div className="bg-scoreboard-ink text-card-yellow font-display text-[9px] tracking-[1px] px-3 py-2 flex items-center gap-2 border-b-[3px] border-border">
        🏆 TABLA
        <span className="ml-auto text-grey-300 text-[7px]">{standings.length} JUGADORES</span>
      </div>
      {standings.map((r) => (
        <Link
          key={r.userId}
          href={`/jugador/${r.userId}`}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 border-b-[2px] border-scoreboard-slate last:border-b-0",
            r.userId === currentUserId ? "bg-scoreboard-slate" : "bg-scoreboard-black",
          )}
        >
          <span className="w-5 text-center font-display text-[10px] text-grey-300">{r.rank}</span>
          <AvatarHoverCard userId={r.userId} name={r.displayName} avatarUrl={r.avatarUrl} size={24} link={false} />
          <span className="flex-1 truncate font-body text-sm text-line-white">
            {r.displayName}
            {r.rank === 1 ? " 👑" : ""}
          </span>
          {r.delta != null && r.delta !== 0 && (
            <span className={cn("font-display text-[8px]", r.delta > 0 ? "text-pitch-green-lighter" : "text-card-red")}>
              {r.delta > 0 ? `▲${r.delta}` : `▼${Math.abs(r.delta)}`}
            </span>
          )}
          <span className="font-mono text-card-yellow text-lg w-8 text-right">{r.points}</span>
        </Link>
      ))}
    </div>
  );
}

export function DesktopDashboard({
  displayName,
  points,
  rank,
  playerCount,
  nextMatch,
  messages,
  standings,
  currentUserId,
}: {
  displayName: string;
  points: number;
  rank: number;
  playerCount: number;
  nextMatch: NextMatch | null;
  messages: DailyMessage[];
  standings: StandingRow[];
  currentUserId: string;
}) {
  return (
    <div className="hidden md:flex md:flex-col">
      {/* Barra superior */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4 bg-pitch-green border-b-[4px] border-border"
        style={STRIPES}
      >
        <div>
          <div className="font-display text-base text-line-white [text-shadow:2px_2px_0_var(--color-scoreboard-ink)]">
            ¡HOLA, {displayName.toUpperCase()}! 👋
          </div>
          <div className="font-body text-sm text-scoreboard-ink mt-1.5">
            Grupo · {playerCount} jugadores · vas #{rank}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <StatChip label="PUNTOS" value={String(points)} valueClass="text-goal-orange" />
          <StatChip label="PUESTO" value={`#${rank}`} valueClass="text-pitch-green-lighter" />
        </div>
      </div>

      {/* Contenido en 2 columnas */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6 p-6 items-start">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="font-display text-[11px] tracking-[1px] text-line-white">⚽ PRÓXIMO PARTIDO</div>
          {nextMatch ? (
            <NextMatchCard match={nextMatch} bare />
          ) : (
            <div className="bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
              No hay próximos partidos cargados en el fixture.
            </div>
          )}
          <div className="font-display text-[11px] tracking-[1px] text-line-white mt-2">📬 TUS MENSAJES</div>
          <DailyMessages messages={messages} bare showTitle={false} />
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="font-display text-[11px] tracking-[1px] text-line-white">📊 CÓMO VA LA TABLA</div>
          <MiniStanding standings={standings} currentUserId={currentUserId} />
          <Link
            href="/tabla"
            className="font-display text-[9px] tracking-[1px] text-pitch-green-lighter hover:text-line-white self-start"
          >
            VER TABLA COMPLETA ▸
          </Link>
        </div>
      </div>
    </div>
  );
}
