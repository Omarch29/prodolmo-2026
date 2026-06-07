import { createClient } from "@/lib/supabase/server";
import { getBracket, getTeamsMap, getExistingSimulation, getSimPicks } from "@/lib/queries/sim";
import { Simulator } from "@/components/sim/Simulator";

export default async function SimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [slots, teams, sim] = await Promise.all([
    getBracket(supabase),
    getTeamsMap(supabase),
    getExistingSimulation(supabase, user.id),
  ]);
  const picks = sim ? await getSimPicks(supabase, sim.id) : {};

  return (
    <div className="md:max-w-2xl md:mx-auto">
      <Simulator slots={slots} teams={teams} initialPicks={picks} />
    </div>
  );
}
