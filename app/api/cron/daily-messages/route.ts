import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDailyMessages } from "@/lib/jobs/daily-messages";
import { serverEnv } from "@/lib/env";

// Disparado por Vercel Cron (ver vercel.json). Protegido por CRON_SECRET:
// Vercel envía `Authorization: Bearer <CRON_SECRET>` en las requests del cron.
export async function GET(request: NextRequest) {
  const secret = serverEnv().CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const result = await runDailyMessages(supabase);
  return NextResponse.json({ ok: true, ...result });
}
