import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDailyMessages } from "@/lib/jobs/daily-messages";
import { generateMatchPreviews } from "@/lib/jobs/match-previews";
import { rewriteMessages } from "@/lib/gemini/messages";
import { generatePreview } from "@/lib/gemini/preview";
import { serverEnv } from "@/lib/env";

// Disparado por Vercel Cron (ver vercel.json). Protegido por CRON_SECRET:
// Vercel envía `Authorization: Bearer <CRON_SECRET>` en las requests del cron.
export async function GET(request: NextRequest) {
  const { CRON_SECRET, GEMINI_API_KEY } = serverEnv();
  if (CRON_SECRET && request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const useAi = Boolean(GEMINI_API_KEY);

  // Mensajes del día (IA opcional, con fallback a plantillas).
  const messages = await runDailyMessages(supabase, useAi ? { rewrite: rewriteMessages } : {});

  // Previas de partidos próximos (solo con IA).
  const previews = useAi ? await generateMatchPreviews(supabase, generatePreview) : { generated: 0 };

  return NextResponse.json({ ok: true, ...messages, previews: previews.generated, ai: useAi });
}
