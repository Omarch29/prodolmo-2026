import { describe, it, expect } from "vitest";
import { googleCalendarUrl } from "@/lib/calendar/google";

describe("googleCalendarUrl", () => {
  const base = {
    homeName: "Argentina",
    awayName: "Brasil",
    kickoffISO: "2026-06-11T16:00:00.000Z",
    stageName: "Fase de grupos",
    matchday: 1,
  };

  it("apunta al render de Google con action=TEMPLATE", () => {
    const url = googleCalendarUrl(base);
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(url).toContain("action=TEMPLATE");
  });

  it("usa el kickoff y suma 2h por defecto, en UTC compacto", () => {
    const url = googleCalendarUrl(base);
    expect(url).toContain("dates=20260611T160000Z/20260611T180000Z");
  });

  it("respeta una duración custom", () => {
    const url = googleCalendarUrl({ ...base, durationMinutes: 90 });
    expect(url).toContain("dates=20260611T160000Z/20260611T173000Z");
  });

  it("incluye el título y los detalles (ronda + fecha)", () => {
    const params = new URL(googleCalendarUrl(base)).searchParams;
    expect(params.get("text")).toBe("Argentina vs Brasil — Mundial 2026");
    expect(params.get("details")).toBe("Fase de grupos · Fecha 1");
  });

  it("omite details si no hay ronda ni fecha", () => {
    const params = new URL(
      googleCalendarUrl({ homeName: "A", awayName: "B", kickoffISO: base.kickoffISO }),
    ).searchParams;
    expect(params.has("details")).toBe(false);
  });
});
