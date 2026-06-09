/**
 * Arma el link "Agregar al Google Calendar" para un partido.
 * Lógica pura (sin red ni DOM) — testeada en test/google-calendar.test.ts.
 *
 * Google acepta un evento por querystring en /calendar/render?action=TEMPLATE
 * con `dates=<inicio>/<fin>` en UTC compacto (YYYYMMDDTHHMMSSZ).
 */
export type MatchCalendarEvent = {
  homeCode: string;
  awayCode: string;
  /** Emoji de bandera (opcional) para anteponer al código en el título. */
  homeFlag?: string;
  awayFlag?: string;
  /** Nombres completos (opcional) para la descripción del evento. */
  homeName?: string;
  awayName?: string;
  /** Kickoff en ISO (timestamptz UTC). */
  kickoffISO: string;
  stageName?: string;
  matchday?: number | null;
  /** Duración del evento en minutos (default 120). */
  durationMinutes?: number;
};

/** Date → "YYYYMMDDTHHMMSSZ" (UTC, sin guiones/dos-puntos/milisegundos). */
function toCompactUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(ev: MatchCalendarEvent): string {
  const start = new Date(ev.kickoffISO);
  const end = new Date(start.getTime() + (ev.durationMinutes ?? 120) * 60_000);

  // Título compacto y fácil de identificar: [bandera] CODE - [bandera] CODE.
  const h = ev.homeFlag ? `${ev.homeFlag} ${ev.homeCode}` : ev.homeCode;
  const a = ev.awayFlag ? `${ev.awayFlag} ${ev.awayCode}` : ev.awayCode;
  const title = `${h} - ${a}`;
  const matchup = ev.homeName && ev.awayName ? `${ev.homeName} vs ${ev.awayName}` : null;
  const details = ["Mundial 2026", matchup, ev.stageName, ev.matchday ? `Fecha ${ev.matchday}` : null]
    .filter((p): p is string => Boolean(p))
    .join(" · ");

  const params = new URLSearchParams({ action: "TEMPLATE", text: title });
  if (details) params.set("details", details);

  // `dates` se concatena aparte para no encodear la barra (Google la quiere literal).
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${toCompactUtc(
    start,
  )}/${toCompactUtc(end)}`;
}
