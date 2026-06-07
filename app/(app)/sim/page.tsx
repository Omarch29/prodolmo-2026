import { createClient } from "@/lib/supabase/server";
import { getGroupsWithTeams, getTeamsMap, getSimState } from "@/lib/queries/sim";
import { Simulator } from "@/components/sim/Simulator";

export default async function SimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [groups, teams, state] = await Promise.all([
    getGroupsWithTeams(supabase),
    getTeamsMap(supabase),
    getSimState(supabase, user.id),
  ]);

  return (
    <div className="md:max-w-2xl lg:max-w-5xl md:mx-auto">
      <Simulator groups={groups} teams={teams} initial={state} />
    </div>
  );
}
