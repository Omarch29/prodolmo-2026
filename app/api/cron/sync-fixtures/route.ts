import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFixtures } from "@/lib/jobs/sync-fixtures";
import { getFootballDataClient } from "@/lib/integrations/football-data/client";
import { serverEnv } from "@/lib/env";

export const maxDuration = 60;

// Sincroniza fixture/resultados desde football-data.org. Disparado por Vercel
// Cron (ver vercel.json) o manualmente. Protegido por CRON_SECRET.
export async function GET(request: NextRequest) {
  const { CRON_SECRET, FOOTBALL_DATA_TOKEN } = serverEnv();
  if (CRON_SECRET && request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!FOOTBALL_DATA_TOKEN) {
    return NextResponse.json({ ok: false, reason: "FOOTBALL_DATA_TOKEN no configurado" });
  }

  const supabase = createAdminClient();
  try {
    const result = await syncFixtures(supabase, getFootballDataClient());
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "error" },
      { status: 502 },
    );
  }
}
