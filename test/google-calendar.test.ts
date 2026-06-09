import { describe, it, expect } from "vitest";
import { googleCalendarUrl } from "@/lib/calendar/google";

describe("googleCalendarUrl", () => {
  const base = {
    homeCode: "ARG",
    awayCode: "BRA",
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

  it("el título es por código y los detalles traen nombres + ronda", () => {
    const params = new URL(googleCalendarUrl(base)).searchParams;
    expect(params.get("text")).toBe("ARG - BRA");
    expect(params.get("details")).toBe("Mundial 2026 · Argentina vs Brasil · Fase de grupos · Fecha 1");
  });

  it("antepone las banderas a cada código en el título", () => {
    const params = new URL(googleCalendarUrl({ ...base, homeFlag: "🇦🇷", awayFlag: "🇧🇷" })).searchParams;
    expect(params.get("text")).toBe("🇦🇷 ARG - 🇧🇷 BRA");
  });

  it("con datos mínimos, el detalle es solo 'Mundial 2026'", () => {
    const params = new URL(
      googleCalendarUrl({ homeCode: "A", awayCode: "B", kickoffISO: base.kickoffISO }),
    ).searchParams;
    expect(params.get("text")).toBe("A - B");
    expect(params.get("details")).toBe("Mundial 2026");
  });
});
