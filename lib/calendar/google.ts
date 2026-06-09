/**
 * Arma el link "Agregar al Google Calendar" para un partido.
 * Lógica pura (sin red ni DOM) — testeada en test/google-calendar.test.ts.
 *
 * Google acepta un evento por querystring en /calendar/render?action=TEMPLATE
 * con `dates=<inicio>/<fin>` en UTC compacto (YYYYMMDDTHHMMSSZ).
 */
export type MatchCalendarEvent = {
  homeName: string;
  awayName: string;
  /** Emoji de bandera (opcional) para anteponer al nombre en el título. */
  homeFlag?: string;
  awayFlag?: string;
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

  const h = ev.homeFlag ? `${ev.homeFlag} ${ev.homeName}` : ev.homeName;
  const a = ev.awayFlag ? `${ev.awayFlag} ${ev.awayName}` : ev.awayName;
  const title = `${h} vs ${a} — Mundial 2026`;
  const details = [ev.stageName, ev.matchday ? `Fecha ${ev.matchday}` : null]
    .filter((p): p is string => Boolean(p))
    .join(" · ");

  const params = new URLSearchParams({ action: "TEMPLATE", text: title });
  if (details) params.set("details", details);

  // `dates` se concatena aparte para no encodear la barra (Google la quiere literal).
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${toCompactUtc(
    start,
  )}/${toCompactUtc(end)}`;
}
