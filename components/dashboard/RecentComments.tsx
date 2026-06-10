import Link from "next/link";
import { AvatarHoverCard } from "@/components/ui/AvatarHoverCard";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { RecentComment } from "@/lib/queries/activity";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

/** Feed de los últimos comentarios del grupo (para el inicio). */
export function RecentComments({
  comments,
  bare = false,
  showTitle = true,
}: {
  comments: RecentComment[];
  bare?: boolean;
  showTitle?: boolean;
}) {
  if (comments.length === 0) return null;
  const mx = bare ? "" : "mx-4";

  return (
    <section>
      {showTitle && (
        <div
          className={cn(
            "font-display text-[10px] tracking-[1px] text-line-white",
            bare ? "" : "px-4",
          )}
        >
          💬 ÚLTIMOS COMENTARIOS
        </div>
      )}

      <ul className={cn(mx, "mt-3 bg-scoreboard-black border-pixel-thick shadow-pixel-sm")}>
        {comments.map((c) => (
          <li key={c.id} className="flex gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0">
            <AvatarHoverCard userId={c.authorId} name={c.author} avatarUrl={c.avatarUrl} size={28} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-body text-[11px] text-grey-400">
                <Link href={`/jugador/${c.authorId}`} className="text-line-white font-semibold hover:underline truncate">
                  {c.author}
                </Link>
                <Link href={`/cargar/${c.matchId}`} className="flex items-center gap-1 shrink-0 hover:underline">
                  <Flag flag={c.home.flag} size={12} />
                  {c.home.code}-{c.away.code}
                  <Flag flag={c.away.flag} size={12} />
                </Link>
                <span className="ml-auto shrink-0 text-grey-500">{fmtDate(c.createdAt)}</span>
              </div>
              <Link href={`/cargar/${c.matchId}`} className="block">
                <p className="font-body text-sm text-line-white line-clamp-2 break-words">{c.body}</p>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
