import { cn } from "@/lib/utils";
import type { DailyMessage } from "@/lib/queries/dashboard";

export function DailyMessages({
  messages,
  bare = false,
  showTitle = true,
}: {
  messages: DailyMessage[];
  bare?: boolean;
  showTitle?: boolean;
}) {
  const mx = bare ? "" : "mx-4";

  return (
    <section>
      {showTitle && (
        <div className={cn("font-display text-[10px] tracking-[1px] text-line-white flex items-center gap-2", bare ? "" : "px-4")}>
          📬 TUS MENSAJES
        </div>
      )}

      {messages.length === 0 ? (
        <div className={cn(mx, "mt-3 bg-scoreboard-slate border-pixel shadow-pixel-xs p-4 font-body text-sm text-grey-300")}>
          No hay novedades hoy. Cargá tus pronósticos para no quedarte afuera.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                mx,
                "bg-line-white text-ink border-pixel-thick border-l-[6px] border-l-goal-orange shadow-pixel p-3 font-body text-sm",
              )}
            >
              {m.body}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
