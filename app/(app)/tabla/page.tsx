import { createClient } from "@/lib/supabase/server";
import { getStandings } from "@/lib/queries/standings";
import { LeaderboardRow } from "@/components/tabla/LeaderboardRow";

export default async function TablaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const standings = await getStandings(supabase);
  const me = standings.find((s) => s.userId === user.id);

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <header className="flex items-center justify-between bg-scoreboard-black border-b-[4px] border-border px-4 py-3">
        <span className="font-display text-line-white text-sm flex items-center gap-2">🏆 TABLA</span>
        <span className="font-mono text-2xl text-ink bg-card-yellow border-pixel shadow-pixel-xs px-2.5 leading-relaxed">
          {me?.points ?? 0}
        </span>
      </header>

      <div className="flex flex-col gap-2 py-5">
        <div className="px-4 font-display text-[10px] tracking-[1px] text-line-white flex items-center justify-between">
          <span>🏆 GRUPO</span>
          <span className="text-grey-400 text-[8px]">{standings.length} JUGADORES</span>
        </div>

        {standings.map((row) => (
          <LeaderboardRow key={row.userId} row={row} isMe={row.userId === user.id} />
        ))}

        <p className="px-4 text-center font-body text-xs text-grey-400 mt-2">
          Tocá un jugador para ver su desglose por ronda ▸
        </p>
      </div>
    </div>
  );
}
