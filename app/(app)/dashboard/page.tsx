import { createClient } from "@/lib/supabase/server";
import { getStandings } from "@/lib/queries/standings";
import { getNextMatch, getDailyMessages } from "@/lib/queries/dashboard";
import { HeroHeader } from "@/components/dashboard/HeroHeader";
import { NextMatchCard } from "@/components/dashboard/NextMatchCard";
import { DailyMessages } from "@/components/dashboard/DailyMessages";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // el layout protegido ya garantiza sesión

  const [standings, nextMatch, messages] = await Promise.all([
    getStandings(supabase),
    getNextMatch(supabase, user.id),
    getDailyMessages(supabase, user.id),
  ]);

  const me = standings.find((s) => s.userId === user.id);

  return (
    <div>
      <HeroHeader
        displayName={me?.displayName ?? "Jugador"}
        points={me?.points ?? 0}
        rank={me?.rank ?? standings.length}
        playerCount={standings.length}
      />

      <div className="flex flex-col gap-5 py-5">
        {nextMatch ? (
          <NextMatchCard match={nextMatch} />
        ) : (
          <div className="mx-4 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
            No hay próximos partidos cargados en el fixture.
          </div>
        )}

        <DailyMessages messages={messages} />
      </div>
    </div>
  );
}
