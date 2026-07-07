import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { AppFx } from "@/components/fx/AppFx";
import { ChampionPrompt } from "@/components/champion/ChampionPrompt";
import { WinnerModal, type Winner } from "@/components/champion/WinnerModal";
import {
  getTournamentStart,
  getTeamsList,
  isChampionEditable,
  getActualChampion,
} from "@/lib/queries/champion";
import { getStandings } from "@/lib/queries/standings";
import { pickWinners } from "@/lib/standings/rank";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defensa además del middleware.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, champion_team_id")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? "Jugador";

  // ¿Mostrar el modal de campeón? Solo a quien todavía no eligió y el Mundial no arrancó.
  // (Cambiar uno ya elegido se hace desde el detalle del jugador, no por el modal).
  const start = await getTournamentStart(supabase);
  const canPickChampion =
    (profile?.champion_team_id ?? null) === null && isChampionEditable(start);
  const teams = canPickChampion ? await getTeamsList(supabase) : [];

  // ¿Terminó el mundial? => consagrar al/los campeón(es) del prode en cada visita.
  const tournamentOver = (await getActualChampion(supabase)) !== null;
  let winners: Winner[] = [];
  if (tournamentOver) {
    const standings = await getStandings(supabase);
    winners = pickWinners(standings).map((w) => ({
      userId: w.userId,
      displayName: w.displayName,
      avatarUrl: w.avatarUrl ?? null,
      points: w.points,
    }));
  }

  return (
    // En desktop: sidebar fijo + área de contenido ancha (el bloque se acota y
    // centra en pantallas muy grandes). Cada pantalla maneja su propio layout.
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <AppFx />
      {canPickChampion && <ChampionPrompt teams={teams} />}
      {winners.length > 0 && <WinnerModal winners={winners} />}
      <Sidebar displayName={displayName} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
