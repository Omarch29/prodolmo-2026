import type { DailyMessage } from "@/lib/queries/dashboard";

export function DailyMessages({ messages }: { messages: DailyMessage[] }) {
  return (
    <section>
      <div className="px-4 font-display text-[10px] tracking-[1px] text-line-white flex items-center gap-2">
        📬 TUS MENSAJES
      </div>

      {messages.length === 0 ? (
        <div className="mx-4 mt-3 bg-scoreboard-slate border-pixel shadow-pixel-xs p-4 font-body text-sm text-grey-300">
          No hay novedades hoy. Cargá tus pronósticos para no quedarte afuera.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="mx-4 bg-line-white text-ink border-pixel-thick shadow-pixel p-3 font-body text-sm"
            >
              {m.body}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
