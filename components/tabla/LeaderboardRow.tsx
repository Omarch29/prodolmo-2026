import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { StandingRow } from "@/lib/queries/standings";

const MEDAL: Record<number, string> = {
  1: "bg-card-yellow text-ink",
  2: "bg-grey-300 text-ink",
  3: "bg-goal-orange text-ink",
};

export function LeaderboardRow({ row, isMe }: { row: StandingRow; isMe: boolean }) {
  return (
    <Link
      href={`/jugador/${row.userId}`}
      className={cn(
        "mx-4 flex items-center gap-3 bg-scoreboard-black border-pixel-thick shadow-pixel-sm px-3 py-2.5",
        isMe && "outline outline-2 outline-dashed outline-goal-orange outline-offset-[-2px]",
      )}
    >
      <span
        className={cn(
          "w-7 h-7 shrink-0 flex items-center justify-center font-display text-[11px] border-pixel",
          MEDAL[row.rank] ?? "bg-scoreboard-slate text-line-white",
        )}
      >
        {row.rank}
      </span>

      <Avatar name={row.displayName} src={row.avatarUrl} size={32} />

      <span className="flex-1 min-w-0">
        <span className="font-body text-sm text-line-white truncate block">
          {row.displayName}
          {row.esBot ? " 🤖" : ""}
          {row.rank === 1 ? " 👑" : ""}
          {isMe ? " (vos)" : ""}
          {row.delta != null && row.delta !== 0 && (
            <span className={cn("ml-1.5 font-display text-[8px]", row.delta > 0 ? "text-pitch-green-lighter" : "text-card-red")}>
              {row.delta > 0 ? `▲${row.delta}` : `▼${Math.abs(row.delta)}`}
            </span>
          )}
        </span>
        <span className="font-body text-[11px] text-grey-400">
          {row.plenos} plenos · {row.aciertos} aciertos
        </span>
      </span>

      <span className="font-mono text-card-yellow text-2xl bg-scoreboard-ink border-pixel px-2 shrink-0">
        {row.points}
      </span>
    </Link>
  );
}
