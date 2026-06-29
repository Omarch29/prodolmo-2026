import Link from "next/link";
import { AvatarHoverCard } from "@/components/ui/AvatarHoverCard";
import { Flag } from "@/components/ui/Flag";
import { AdvancesBadge, resolveAdvancingTeam } from "@/components/cargar/AdvancesBadge";
import { cn } from "@/lib/utils";
import type { FriendPick } from "@/lib/queries/cargar";
import type { TeamLite } from "@/lib/queries/dashboard";

export function FriendPicks({
  picks,
  title,
  reveal,
  home,
  away,
  homeTeamId,
  awayTeamId,
}: {
  picks: FriendPick[];
  title: string;
  reveal: boolean;
  home: TeamLite;
  away: TeamLite;
  homeTeamId: string | null;
  awayTeamId: string | null;
}) {
  if (picks.length === 0) return null;

  return (
    <section className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
      <div className="font-display text-[9px] tracking-[1px] text-line-white px-3 py-2 border-b-[3px] border-border">
        👥 {title}
      </div>
      <ul>
        {picks.map((p) => {
          const hit = reveal && (p.points ?? 0) > 0;
          // En empate de eliminatoria, a quién eligió que pase de ronda.
          const advancing =
            p.home === p.away
              ? resolveAdvancingTeam(p.winnerTeamId, homeTeamId, awayTeamId, home, away)
              : null;
          return (
            <li
              key={p.userId}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0",
                hit && "bg-pitch-green-darker",
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AvatarHoverCard userId={p.userId} name={p.displayName} avatarUrl={p.avatarUrl} size={28} />
                <Link
                  href={`/jugador/${p.userId}`}
                  className="font-body text-sm text-line-white truncate hover:underline"
                >
                  {p.displayName}
                </Link>
              </div>
              <span className="flex items-center gap-1 font-mono text-card-yellow text-lg shrink-0">
                <Flag flag={home.flag} size={16} />
                {p.home}-{p.away}
                <Flag flag={away.flag} size={16} />
              </span>
              {advancing && <AdvancesBadge team={advancing} className="shrink-0" />}
              {reveal && (
                <span
                  className={cn(
                    "font-display text-[8px] border-pixel px-1.5 py-1 shrink-0",
                    (p.points ?? 0) > 0 ? "bg-pitch-green-light text-ink" : "bg-scoreboard-slate text-grey-300",
                  )}
                >
                  {p.points && p.points > 0 ? `+${p.points}` : "0"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
