import { describe, it, expect } from "vitest";
import { countryFlag } from "@/lib/flags/country";

describe("countryFlag", () => {
  it("convierte país conocido a emoji de bandera", () => {
    expect(countryFlag("Argentina")).toBe("🇦🇷");
    expect(countryFlag("Italy")).toBe("🇮🇹");
    expect(countryFlag("United States")).toBe("🇺🇸");
  });
  it("maneja subdivisiones del Reino Unido", () => {
    expect(countryFlag("England")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
  });
  it("acepta variantes de nombre", () => {
    expect(countryFlag("Korea Republic")).toBe(countryFlag("South Korea"));
  });
  it("devuelve null si no lo reconoce", () => {
    expect(countryFlag("Narnia")).toBeNull();
    expect(countryFlag(null)).toBeNull();
  });
});
