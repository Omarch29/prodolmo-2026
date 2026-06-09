import { describe, it, expect } from "vitest";
import { flagEmojiForCode } from "@/lib/flags/team-flag";

describe("flagEmojiForCode", () => {
  it("deriva la bandera del código FIFA", () => {
    expect(flagEmojiForCode("MEX")).toBe("🇲🇽");
    expect(flagEmojiForCode("RSA")).toBe("🇿🇦");
    expect(flagEmojiForCode("ARG")).toBe("🇦🇷");
  });

  it("es case-insensitive", () => {
    expect(flagEmojiForCode("mex")).toBe("🇲🇽");
  });

  it("usa el emoji propio de las subdivisiones del RU", () => {
    expect(flagEmojiForCode("ENG")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
  });

  it("devuelve '' si no se reconoce o es nulo", () => {
    expect(flagEmojiForCode("TBD")).toBe("");
    expect(flagEmojiForCode(null)).toBe("");
    expect(flagEmojiForCode(undefined)).toBe("");
  });
});
