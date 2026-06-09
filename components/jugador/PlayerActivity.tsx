import Link from "next/link";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import type { PredictionActivity, CommentActivity } from "@/lib/queries/activity";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));

/** Chip compacto de un pronóstico: banderitas + marcador, teñido por acierto. */
function PredChip({ p }: { p: PredictionActivity }) {
  const tint = !p.finished
    ? "bg-scoreboard-ink text-grey-300"
    : (p.points ?? 0) > 0
      ? "bg-pitch-green-darker text-line-white"
      : "bg-scoreboard-slate text-grey-400";
  return (
    <Link
      href={`/cargar/${p.matchId}`}
      title={`${p.home.code} ${p.predHome}-${p.predAway} ${p.away.code}`}
      className={cn("flex items-center gap-1 border-pixel px-1.5 py-1", tint)}
    >
      <Flag flag={p.home.flag} size={14} />
      <span className="font-mono text-sm leading-none">
        {p.predHome}-{p.predAway}
      </span>
      <Flag flag={p.away.flag} size={14} />
      {p.finished && (p.points ?? 0) > 0 && (
        <span className="font-display text-[7px] text-pitch-green-lighter">+{p.points}</span>
      )}
    </Link>
  );
}

/** Actividad del jugador: todos sus pronósticos (con banderitas) + últimos comentarios. */
export function PlayerActivity({
  predictions,
  comments,
}: {
  predictions: PredictionActivity[];
  comments: CommentActivity[];
}) {
  if (predictions.length === 0 && comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8">
      {predictions.length > 0 && (
        <section>
          <div className="font-display text-[10px] tracking-[1px] text-line-white mb-2">
            🗳️ PRONÓSTICOS <span className="text-grey-400">({predictions.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {predictions.map((p) => (
              <PredChip key={p.matchId} p={p} />
            ))}
          </div>
        </section>
      )}

      {comments.length > 0 && (
        <section>
          <div className="font-display text-[10px] tracking-[1px] text-line-white mb-2">
            💬 ÚLTIMOS COMENTARIOS
          </div>
          <ul className="bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
            {comments.map((c) => (
              <li key={c.id} className="border-b-[2px] border-scoreboard-slate last:border-b-0">
                <Link href={`/cargar/${c.matchId}`} className="flex items-center gap-2 px-3 py-2">
                  <span className="flex items-center gap-1 shrink-0">
                    <Flag flag={c.home.flag} size={14} />
                    <span className="font-display text-[7px] text-grey-400">{c.home.code}-{c.away.code}</span>
                    <Flag flag={c.away.flag} size={14} />
                  </span>
                  <p className="font-body text-xs text-line-white flex-1 truncate">{c.body}</p>
                  <span className="font-body text-[10px] text-grey-500 shrink-0">{fmtDate(c.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
