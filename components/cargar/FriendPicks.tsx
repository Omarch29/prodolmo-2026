import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { FriendPick } from "@/lib/queries/cargar";
import type { TeamLite } from "@/lib/queries/dashboard";

export function FriendPicks({
  picks,
  title,
  reveal,
  home,
  away,
}: {
  picks: FriendPick[];
  title: string;
  reveal: boolean;
  home: TeamLite;
  away: TeamLite;
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
          return (
            <li
              key={p.userId}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0",
                hit && "bg-pitch-green-darker",
              )}
            >
              <Link href={`/jugador/${p.userId}`} className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar name={p.displayName} src={p.avatarUrl} size={28} />
                <span className="font-body text-sm text-line-white truncate">{p.displayName}</span>
              </Link>
              <span className="flex items-center gap-1 font-mono text-card-yellow text-lg shrink-0">
                <Flag flag={home.flag} size={16} />
                {p.home}-{p.away}
                <Flag flag={away.flag} size={16} />
              </span>
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
