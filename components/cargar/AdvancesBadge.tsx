import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { TeamLite } from "@/lib/queries/dashboard";

/**
 * Indicador de "quién pasa de ronda" elegido en un pronóstico de empate
 * (eliminatorias, desde Ronda de 32). Se muestra junto al marcador, tanto en
 * el pronóstico propio ya cerrado como en los del resto del grupo.
 *
 * Componente puramente presentacional: se usa tanto en RSC como en componentes
 * de cliente.
 */
export function AdvancesBadge({ team, className }: { team: TeamLite; className?: string }) {
  return (
    <span
      title={`Pasa de ronda: ${team.name}`}
      className={cn(
        "inline-flex items-center gap-1 font-display text-[8px] tracking-[1px] border-pixel px-1.5 py-1 bg-scoreboard-slate text-card-yellow",
        className,
      )}
    >
      <span className="text-grey-300">PASA</span>
      <Flag flag={team.flag} size={14} />
      {team.code}
    </span>
  );
}

/** Resuelve el equipo elegido (home/away) a partir del id ganador en empate. */
export function resolveAdvancingTeam(
  winnerTeamId: string | null,
  homeTeamId: string | null,
  awayTeamId: string | null,
  home: TeamLite,
  away: TeamLite,
): TeamLite | null {
  if (!winnerTeamId) return null;
  if (winnerTeamId === homeTeamId) return home;
  if (winnerTeamId === awayTeamId) return away;
  return null;
}
