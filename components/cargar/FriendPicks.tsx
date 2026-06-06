import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { FriendPick } from "@/lib/queries/cargar";

export function FriendPicks({
  picks,
  title,
  reveal,
}: {
  picks: FriendPick[];
  title: string;
  reveal: boolean;
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
              key={p.displayName}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0",
                hit && "bg-pitch-green-darker",
              )}
            >
              <Avatar name={p.displayName} size={28} />
              <span className="font-body text-sm text-line-white flex-1 truncate">{p.displayName}</span>
              <span className="font-mono text-card-yellow text-lg">
                {p.home}-{p.away}
              </span>
              {reveal && (
                <span
                  className={cn(
                    "font-display text-[8px] border-pixel px-1.5 py-1",
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
