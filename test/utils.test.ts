import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("une clases", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });
  it("filtra valores falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
  it("permite condicionales", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "on", disabled && "off")).toBe("base on");
  });
});
